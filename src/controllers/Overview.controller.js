const GioHang = require('../models/GioHang.model');
const ChiTietSanPham = require('../models/ChiTietSanPham.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const DonGia = require('../models/DonGia.model');
const SanPham = require('../models/SanPham.model');
const NguoiDung = require('../models/NguoiDung.model');
const DonHang = require('../models/DonHang.model');
const ChiTietDonHang = require('../models/ChiTietDonHang.model');
const ChiTietPhieuNhap = require('../models/ChiTietPhieuNhap.model');
const BinhLuan = require('../models/BinhLuan.model');
const PhieuNhap = require('../models/PhieuNhap.model');
const mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
// const DonGia = require('../models/DonGia.model');
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;
const {check, validationResult} = require('express-validator');

exports.Overview_customers = async(request, response)=>{
    try {
        const total = await NguoiDung.aggregate([
            {$match: { role: "customer"}},
            {$count: 'total'}
        ]);
        response.json(total[0])
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_orders = async(request, response)=>{
    try {
        const total = await DonHang.aggregate([
            // {$match: {trangthai: { $gt: 1}}},
            {$count: 'total'} //trang thai greater than 1          
        ]);
        
            response.json(total[0])
        
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}

//CAP NHAT CHI DON HANG / CHI TIET DON HANG
exports.list = async(request, response)=>{
    try {
        var donhang = await DonHang.find().exec();
        console.log(donhang.length)
        for (var i=0; i<donhang.length; i++){
            console.log('\n\n DON HANG \n',i)
            console.log(donhang[i])
            console.log('\nCHI TIET\n')
            var ctdh = await ChiTietDonHang.find({donhang_id: donhang[i]._id}).exec();
            if (ctdh.length ==0){
                await DonHang.deleteOne({ _id: donhang[i]._id}).exec()
            }else{
                console.log(ctdh)
                var tongtien = 0;
                var khuyenmai = 0;
                for (var j=0; j<ctdh.length; j++){
                    
                    var ctsp = await ChiTietSanPham.findById(ctdh[j].ctsp_id).populate('mausanpham_id').exec();
                    
                    if (ctsp){
                        var dh = await DonHang.findById( donhang[i]._id).exec()
                        var tongtien_cu = dh.tongtien
                        
                        var soluongton = ctsp.soluong;
                        var soluongdat = ctdh[j].soluongdat;
                        
                        
                        var ma_sanpham = ctsp.mausanpham_id.sanpham_id;
                        
                        var dongia = ctdh[j].dongia
                        
                        var thanhtien = soluongdat * dongia;
                        tongtien += thanhtien;
            
                        //CHECK DISCOUNT
                        var sp = await SanPham.findById(ma_sanpham).populate('khuyenmai_id').exec();
                        var ngaykt = sp.khuyenmai_id.ngaykt;
                        var ngayht = Date.now();
                        if (parseInt((ngaykt-ngayht)/ (1000 * 60 * 60 * 24)) >= 0){
                            khuyenmai += thanhtien * sp.khuyenmai_id.giamgia / 100;
                        }
                    
                        console.log('tongtien ', tongtien)
                        console.log('khuyemmai', khuyenmai)
  
                    }
                }
                var dh_cn = await DonHang.update(
                    {_id: donhang[i]._id},
                    {$set: {tongtien: tongtien-khuyenmai}}).exec();
                var dh_moi = await DonHang.findById( donhang[i]._id).exec()
                console.log('\n DON HANG DA CAP NHAT', dh_moi)
            }
            
        }
        response.send()
    } catch (error) {
        console.log(error);
    }
}

exports.update = async(request, response)=>{
    try {
    
    }catch(error){
        response.send(error)
    }
}

exports.Overview_revenue = async(request, response)=>{
    try {
        var donhang = await DonHang.aggregate([
            {$match: {trangthai: {$gt: 1 , $lt: 4}}}
        ])
        var revenue = 0
        for(var i =0; i<donhang.length; i++){
            revenue += donhang[i].tongtien
        }
        response.json({
            data: donhang,
            total: revenue
        })
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_customer_graph = async(request, response)=>{
    try {
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}
exports.Overview_out_of_stocks = async(request, response)=>{
    try {
        var sanpham = await ChiTietSanPham.aggregate([
            {$match: {soluong: { $eq: 0}}}, // sl ton = 0
            {
                $lookup:
                  {
                    from: "kichcos",
                    localField: "kichco_id",
                    foreignField: "_id",
                    as: "kichco_id"
                  } 
             },
             {
                $unwind: {
                  path: "$kichco_id",
                  preserveNullAndEmptyArrays: true
                }
            },
             {
                $lookup: 
                    {
                        from: "mausanphams",
                        localField: "mausanpham_id",
                        foreignField: "_id",
                        as: "mausanpham_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id",
                  preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: 
                    {
                        from: "sanphams",
                        localField: "mausanpham_id.sanpham_id",
                        foreignField: "_id",
                        as: "mausanpham_id.sanpham_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id.sanpham_id",
                  preserveNullAndEmptyArrays: true
                }
            },
             {
                $lookup: 
                    {
                        from: "mausacs",
                        localField: "mausanpham_id.mausac_id",
                        foreignField: "_id",
                        as: "mausanpham_id.mausac_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id.mausac_id",
                  preserveNullAndEmptyArrays: true
                }
            },
        ]);
        // var sp = sanpham.populate()
        var sanpham_total = await ChiTietSanPham.aggregate([
            {$match: {soluong: { $eq: 0}}}, // 0 < sl ton <= 3
            {$count: 'total'}
        ])
        if (sanpham.length == 0) {
            total = 0
        }else{
            total = sanpham_total[0].total
        }
        var array_end = sanpham.filter(function(el){
            return el.mausanpham_id._id != undefined;
        })
        console.log(array_end)
        
        response.json({
            data: array_end,
            total
        })
    } catch (error) {
        console.log(error)
        response.json({
            message: error
        })
    }
}

exports.Overview_low_stocks = async(request, response)=>{
    try {
        var sanpham = await ChiTietSanPham.aggregate([
            {$match: {soluong: { $gt: 0, $lte: 3}}}, // 0 < sl ton <= 3
            {
                $lookup:
                  {
                    from: "kichcos",
                    localField: "kichco_id",
                    foreignField: "_id",
                    as: "kichco_id"
                  } 
             },
             {
                $unwind: {
                  path: "$kichco_id",
                  preserveNullAndEmptyArrays: true
                }
            },
             {
                $lookup: 
                    {
                        from: "mausanphams",
                        localField: "mausanpham_id",
                        foreignField: "_id",
                        as: "mausanpham_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id",
                  preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: 
                    {
                        from: "sanphams",
                        localField: "mausanpham_id.sanpham_id",
                        foreignField: "_id",
                        as: "mausanpham_id.sanpham_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id.sanpham_id",
                  preserveNullAndEmptyArrays: true
                }
            },
             {
                $lookup: 
                    {
                        from: "mausacs",
                        localField: "mausanpham_id.mausac_id",
                        foreignField: "_id",
                        as: "mausanpham_id.mausac_id"
                    }
             },
             {
                $unwind: {
                  path: "$mausanpham_id.mausac_id",
                  preserveNullAndEmptyArrays: true
                }
            },
        ]);
        // var sp = sanpham.populate()
        var sanpham_total = await ChiTietSanPham.aggregate([
            {$match: {soluong: { $gt: 0, $lte: 3}}}, // 0 < sl ton <= 3
            {$count: 'total'}
        ])
        if (sanpham.length == 0) {
            total = 0
        }else{
            total = sanpham_total[0].total
        }
        
        response.json({
            data: sanpham,
            total
        })
    } catch (error) {
        console.log(error)
        response.json({
            message: error
        })
    }
}

exports.Overview_new_orders = async(request, response)=>{
    try {
        var new_order = await DonHang.aggregate([
            {$match: {trangthai: 1}}
        ])
        var new_order_total = await DonHang.aggregate([
            {$match: {trangthai: 1}},
            {$count: 'total'}
        ])
        if (new_order.length == 0) {
            total = 0
        }else{
            total = new_order_total[0].total
        }
        response.json({
            data: new_order,
            total
        })
    } catch (error) {
        response.json({
            message: error
        })
    }
}


exports.Overview_stock_graph = async(request, response)=>{
    try {
        
            var phieunhap = await PhieuNhap.aggregate([
                
                { $project:
                    { _id: 1,
                        yearBillDate: {$year: "$ngay"},
                        monthBillDate: {$month: "$ngay"},
                        tongnhap : "$tongnhap"
                    }
                },
                { $group:
                    { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                        sum: {$sum: "$tongnhap"}
                    }
                } ,
                { $sort:
                    {
                        "_id.monthBillDate": 1
                    }
                    
                }
            ])
            response.json({data: phieunhap})
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_order_graph = async(request, response)=>{
    try {
        
            var donhang = await ChiTietDonHang.aggregate([
                
                {
                    $lookup: 
                        {
                            from: "donhangs",
                            localField: "donhang_id",
                            foreignField: "_id",
                            as: "donhang_id"
                        }
                 },
                 {
                    $unwind: {
                      path: "$donhang_id",
                      preserveNullAndEmptyArrays: true
                    }
                },
               
                
                    { $project:
                        { _id: 1,
                            yearBillDate: {$year: "$donhang_id.ngaydat"},
                            monthBillDate: {$month: "$donhang_id.ngaydat"},
                            soluongdat:  "$soluongdat",
                            trangthai: "$donhang_id.trangthai"
                        }
                    },
                    { $match: {
                        $and: [
                            { trangthai: { $gte: 2 } },
                            { trangthai: { $lte: 4 } }
                        ]
                    } },
                    { $group:
                        { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                            sum: {$sum: "$soluongdat"}
                        }
                    },
                    { $sort:
                        {
                            "_id.monthBillDate": 1
                        }
                        
                    }
                ])
                response.json({data: donhang})
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_orderpro_graph = async(request, response)=>{
    try {
        
            var donhang = await DonHang.aggregate([
                { $project:
                    { _id: 1,
                        yearBillDate: {$year: "$ngaydat"},
                        monthBillDate: {$month: "$ngaydat"}
                    }
                },
                { $group:
                    { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                        sum: {$sum: 1}
                    }
                },
                { $sort:
                    {
                        "_id.monthBillDate": 1
                    }
                    
                }
            ])
            response.json({data: donhang})
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_revenue_graph = async(request, response)=>{
    try {
        
            var donhang = await DonHang.aggregate([
                {$match: {trangthai: {$eq: 4}}},
                { $project:
                    { _id: 1,
                        yearBillDate: {$year: "$ngaydat"},
                        monthBillDate: {$month: "$ngaydat"},
                        tongtien: "$tongtien"
                    }
                },
                { $group:
                    { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                        sum: {$sum: 1},
                        total: {$sum: "$tongtien"}
                    }
                },
                { $sort:
                    {
                        "_id.monthBillDate": 1
                    }
                    
                } 

            ])
            response.json(donhang)
        
    } catch (error) {
        response.json({
            message: error
        })
    }
}

exports.Overview_price_graph = async(request, response)=>{
    try {
        var sanpham_ma = request.params.id;
            var dongia = await DonGia.aggregate([
                {$match: {sanpham_id: new ObjectID(request.params.id)}},
                { $project:
                    { _id: 1,
                        yearBillDate: {$year: "$ngay"},
                        monthBillDate: {$month: "$ngay"},
                        dongia: "$dongia"
                    }
                },
                { $group:
                    { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                        total: {$avg: "$dongia"}
                    }
                },
                { $sort:
                    {
                        "_id.monthBillDate": 1
                    }
                    
                } 

            ])
            console.log('dongia', dongia)
            response.json(dongia)
        
    } catch (error) {
        console.log(error)
        response.json({
            message: error
        })
    }
}


//STATISTIC

exports.Overview_highest_rated_product = async(request, response)=>{
    try {
        var sanpham = await BinhLuan.aggregate([
            {$sort: {danhgia: -1}},
            {$limit: 5}
        ])
        response.json({data: sanpham})
    } catch (error) {
        response.json({
            message: error
        })
    }
}

//DRAFT
exports.Overview_recently_sold = async(request, response)=>{
    try {
        var phanloai = await DonHang.aggregate([
            {$match: {trangthai: {$gt: 1 , $lt: 4}}}, //don hang moi // chua hoan tat chua huy
            { $project:
                { _id: 1,
                    yearBillDate: {$year: "$ngaydat"},
                    monthBillDate: {$month: "$ngaydat"},
                    tongtien: "$tongtien",
                    donhang_id: "$_id"
                }
            },
            { $group:
                { _id: {yearBillDate: "$yearBillDate", monthBillDate: "$monthBillDate"},
                    orders: {$addToSet: "$donhang_id"},
                    sum: {$sum: 1}
                }
            } 
        ])
        var arr_sanphams = []
        for(var i = 0; i<phanloai.length; i++){
            var year = phanloai[i]._id.yearBillDate
            var month = phanloai[i]._id.monthBillDate
            if (year == 2020 && month == 9){
                var donhang = phanloai[i].orders
                //DUYET DONHANG
                // response.json({data: donhang})
                
                // for(var j = 0; j<donhang.length; j++){
                //     console.log(donhang[j])
                    var ctdh = await ChiTietDonHang.find({donhang_id: donhang}).exec()
                    for (var k = 0; k < ctdh.length; k++){
                        console.log('k',k)
                        console.log('sanpham',arr_sanphams)
                        console.log(ctdh[k].ctsp_id)
                        var sanpham = arr_sanphams.filter((arr_sanpham)=>{
                            return arr_sanpham.ctsp_id == ctdh[k].ctsp_id
                        })
                        console.log(ctdh[k])
                        var dh = [{
                            ctsp_id: ctdh[k].ctsp_id, soluongdat: ctdh[k].soluongdat
                        }]
                        if (arr_sanphams.length == 0){
                            
                            arr_sanphams = dh
                            console.log('arr_sp 0',arr_sanphams)
                        }else if (sanpham.length == 0){
                            console.log('sanpham',sanpham)
                            arr_sanphams = arr_sanphams.concat(dh)
                            console.log('sp',arr_sanphams)
                        } else {
                            console.log('length > 0',sanpham)
                        }
                        console.log(dh)
                        console.log(sanpham.length)
                    }
                    
                
            }
        }
        response.json({data: phanloai})
    } catch (error) {
        response.json({
            message: error
        })
    }
}