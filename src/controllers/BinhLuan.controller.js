const BinhLuan = require('../models/BinhLuan.model')
const {request, response} = require('express')
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');

exports.binhluan_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else {
        try {
            var bl =  new BinhLuan({
                noidung: request.body.noidung,
                danhgia: request.body.danhgia,
                ngaybl : request.body.ngaybl,
                sanpham_id: request.params.id,
                nguoidung_id: request.payload.username
            })
            var result = await bl.save();
            response.json({
                success: true,
                message: 'Đăng tải bình luận thành công',
                data: result
            });
        } catch (error) {
            response.json({ message: error})
        } 
    }
    
}

exports.binhluan_listbypro = async(request, response)=>{
    try {
        var result = await BinhLuan.find({sanpham_id: request.params.id})
        .populate('nguoidung_id').sort({ngaybl: -1}).exec();
        var sp_id = request.params.id+"";
        var resAvg = await BinhLuan
        .aggregate([
           
            {
                "$group": { 
                    _id: "$sanpham_id",
                    danhgiaAvg: {"$avg": "$danhgia"} 
                }
            }
        ]).exec();
        
        response.json({
            data: result,
            avg: resAvg
        })
        
        
    } catch (error) {
        console.log(error)
        response.json({ message: error})
    }
}

//FOR ADMIN
exports.binhluan_list = async(request, response)=>{
    try {
        var result = await BinhLuan.find().populate('sanpham_id').populate('nguoidung_id').sort({ngaybl: -1}).exec();
        response.json({
            data: result
        })
    } catch (error) {
        response.json({ message: error})
    }
}