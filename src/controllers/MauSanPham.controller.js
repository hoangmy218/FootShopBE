const MauSanPham = require('../models/MauSanPham.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');
const ChiTietPhieuNhap = require('../models/ChiTietPhieuNhap.model')
const ChiTietDonHang = require('../models/ChiTietDonHang.model')
const ChiTietSanPham = require('../models/ChiTietSanPham.model');

exports.mausanpham_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else {
        try {
            var sptrung = await MauSanPham.find({
                sanpham_id: request.body.sanpham_id,
                mausac_id: request.body.mausac_id
            }).populate('sanpham_id').populate('mausac_id').exec();
            if (sptrung.length != 0){
                response.json({
                    message: 'Sản phẩm với màu sắc này đã tồn tại!',
                    data: sptrung
                });
            } else{
                var mausanpham = new MauSanPham(request.body);
                var res = await mausanpham.save();
                
                const result = await MauSanPham.findById(res.id).populate('sanpham_id').populate('mausac_id').populate('hinh').exec();
                response.json({
                    success: true,
                    message: 'Thêm sản phẩm với màu sắc thành công!',
                    data: result
                });
            }
        } catch (error){
            console.log(error);
        response.json({
            success: false,
            message: error
        })
        }
    }
    
};

exports.mausanpham_list = async(request, response) =>{
    try {
        
        const result = await MauSanPham.find().populate('sanpham_id').populate('mausac_id').populate('hinh').exec();

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

exports.mausanpham_prolist = async(request, response)=>{
    try {
        var res = [];
        var item = {};

        const result = await MauSanPham.find({sanpham_id: request.params.id}).populate('sanpham_id').populate('mausac_id').populate('hinh').exec();
        for(var i = 0; i<result.length; i++){
            var item = {};
            const ctsp = await ChiTietSanPham.find({mausanpham_id: result[i]._id})
            .populate('kichco_id').exec();
            console.log('ctsp',i,ctsp)
            item.mausanpham = result[i];
            item.kichco = ctsp;
            console.log('item', i, item)
            res.push(item)
            console.log('res arr', res)
        }
        response.json({
            data: result,
            details: res
        });
    } catch (error) {
        response.json({
            success: false,
            message: error
        })
    }
}

exports.mausanpham_get = async(request, response)=>{
    try{
        const result = await MauSanPham.findById(request.params.id).populate('sanpham_id').populate('mausac_id').populate('hinh').exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                message: 'Sản phẩm với màu sắc này không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.mausanpham_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try{
        var result = await MauSanPham.findById(request.params.id).exec();
        
        if (result){
            console.log('msp', result)
            var sptrung = await MauSanPham.find({
                sanpham_id: request.body.sanpham_id,
                mausac_id: request.body.mausac_id
            }).populate('sanpham_id').populate('mausac_id').exec();
            console.log('sp cung mau', sptrung)
            //Khong doi mau hoac doi mau khong trung
            if ((sptrung.length == 0) || (sptrung[0]._id == request.params.id)){
                result.set(request.body);
                var res = await result.save();
                const sp = await MauSanPham.findById(request.params.id)
                    .populate('sanpham_id')
                    .populate('mausac_id')
                    .populate('hinh')
                    .exec();
                console.log('updated success', sp)

                response.json({
                    success: true,
                    message: 'Cập nhật sản phẩm với màu sắc thành công!',
                    data: sp
                   
                });
            }
            if (sptrung[0]._id != request.params.id){
                // console.log('sp da co', sptrung)
                response.json({
                    message: 'Sản phẩm với màu sắc này đã tồn tại!',
                    data: sptrung
                });
            }     
                
            
            
        } else{
            response.json({
                success: false,
                message: 'Sản phẩm với màu sắc này không tồn tại!'
            });
        }
        
    } catch(error){
        console.log('error', error)        
        response.json({
            success: false,
            error: error
        })
    }
}

exports.mausanpham_delete = async(request, response)=>{
    try{
        var result = await MauSanPham.findById(request.params.id).exec();
        console.log('msp', result)
        var candelete = true;
        var checkctpn = checkctdh = false;
        if (result){
            var ctpn = await ChiTietPhieuNhap.find()
            .populate('chitietsanpham_id').exec();
            // response.json({
            //     sp: ctpn,
            //     result: result
            // })
            if (ctpn.length > 0){
                for (var j = 0; j <ctpn.length; j++){
                    if (ctpn[j].chitietsanpham_id != null){
                        
                        if (ctpn[j].chitietsanpham_id.mausanpham_id == request.params.id){
                            
                            candelete = false
                            response.json({
                                success: false,
                                // ctsp: ctpn[j],
                                message: 'Không thể xóa sản phẩm'
                            })
                        }
                    }
                    if (j == ctpn.length -1){
                        checkctpn = true;
                        console.log('checkctpn',j,  checkctpn)
                        console.log('checkctdh', checkctdh)
                        
                        if (checkctpn && checkctdh){
                        
                            var ctsp = await ChiTietSanPham.deleteMany({mausanpham: request.params.id}).exec();
                            var result = await MauSanPham.deleteOne({ _id: request.params.id}).exec();
                            response.json({
                                success: true,
                                message: 'Xóa phân loại hàng thành công'
                            });
                        }
                    }
                    
                }
            }

            var ctdh  = await ChiTietDonHang.find()
                .populate('ctsp_id').exec();
 
            if (ctdh.length > 0){
                for (var i = 0; i <ctdh.length; i++){
                    if (ctdh[i].ctsp_id != null){
                        if (ctdh[i].ctsp_id.mausanpham_id == request.params.id){
                            candelete = false
                            response.json({
                                success: false,
                                message: 'Không thể xóa sản phẩm'
                            })
                        }
                    }
                    if (i == ctdh.length -1){
                        checkctdh = true;
                        console.log('checkctpn', checkctpn)
                        console.log('checkctdh', i, checkctdh)
                        
                        if (checkctpn && checkctdh){
                        
                            var ctsp = await ChiTietSanPham.deleteMany({mausanpham: request.params.id}).exec();
                            var result = await MauSanPham.deleteOne({ _id: request.params.id}).exec();
                            response.json({
                                success: true,
                                message: 'Xóa phân loại hàng thành công'
                            });
                        }
                        
                    }
                    
                }
            }
            
            
        } else{
            response.json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }
    } catch (error){
        response.json({
            success:false,
            message: error
        })
    }
}