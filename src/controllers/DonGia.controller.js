const DonGia = require('../models/DonGia.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');

exports.dongia_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else {
        if (request.body.dongia < 1000){
            response.json({
                success: false,
                message: 'Đơn giá ít nhất là 1000'
            })
        }
        try {
        
            var dongia = new DonGia({
                dongia: request.body.dongia,
                sanpham_id: request.params.id
            });
            var res = await dongia.save();       
            const result = await DonGia.findById(res._id).populate('sanpham_id').exec();
            response.json({
                success: true,
                message: 'Thêm đơn giá thành công!',
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
    
};

exports.dongia_list = async(request, response)=>{
    try {      
        const result = await DonGia.find({sanpham_id: request.params.id}).exec();
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

exports.dongia_new = async(request, response)=>{
    try {      
        const result = await DonGia.find({sanpham_id: request.params.id}).sort({ngay: -1}).limit(1).exec();
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