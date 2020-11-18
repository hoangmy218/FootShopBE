const NhaCungCap = require('../models/NhaCungCap.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');
const PhieuNhap = require('../models/PhieuNhap.model')

exports.nhacungcap_create = async(request, response)=>{
    var errors = validationResult(request)
    console.log(request.body)
    if (!errors.isEmpty()){
        response.json({
            success: false,
            error: errors
        })
    }else {
        try {
            var ncc = await NhaCungCap.find({ ten: request.body.ten}).exec();
            if (ncc.length != 0){
                response.json({          
                    success: false,
                    message: 'Nhà cung cấp đã tồn tại!',
                    data: ncc
                });
            } else {
                var nhacungcap = new NhaCungCap(request.body);
                var result = await nhacungcap.save();
                response.json({
                    success: true,
                    message: 'Thêm nhà cung cấp thành công!',
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

exports.nhacungcap_list = async(request, response) =>{
    try {
        var result = await NhaCungCap.find().sort({_id: -1}).exec();
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

exports.nhacungcap_get = async(request, response)=>{
    try{
        var result = await NhaCungCap.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Nhà cung cấp không tồn tại!'
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

exports.nhacungcap_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    } else {
        try{
            var result = await NhaCungCap.findById(request.params.id).exec();
            if (result){
                //Check name unique
                var ncc = await NhaCungCap.find({ ten: request.body.ten}).exec();
                if ((ncc.length == 0) || (ncc[0].id == request.params.id)){
                    result.set(request.body);
                    var res = await result.save();
                    response.json({
                        success: true,
                        message: 'Cập nhật nhà cung cấp thành công!',
                        data: res
                    });
                }
                if (ncc[0]._id != request.params.id){
                    response.json({    
                        success: false,      
                        message: 'Nhà cung cấp đã tồn tại!',
                        data: ncc
                    });
                }
                
            } else{
                response.json({
                    success: false,
                    message: 'Nhà cung cấp không tồn tại!'
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

exports.nhacungcap_delete = async(request, response)=>{
    try{
        var result = await NhaCungCap.findById(request.params.id).exec();
        if (result){
            var pn = await PhieuNhap.find({nhacungcap_id: request.params.id}).exec()
            if (pn.length > 0){
                response.json({
                    success: false,
                    message: 'Không thể xóa nhà cung cấp'
                });
            }else { 
                var result = await NhaCungCap.deleteOne({ _id: request.params.id}).exec();
                response.json({
                    success: true,
                    message: 'Xóa nhà cung cấp thành công!'
                });
            }
            
        } else{
            response.json({
                success: false,
                message: 'Nhà cung cấp không tồn tại!'
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