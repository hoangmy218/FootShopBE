const KhuyenMai = require('../models/KhuyenMai.model');
const {response, request} = require('express');
const SanPham = require('../models/SanPham.model');
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');
const SanPhamModel = require('../models/SanPham.model');
var _ = require('underscore');

exports.khuyenmai_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,
            error: errors
        })
    }else {
        try {
            var ngaybd = new Date(request.body.ngaybd);
            var ngaykt = new Date(request.body.ngaykt);
            if (parseInt((ngaykt-ngaybd)/ (1000 * 60 * 60 * 24)) < 0){
                response.json({ 
                    success: false,         
                    message: 'Ngày kết thúc phải sau ngày bắt đầu khuyến mãi!',
                    data: request.body
                });
            }else{
                var km = await KhuyenMai.find({ chude : request.body.chude}).exec();
                if (km.length != 0){
                    response.json({    
                        success: false,      
                        message: 'Chủ đề khuyến mãi đã tồn tại!',
                        data: km
                    });
                } else {
                    var khuyenmai = new KhuyenMai(request.body);
                    var res = await khuyenmai.save();
                    
                    const result = await KhuyenMai.findById(res.id).populate('sanpham_id').exec();
                    var productlist = request.body.sanpham_id;
                    for (const pro of productlist){
                        var sp = await SanPham.update({ _id: pro}, {$set: {khuyenmai_id: result._id}}).exec();
                    }
                    response.json({
                        success: true,
                        message: 'Thêm khuyến mãi thành công!',
                        data: result,
                        diff: parseInt((ngaykt-ngaybd)/ (1000 * 60 * 60 * 24))
                    });
                        
                }
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

exports.khuyenmai_list = async(request, response) =>{
    try {
        
        const result = await KhuyenMai.find().populate('sanpham_id').sort({_id: -1}).exec();

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

exports.khuyenmai_get = async(request, response)=>{
    try{
        const result = await KhuyenMai.findById(request.params.id).populate('sanpham_id').exec();
        if (result){
            
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Khuyến mãi không tồn tại!'
            });
        }
        
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};

exports.khuyenmai_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else {
        try{
            var result = await KhuyenMai.findById(request.params.id).exec();
            var discount_id = request.params.id;
            var productList_old = [];
            result['sanpham_id'].forEach(element => {
                productList_old.push(element+"")
            });
            var productList_new = request.body.sanpham_id;
            if (result){
                var ngaybd = new Date(request.body.ngaybd);
                var ngaykt = new Date(request.body.ngaykt);
                if (parseInt((ngaykt-ngaybd)/ (1000 * 60 * 60 * 24)) < 0){
                    response.json({         
                        success: false, 
                        message: 'Ngày kết thúc phải sau ngày bắt đầu khuyến mãi!',
                        data: request.body
                    });
                } else{
                    //Check name unique
                    var km = await KhuyenMai.find({ chude: request.body.chude}).exec();
                    if ((km.length == 0) || (km[0].id == request.params.id)){

                        //UPDATE SANPHAM-KHUYENMAI
                        console.log('xóa', _.difference(productList_old, productList_new), productList_old, productList_new );
                        console.log('thêm', _.difference(productList_new, productList_old));
                        var  deleteOldList= _.difference(productList_old, productList_new);
                        var  addNewList = _.difference(productList_new, productList_old);
                        if (deleteOldList.length > 0){
                            for (const pro of deleteOldList){
                                var sp = await SanPham.update({ _id: pro}, {$set: {khuyenmai_id: null}}).exec();
                            }
                        }
                        if (addNewList.length > 0){
                            for (const pro of addNewList){
                                var sp = await SanPham.update({ _id: pro}, {$set: {khuyenmai_id: discount_id}}).exec();
                            }
                        }




                        //update KHUYEN MAI
                        result.set(request.body);
                        var res = await result.save();
                        const km = await KhuyenMai.findById(res.id).populate('sanpham_id').exec();
                        
                        
                        response.json({
                            success: true,
                            message: 'Cập nhật khuyến mãi thành công!',
                            data: km
                        });
                    }
                    if (km[0]._id != request.params.id){
                        response.json({    
                            success: false,      
                            message: 'Khuyến mãi đã tồn tại!',
                            data: km
                        });
                    }
                }
                
                
                
            } else{
                response.json({
                    success: false,
                    message: 'Khuyến mãi không tồn tại!'
                });
            }
            
        } catch(error){
            console.log(error);
        response.json({
            success: false,
            message: error
        })
        }
    }
    
}

exports.khuyenmai_delete = async(request, response)=>{
    try{
        var result = await KhuyenMai.findById(request.params.id).exec();
        if (result){
            var sp = await SanPhamModel.find({khuyenmai_id: request.params.id}).exec()
            if (sp.length> 0){
                for (var i= 0 ; i<sp.length; i++){
                    await SanPham.update({_id: sp[i]._id}, {$set: {khuyenmai_id: null}}).exec()
                }
            }
            var result = await KhuyenMai.deleteOne({ _id: request.params.id}).exec();
            response.json({
                success: true,
                message: 'Xóa khuyến mãi thành công!'
            });
        } else{
            response.json({
                success: false,
                message: 'Khuyến mãi không tồn tại!'
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

exports.khuyenmai_active = async(request, response)=>{
    try {
        var result = await KhuyenMai.findById(request.params.id).exec();
        if (result){
            var nd = await KhuyenMai.update({ _id: request.params.id}, {$set: {trangthai: true}}).exec();
            var res = await KhuyenMai.findById(request.params.id).exec();
            response.json({
                success: true,
                message: 'Kích hoạt khuyến mãi thành công!',
                data: res
            })
        } else{
            response.json({
                success: false,
                message: 'Khuyến mãi không tồn tại!'
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

exports.khuyenmai_deactive = async(request, response)=>{
    try {
        var result = await KhuyenMai.findById(request.params.id).exec();
        if (result){
            var nd = await KhuyenMai.update({ _id: request.params.id}, {$set: {trangthai: false}}).exec();
            var res = await KhuyenMai.findById(request.params.id).exec();
            response.json({
                success: true,
                message: 'Hủy kích hoạt khuyến mãi thành công!',
                data: res
            })
        } else{
            response.json({
                success: false,
                message: 'Khuyến mãi không tồn tại!'
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

exports.khuyenmai_sanpham = async(request, response)=>{
    try {
        var result = await KhuyenMai.findById(request.params.id).exec();
        if (result){
            var sanpham = await SanPham.update(
                {_id: request.body.sanpham_id}, 
                {$set: {khuyenmai_id: request.params.id}}).exec();
            var sp_new = await SanPham.findById(request.body.sanpham_id).exec();
            response.json({
                success: true,
                message: "Thêm khuyến mãi cho sản phẩm thành công!",
                data: sp_new
            });
        } else{
            response.json({
                success: false,
                message: 'Khuyến mãi không tồn tại!'
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