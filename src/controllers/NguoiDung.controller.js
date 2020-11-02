const NguoiDung = require('../models/NguoiDung.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');


exports.nguoidung_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {
        var nd = await NguoiDung.find({ dienthoai: request.body.dienthoai}).exec();
        if (nd.length != 0){
            response.json({          
                message: 'Số điện thoại đã tồn tại!',
                data: nd
            });
        } else {
            var nguoidung = new NguoiDung(request.body);
            var res = await nguoidung.save();
            const result = await NguoiDung.findById(res.id).exec();
            response.json({
                success: true,
                message: 'Thêm người dùng thành công!',
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

exports.nguoidung_list = async(request, response) =>{
    try {
        
        const result = await NguoiDung.find().exec();

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

exports.nguoidung_get = async(request, response)=>{
    try{
        const result =  await NguoiDung.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.nguoidung_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try{
        
        var result = await NguoiDung.findById(request.params.id).exec();
        
        if (result){
            var ndtrung = await NguoiDung.find({ dienthoai: request.body.dienthoai}).exec();
            // response.json({          
            //     ndtrung: ndtrung
            // });
            if ((ndtrung.length == 0) || (ndtrung[0]._id == request.params.id)){
                result.set(request.body);
                var res = await result.save();
                const nd =  await NguoiDung.findById(request.params.id).exec();
                response.json({
                    success: true,
                    message: 'Cập nhật thông tin người dùng thành công!',
                    data: nd
                });
            }
            if (ndtrung[0]._id != request.params.id){
                response.json({          
                    message: 'Người dùng đã tồn tại!',
                    data: ndtrung
                });
            }
            
            
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
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

exports.nguoidung_delete = async(request, response)=>{
    try{
        var result = await NguoiDung.findById(request.params.id).exec();
        if (result){
            var result = await NguoiDung.deleteOne({ _id: request.params.id}).exec();
            response.json({
                message: 'Xóa thông tin người dùng thành công!'
            });
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
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

exports.nguoidung_active = async(request, response)=>{
    try {
        var result = await NguoiDung.findById(request.params.id).exec();
        if (result){
            var nd = await NguoiDung.update({ _id: request.params.id}, {$set: {trangthai: true}}).exec();
            var res = await NguoiDung.findById(request.params.id).exec();
            response.json({
                success: true,
                message: 'Kích hoạt người dùng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
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

exports.nguoidung_deactive = async(request, response)=>{
    try {
        var result = await NguoiDung.findById(request.params.id).exec();
        if (result){
            var nd = await NguoiDung.update({ _id: request.params.id}, {$set: {trangthai: false}}).exec();
            var res = await NguoiDung.findById(request.params.id).exec();
            response.json({
                success: true,
                message: 'Vô hiệu hóa người dùng thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
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

exports.nguoidung_avatar = async(request, response)=>{
    try {
        var result = await NguoiDung.findById(request.params.id).exec();
        if (result){
            var nd = await NguoiDung.update({ _id: request.params.id}, {$set: {hinh: request.body.hinh}}).exec();
            var res = await NguoiDung.findById(request.params.id).exec();
            response.json({
                success: true,
                message: 'Cập nhật ảnh đại diện thành công!',
                data: res
            })
        } else{
            response.json({
                message: 'Người dùng không tồn tại!'
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