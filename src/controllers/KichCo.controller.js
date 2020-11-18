const KichCo = require('../models/KichCo.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');
const ChiTietSanPhamModel = require('../models/ChiTietSanPham.model');

exports.kichco_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,  
            errors
        })
    }else {
        try {
            var kc = await KichCo.find({ ten: request.body.ten}).exec();
            if (kc.length != 0){
                response.json({    
                    success: false,      
                    message: 'Kích cỡ đã tồn tại!',
                    data: kc
                });
            } else {
                var kichco = new KichCo(request.body);
                var result = await kichco.save();
                response.json({
                    success: true,
                    message: 'Thêm kích cỡ thành công!',
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

exports.kichco_list = async(request, response) =>{
    try {
        var result = await KichCo.find().sort({_id: -1}).exec();
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

exports.kichco_get = async(request, response)=>{
    try{
        var result = await KichCo.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,  
                message: 'Kích cỡ không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.kichco_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,  
            errors
        })
    }else {
        try{
            var result = await KichCo.findById(request.params.id).exec();
            if (result){
                //Check name unique
                var kc = await KichCo.find({ ten: request.body.ten}).exec();
                if ((kc.length == 0) || (kc[0].id == request.params.id)){
                    result.set(request.body);
                    var res = await result.save();
                    response.json({
                        success: true,
                        message: 'Cập nhật kích cỡ thành công!',
                        data: res
                    });
                }
                if (kc[0]._id != request.params.id){
                    response.json({       
                        success: false,     
                        message: 'Kích cỡ đã tồn tại!',
                        data: kc
                    });
                }
                
            } else{
                response.json({
                    success: false,  
                    message: 'Kích cỡ không tồn tại!'
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

exports.kichco_delete = async(request, response)=>{
    try{
        var result = await KichCo.findById(request.params.id).exec();
        if (result){
            var ctsp = await ChiTietSanPhamModel.find({kichco_id: request.params.id}).exec()
            if (ctsp.length > 0 ){
                response.json({
                    success: false,  
                    message: 'Không thể xóa kích cỡ!'
                });
            }else {
                var result = await KichCo.deleteOne({ _id: request.params.id}).exec();
                response.json({
                    success: true,  
                    message: 'Xóa kích cỡ thành công!'
                });
            }
        } else{
            response.json({
                success: false,  
                message: 'Kích cỡ không tồn tại!'
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