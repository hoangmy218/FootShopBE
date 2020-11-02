const HinhAnh = require('../models/HinhAnh.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');

exports.hinhanh_create = async(request, response)=>{
    try {
        
            var hinhanh = new HinhAnh(request.body);
            var result = await hinhanh.save();
            response.json({
                success: true,
                message: 'Thêm hình ảnh thành công!',
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

exports.hinhanh_list = async(request, response) =>{
    try {
        var result = await HinhAnh.find().exec();
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

exports.hinhanh_get = async(request, response)=>{
    try{
        var result = await HinhAnh.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                message: 'Hình ảnh không tồn tại!'
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

exports.hinhanh_update = async(request, response)=>{
    try{
        var result = await HinhAnh.findById(request.params.id).exec();
        if (result){
            //Check name unique
            var ha = await HinhAnh.find({ ten: request.body.ten}).exec();
            if ((ha.length == 0) || (ha[0].id == request.params.id)){
                result.set(request.body);
                var res = await result.save();
                response.json({
                    success: true,
                    message: 'Cập nhật hình ảnh thành công!',
                    data: res
                });
            }
            if (ha[0]._id != request.params.id){
                response.json({          
                    message: 'Hình ảnh đã tồn tại!',
                    data: ha
                });
            }
            
        } else{
            response.json({
                message: 'Hình ảnh không tồn tại!'
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

exports.hinhanh_delete = async(request, response)=>{
    try{
        var result = await HinhAnh.findById(request.params.id).exec();
        if (result){
            var result = await HinhAnh.deleteOne({ _id: request.params.id}).exec();
            response.json({
                message: 'Xóa hình ảnh thành công!'
            });
        } else{
            response.json({
                message: 'Hình ảnh không tồn tại!'
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

exports.hinhanh_upload = async(request, response) =>{
    try{
        var url =  `http://localhost:3000/uploads/${request.file.filename}`;
        var hinhanh = new HinhAnh();
        hinhanh.hinh = url;
        hinhanh.stt = request.body.stt;
        var result = await hinhanh.save();
        response.json({
            success: true,
            message: 'Đăng tải hình ảnh thành công!',
            hinhanh: result
        });
    } catch(error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};

exports.hinh_upload = async(request, response)=>{
    try{
        var url =  'http://localhost:3000/uploads/' + request.file.filename;
        var hinhanh = new HinhAnh();
        hinhanh.hinh = url;
        hinhanh.stt = request.body.stt;
        var result = await hinhanh.save();
        response.json({
            success: true,
            message: 'Đăng tải hình ảnh thành công!',
            hinhanh: result
        })
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
        // response.send(error);
    }
   
}