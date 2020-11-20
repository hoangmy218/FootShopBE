const DonHang = require('../models/DonHang.model');
const ChiTietSanPham = require('../models/ChiTietSanPham.model');
const ChiTietDonHang = require('../models/ChiTietDonHang.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const DonGia = require('../models/DonGia.model');
const SanPham = require('../models/SanPham.model');
const GioHang = require('../models/GioHang.model');
const {check, validationResult} = require('express-validator');

exports.donhang_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {   
        var donhang = new DonHang({
            ghichu: request.body.ghichu,
            ngaydat: request.body.ngaydat,
            diachi_id: request.body.diachi_id,
            nguoidung_id: request.payload.username,
            thanhtoan_id: request.body.thanhtoan_id,
            vanchuyen_id: request.body.vanchuyen_id
        });
        console.log(request.body)
        console.log(donhang)
        var dh = await donhang.save();
        console.log(dh)
        var donhang_moi = await DonHang.findById(dh._id).exec();
        var ma_donhang = dh._id;
        //GET SANPHAM - 1 
        var sanpham = request.body.sanpham;
        //GET CART - 2
        var sanpham = await GioHang.find({nguoidung_id: request.payload.username}).exec()
        console.log('gio hang ', sanpham)
        var tongtien = 0;
        var tong_khuyenmai = 0;
        
        
        for(const sanpham_i of sanpham){
            var khuyenmai = 0;
            //CHECK SO LUONG DAT
            var ctsp = await ChiTietSanPham.findById(sanpham_i.ctsp_id).populate('mausanpham_id').exec();
            console.log('sp i', sanpham_i)
            if (ctsp){
                var soluongton = ctsp.soluong;
                var soluongdat = sanpham_i.soluongdat;
                if (soluongton > 0){
                    if (soluongdat > soluongton) {
                        soluongdat =  soluongton
                    }
                    var ma_sanpham = ctsp.mausanpham_id.sanpham_id;
                    //DON GIA
                    var result = await DonGia.find({sanpham_id: ma_sanpham}).sort({ngay: -1}).limit(1).exec();
                    var dongia = result[0].dongia;
                    
                    var thanhtien = soluongdat * dongia;
                    tongtien += thanhtien;
        
                    //CHECK DISCOUNT
                    var sp = await SanPham.findById(ma_sanpham).populate('khuyenmai_id').exec();
                    console.log(sp)

                    if (sp.khuyenmai_id != null){
                        var ngaykt = Date.parse(sp.khuyenmai_id.ngaykt);
                        var ngaybd = Date.parse(sp.khuyenmai_id.ngaybd);
                        var ngayht = Date.now();
                        if (
                            (parseInt((ngaykt-ngayht)/ (1000 * 60 * 60 * 24)) >= 0)
                            && (parseInt((ngayht-ngaybd)/ (1000 * 60 * 60 * 24)) >= 0)){
                            console.log('ngaykt', ngaykt, 'ngayht', ngayht, 'ngaybd', ngaybd)
                            khuyenmai += thanhtien * sp.khuyenmai_id.giamgia / 100;
                            tong_khuyenmai += khuyenmai;
                            console.log('km', khuyenmai)
                        }
                    }
                    
                    
                    //THEM CTDH
                    var ctdh = new ChiTietDonHang({
                        ctsp_id: sanpham_i.ctsp_id,
                        donhang_id: ma_donhang,
                        soluongdat: soluongdat,
                        dongia: dongia,
                        khuyenmai: khuyenmai
                    });
                    console.log('ctsdp i',ctsp)
                    console.log('ctdh', ctdh)
                   
                    
                    var sanpham = await ChiTietSanPham.update({_id: sanpham_i.ctsp_id}, {$set: {soluong: ctsp.soluong - soluongdat }})
                    var ctdh_moi = await ctdh.save();
                    console.log('save',ctdh_moi)
                } 
            }
            
        }
        
        var ctdh_all = await ChiTietDonHang.find({ donhang_id: ma_donhang }).exec();
        console.log('ctdh_all', ctdh_all)
        console.log('tong_km', tong_khuyenmai)
        if (ctdh_all.length > 0){
            var dh_cn = await DonHang.update(
                {_id: ma_donhang},
                {$set: {tongtien: tongtien-tong_khuyenmai}}).exec();
            var dh_moi = await DonHang.findById(ma_donhang).exec();
            console.log('dhmoi', dh_moi)
            response.json({
                success: true,
                message: 'Thêm đơn hàng thành công!',
                data: dh_moi,
                detail: ctdh_all
            });
        }else{
            await DonHang.deleteOne({ _id: ma_donhang}).exec();
            response.json({
                success: false,
                message: 'Hết hàng!'
            });
        }
        await GioHang.deleteMany({nguoidung_id: request.payload.username}).exec()

    } catch (error){
        console.log(error)
        response.json({
            message: error
        });
       
    }
};

