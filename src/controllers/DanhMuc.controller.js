const DanhMuc = require('../models/DanhMuc.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');
const SanPhamModel = require('../models/SanPham.model');


exports.test = function (req, res){
    res.send('Test controller');
};

exports.danhmuc_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,
            error: errors
        })
    }else {
        try {
            var dm = await DanhMuc.find({ ten: request.body.ten}).exec();
            if (dm.length != 0){
                response.json({    
                    success: false,      
                    message: 'Danh mục đã tồn tại!',
                    data: dm
                });
            } else {
                var danhmuc = new DanhMuc(request.body);
                var result = await danhmuc.save();
                response.json({
                    success: true,
                    message: 'Thêm danh mục thành công!',
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

exports.danhmuc_list = async(request, response) =>{
    try {
        var result = await DanhMuc.find().sort({_id: -1}).exec();
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

exports.danhmuc_get = async(request, response)=>{
    try{
        var result = await DanhMuc.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Danh mục không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.danhmuc_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else {
        try{
            var result = await DanhMuc.findById(request.params.id).exec();
            if (result){
                //Check name unique
                var dm = await DanhMuc.find({ ten: request.body.ten}).exec();
                if ((dm.length == 0) || (dm[0].id == request.params.id)){
                    result.set(request.body);
                    var res = await result.save();
                    response.json({
                        success: true,
                        message: 'Cập nhật danh mục thành công!',
                        data: res
                    });
                }
                if (dm[0]._id != request.params.id){
                    response.json({        
                        success: false,  
                        message: 'Danh mục đã tồn tại!',
                        data: dm
                    });
                }
                
            } else{
                response.json({
                    success: false,
                    message: 'Danh mục không tồn tại!'
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

exports.danhmuc_delete = async(request, response)=>{
    try{
        var result = await DanhMuc.findById(request.params.id).exec();
        if (result){
            var sp = await SanPhamModel.find({danhmuc_id: request.params.id}).exec()
            if (sp.length > 0){
                response.json({
                    success: false,
                    message: 'Không thể xóa danh mục!'
                });
            }else {
                var result = await DanhMuc.deleteOne({ _id: request.params.id}).exec();
                response.json({
                    success: true,
                    message: 'Xóa danh mục thành công!'
                });
            }
            
        } else{
            response.json({
                success: false,
                message: 'Danh mục không tồn tại!'
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