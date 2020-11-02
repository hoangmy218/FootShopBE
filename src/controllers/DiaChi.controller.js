const DiaChi = require('../models/DiaChi.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator')
const DonHang = require('../models/DonHang.model')

exports.diachi_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,
            message: errors
        })
    }else {
        try {
            
            var diachi = new DiaChi({
                nguoidung_id: request.payload.username,
                ten: request.body.ten,
                dienthoai: request.body.dienthoai,
                diachi: request.body.diachi,
                macdinh: false
            });
            var result = await diachi.save();
            response.json({
                success: true,
                message: 'Thêm địa chỉ thành công!',
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

exports.diachi_list = async(request, response) =>{
    try {
        var result = await DiaChi.find({nguoidung_id: request.payload.username}).sort({_id: -1}).exec();
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

exports.diachi_get = async(request, response)=>{
    try{
        var result = await DiaChi.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Địa chỉ không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.diachi_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            message: errors
        })
    }else {
        try{
            var result = await DiaChi.findById(request.params.id).exec();
            if (result){
                //Check name unique
                var dc = await DiaChi.find({ ten: request.body.ten}).exec();
                if ((dc.length == 0) || (dc[0].id == request.params.id)){
                    result.set(request.body);
                    var res = await result.save();
                    response.json({
                        success: true,
                        message: 'Cập nhật địa chỉ thành công!',
                        data: res
                    });
                }
                if (dc[0]._id != request.params.id){
                    response.json({   
                        success: false,       
                        message: 'Địa chỉ đã tồn tại!',
                        data: dc
                    });
                }
                
            } else{
                response.json({
                    success: false,
                    message: 'Địa chỉ không tồn tại!'
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

exports.diachi_delete = async(request, response)=>{
    try{
        var result = await DiaChi.findById(request.params.id).exec();
        if (result){
            var dc = await DonHang.find({diachi_id: request.params.id}).exec()
            if (dc.length >0){
                response.json({
                    success: false,
                    message: 'Không thể xóa địa chỉ!'
                });
            }else {
                var result = await DiaChi.deleteOne({ _id: request.params.id}).exec();
                response.json({
                    success: true,
                    message: 'Xóa địa chỉ thành công!'
                });
            }
            
        } else{
            response.json({
                success: false,
                message: 'Địa chỉ không tồn tại!'
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

