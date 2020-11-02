const MauSac = require('../models/MauSac.model');
const {response, request} = require('express');
const {check, validationResult} = require('express-validator');
const MauSanPhamModel = require('../models/MauSanPham.model');
const ChiTietSanPhamModel = require('../models/ChiTietSanPham.model');
const MauSacModel = require('../models/MauSac.model');

exports.mausac_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            success: false,
            error: errors
        })
    }else{
        try {
            var ms = await MauSac.find({ ten: request.body.ten}).exec();
            if (ms.length != 0){
                response.json({   
                    success: false,       
                    message: 'Màu sắc đã tồn tại!',
                    data: ms
                });
            } else {
                var mausac = new MauSac(request.body);
                var result = await mausac.save();
                response.json({
                    success: true,
                    message: 'Thêm màu sắc thành công!',
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

exports.mausac_list = async(request, response) =>{
    try {
        var result = await MauSac.find().exec();
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

//List nhung mau sac ma sp chua co
exports.mausac_productlist = async(request, response) =>{
    try {
        var mausac_list = [];
        var sanpham_id = request.params.id;
        var result = await MauSac.find().exec();
        console.log('ms', result)
        var k = 0;
        for(var i = 0; i<result.length; i++){
            console.log('res i', i, result[i])
            var msp = await MauSanPhamModel.find({
                sanpham_id: sanpham_id, mausac_id: result[i]._id}).exec();
                console.log('msp',i,msp)
            if (msp.length==0){
                console.log('push', mausac_list,i, result[i])
                mausac_list.push(result[i])
                // mausac_list[k]=result[i];
                // k++;
            }
            console.log('msl',mausac_list)
        }
        
        response.json({
            data: mausac_list
        });
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};


//List nhung mau sac ma sp chua co
exports.mausac_productEditlist = async(request, response) =>{
    try {
        var mausac_list = [];
        var mausanpham_id = request.params.id;
        var mausanpham = await MauSanPhamModel.findById(mausanpham_id).exec();
        console.log(mausanpham)
        var sanpham_id = mausanpham.sanpham_id;
        var result = await MauSac.find().exec();
        var mausac_id = mausanpham.mausac_id;
        console.log('ms', result)
        var k = 0;
        for(var i = 0; i<result.length; i++){
            // console.log('res i', i, result[i])
            // console.log('msid', mausanpham.mausac_id, 'res i id', result[i]._id)
            // console.log(mausanpham.mausac_id == result[i]._id)
            if ( mausanpham.mausac_id+"" == result[i]._id+""){
                // console.log('msid', mausac_id, 'res i id', result[i]._id)
                mausac_list.push(result[i])
                console.log('mausacl', mausac_list)
            }else{
                var msp = await MauSanPhamModel.find({
                    sanpham_id: sanpham_id, mausac_id: result[i]._id}).exec();
                    console.log('msp',i,msp)
                
                if (msp.length==0){
                    console.log('push', mausac_list,i, result[i])
                    mausac_list.push(result[i])
                    // mausac_list[k]=result[i];
                    // k++;
                }
            }
            console.log('msl',mausac_list)
        }
        
        response.json({
            data: mausac_list
        });
    } catch (error){
        console.log(error);
        response.json({
            success: false,
            message: error
        })
    }
};

exports.mausac_get = async(request, response)=>{
    try{
        var result = await MauSac.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Màu sắc không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.mausac_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }else{
        try{
            var result = await MauSac.findById(request.params.id).exec();
            if (result){
                //Check name unique
                var ms = await MauSac.find({ ten: request.body.ten}).exec();
                if ((ms.length == 0) || (ms[0].id == request.params.id)){
                    result.set(request.body);
                    var res = await result.save();
                    response.json({
                        success: true,
                        message: 'Cập nhật màu sắc thành công!',
                        data: res
                    });
                }
                if (ms[0]._id != request.params.id){
                    response.json({ 
                        success: false,         
                        message: 'Màu sắc đã tồn tại!',
                        data: ms
                    });
                }
                
            } else{
                response.json({
                    success: false,
                    message: 'Màu sắc không tồn tại!'
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

exports.mausac_delete = async(request, response)=>{
    try{
        var result = await MauSac.findById(request.params.id).exec();
        var candelete = true
        if (result){
            await ChiTietSanPhamModel.find()
            .populate({
                path: 'mausanpham_id',
                populate:'mausac_id',
            })
            .exec(function(err, sp){            
                for (var i = 0; i<sp.length; i++){
                    if (sp[i].mausanpham_id.mausac_id._id == request.params.id){
                        candelete = false
                        response.json({
                            success: false,
                            message: 'Không thể xóa màu sắc!',
                            sp: sp[i]
                        });
                    }
                }
            })
                
            var msp = await MauSanPhamModel.find({mausac_id: request.params.id}).populate('mausac_id')
                .exec()
                if (msp.length > 0){
                    
                    for(var j = 0; j< msp.length; j++){
                        // response.send(msp)
                        if (msp[j].mausac_id._id == request.params.id){
                            candelete  = false
                            response.json({
                                success: false,
                                message: 'Không thể xóa màu sắc!',
                                msp: msp[j]
                            });
                        }
                    }
                    if (candelete == true){
                        var res = await MauSacModel.deleteOne({_id: request.params.id}).exec()
                        response.json({
                            success: true,
                            message: 'Xóa màu sắc thành công!'
                        })
                    }
                } else {
                        var res = await MauSacModel.deleteOne({_id: request.params.id}).exec()
                        response.json({
                            success: true,
                            message: 'Xóa màu sắc thành công!'
                        })
                }
             
                
            
        }else{
            response.json({
                success: false,
                message: 'Màu sắc không tồn tại!'
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

