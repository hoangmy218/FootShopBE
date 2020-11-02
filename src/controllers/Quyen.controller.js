const Quyen = require('../models/Quyen.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');

exports.quyen_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {
        var q = await Quyen.find({ ten: request.body.ten}).exec();
        if (q.length != 0){
            response.json({          
                message: 'Quyền has exist',
                data: q
            });
        } else {
            var quyen = new Quyen(request.body);
            var result = await quyen.save();
            response.json({
                success: true,
                message: 'Thêm quyền thành công!',
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
};

exports.quyen_list = async(request, response) =>{
    try {
        var result = await Quyen.find().exec();
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

exports.quyen_get = async(request, response)=>{
    try{
        var result = await Quyen.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                message: 'Quyền không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.quyen_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try{
        var result = await Quyen.findById(request.params.id).exec();
        if (result){
            //Check name unique
            var q = await Quyen.find({ ten: request.body.ten}).exec();
            if ((q.length == 0) || (q[0].id == request.params.id)){
                result.set(request.body);
                var res = await result.save();
                response.json({
                    success: true,
                    message: 'Cập nhật quyền thành công!',
                    data: res
                });
            }
            if (q[0]._id != request.params.id){
                response.json({          
                    message: 'Quyền đã tồn tại',
                    data: q
                });
            }
            
        } else{
            response.json({
                message: 'Quyền không tồn tại!'
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

exports.quyen_delete = async(request, response)=>{
    try{
        var result = await Quyen.findById(request.params.id).exec();
        if (result){
            var result = await Quyen.deleteOne({ _id: request.params.id}).exec();
            response.json({
                message: 'Xóa quyền thành công!'
            });
        } else{
            response.json({
                message: 'Quyền không tồn tại!'
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