//done
exports.donhang_userlist = async(request, response) =>{
    try {
        const result = await DonHang.find({nguoidung_id: request.payload.username}).sort({ngaydat: -1})
            .populate('nguoidung_id').populate('thanhtoan_id').populate('vanchuyen_id').exec();
        response.json({
            data: result
        });
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};


exports.donhang_list = async(request, response)=>{
    try {
        
        const result = await DonHang.find().sort({ngaydat: -1})
            .populate('nguoidung_id').populate('thanhtoan_id').populate('vanchuyen_id').populate('diachi_id').exec();
        response.json({
            data: result
        });
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
}

exports.donhang_confirm = async(request, response)=>{
    try {
        var ma_donhang = request.params.id;
        var result = await DonHang.findById(ma_donhang).exec();
        if (result){
            var nd = await DonHang.update({ _id: ma_donhang}, {$set: {trangthai: 2}}).exec();
            var res = await DonHang.findById(ma_donhang).exec();
            response.json({
                success: true,
                message: 'Xác nhận đơn hàng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Đơn hàng không tồn tại!'
            });
        }
    } catch (error) {
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
}

exports.donhang_ship = async(request, response)=>{
    try {
        var ma_donhang = request.params.id;
        var result = await DonHang.findById(ma_donhang).exec();
        if (result){
            var nd = await DonHang.update({ _id: ma_donhang}, {$set: {trangthai: 3}}).exec();
            var res = await DonHang.findById(ma_donhang).exec();
            response.json({
                success: true,
                message: 'Giao đơn hàng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Đơn hàng không tồn tại!'
            });
        }
    } catch (error) {
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
}

exports.donhang_complete = async(request, response)=>{
    try {
        var ma_donhang = request.params.id;
        var result = await DonHang.findById(ma_donhang).exec();
        if (result){
            var nd = await DonHang.update({ _id: ma_donhang}, {$set: {trangthai: 4}}).exec();
            var res = await DonHang.findById(ma_donhang).exec();
            response.json({
                success: true,
                message: 'Hoàn tất đơn hàng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Đơn hàng không tồn tại!'
            });
        }
    } catch (error) {
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
}

exports.donhang_cancel = async(request, response)=>{
    try {
        var ma_donhang = request.params.id;
        var result = await DonHang.findById(ma_donhang).exec();
        if (result){
            var nd = await DonHang.update({ _id: ma_donhang}, {$set: {trangthai: 5}}).exec();
            var res = await DonHang.findById(ma_donhang).exec();
            response.json({
                success: true,
                message: 'Hủy đơn hàng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Đơn hàng không tồn tại!'
            });
        }
    } catch (error) {
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
}

exports.donhang_get = async(request, response)=>{
    try{
        var ma_donhang = request.params.id;
        const result = await DonHang.findById(ma_donhang)
            .populate('nguoidung_id').populate('thanhtoan_id').populate('vanchuyen_id').populate('diachi_id')
            .exec();
        const chitiet = await ChiTietDonHang.find({donhang_id: request.params.id})
            
            .populate({
                path: 'ctsp_id',
                populate:[
                    {
                        path: 'mausanpham_id',
                        populate: [ {path: 'mausac_id'}, {path: 'sanpham_id'}]
                    }, 
                    {
                        path: 'kichco_id'
                    }
                ]
            }).exec();

        if (result){
            response.json({
                data: result,
                details: chitiet
            });
        } else{
            response.json({
                message: 'Đơn hàng không tồn tại!'
            });
        }
        
    } catch (error){
        rconsole.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};