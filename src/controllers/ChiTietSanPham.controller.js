const ChiTietSanPham = require('../models/ChiTietSanPham.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const {check, validationResult} = require('express-validator');
var _ = require('underscore');
const ChiTietPhieuNhapModel = require('../models/ChiTietPhieuNhap.model');
exports.chitietsanpham_create = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {
        var sp = await ChiTietSanPham.find({ kichco_id: request.body.kichco_id, mausanpham_id: request.body.mausanpham_id}).exec();
        if (sp.length != 0){
            response.json({          
                message: 'Sản phẩm đã tồn tại!',
                data: sp
            });
        } else {
            var chitietsanpham = new ChiTietSanPham(request.body);
            var res = await chitietsanpham.save();
            const result = await ChiTietSanPham.findById(res.id)
                    .populate('mausanpham_id').populate('kichco_id')
                        .populate({
                            path: 'mausanpham_id',
                            populate: [{path: 'hinh'}, {path: 'mausac_id'}, {path: 'sanpham_id'}]
                            })
                        .exec();
            response.json({
                success: true,
                message: 'Sản phẩm đã được tạo thành công!',
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

exports.chitietsanpham_create_arr = async(request, response)=>{
    console.log('body', request.body)
    console.log('header', request.headers)
    console.log('params', request.params)
    var kichcoList = request.body.kichco;
    var mausanpham_id = request.params.id;
    console.log('msp_id', mausanpham_id)
    if (kichcoList.length>0){
        var v;
        for( v = 0; v<kichcoList.length; v++){
            try {
                var sp = await ChiTietSanPham.find({
                    kichco_id: kichcoList[v], mausanpham_id: mausanpham_id
                }).exec();
                console.log('sp', sp)
                if (sp.length != 0){
                    console.log('has exist', sp)
                    
                } else {
                    var chitietsanpham = new ChiTietSanPham({
                        mausanpham_id: mausanpham_id,
                        kichco_id: kichcoList[v],
                        soluong: 0
                    });
                    var res = await chitietsanpham.save();
                    console.log('res', res)
                    const result = await ChiTietSanPham.findById(res._id)
                            .populate('mausanpham_id').populate('kichco_id')
                                .populate({
                                    path: 'mausanpham_id',
                                    populate: [{path: 'hinh'}, {path: 'mausac_id'}, {path: 'sanpham_id'}]
                                    })
                                .exec();
                    console.log('added', result)
                    // response.json({
                    //     success: true,
                    //     message: 'Sản phẩm created thành công!',
                    //     data: result
                    // });
                    if (v == kichcoList.length-1 ){
                        console.log('ADD thành công!')
                        response.json({
                            success: true,
                            message: 'Thêm phân loại hàng thành công!',
                        });
                    }
                }
            } catch (error){
                console.log(error)
                response.json({
                    success: false,
                    message: error
                });
            }
        }
        
        
    }else{
        response.json({
            success: false,
            message: 'Chưa chọn kích cỡ!'
        })
    }
    
};

exports.chitietsanpham_update_arr = async(request, response)=>{
    console.log('body', request.body)
    console.log('header', request.headers)
    console.log('params', request.params)
    var kichcoList_new = request.body.kichco;
    var mausanpham_id = request.params.id;
    console.log('msp_id', mausanpham_id)
    console.log('kichco_new', kichcoList_new)
    var sizeList_old = await ChiTietSanPham.find({mausanpham_id: mausanpham_id}).exec();
    var kichcoList_old  = [];
    sizeList_old.forEach(size=>{
        kichcoList_old.push(size['kichco_id']+"")
    })
    console.log('kichco_old', kichcoList_old)
    console.log('sp them xoa', _.difference(kichcoList_old, kichcoList_new));
    console.log('sp da them', _.difference(kichcoList_new, kichcoList_old));
    var message = "";
    var sizes_delete = _.difference(kichcoList_old, kichcoList_new);
    if (sizes_delete.length > 0){
        for(var i = 0; i<sizes_delete.length; i++){
            for (const element of sizeList_old){
                console.log(element)
                console.log(element['kichco_id']+"", sizes_delete[i])
                if (element['kichco_id']+""==sizes_delete[i]){
                    console.log('=', element, sizes_delete[i])
                    var ctsp_id = element['_id'];
                    var ctpn = await ChiTietPhieuNhapModel.find({chitietsanpham_id: ctsp_id}).exec();
                    console.log('ctpn', ctpn)
                    if (ctpn.length > 0){
                        message += "Không thể xóa sản phẩm có kích cỡ "+element['kichco_id'];
                        console.log(message);
                    }else{
                        var del = await ChiTietSanPham.deleteOne({_id: ctsp_id}).exec();
                        console.log('del', del, ctsp_id)
                        message += "Xóa sản phẩm có kích cỡ "+element['kichco_id']+" thành công!";
                        console.log(message)
                    }

                }
            }
        }
    }
    var sizes_add = _.difference(kichcoList_new, kichcoList_old);
    if (sizes_add.length > 0){
        for (const size of sizes_add){
            console.log('size',size)
            var chitietsanpham = new ChiTietSanPham({
                mausanpham_id: mausanpham_id,
                kichco_id: size,
                soluong: 0
            });
            var res = await chitietsanpham.save();
            message += "Thêm sản phẩm với kích cỡ "+size+" thành công!";
            console.log('res', res)
        }
        console.log('END FOR')
    }
    if (sizes_add.length == 0 && sizes_delete == 0){
        response.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công!'
        })
    }
    
    response.json({
        success: true,
        message: 'Cập nhật sản phẩm thành công!'
    })
    
    

    // if (kichcoList_new.length>0){
    //     var v;
    //     for( v = 0; v<kichcoList_new.length; v++){
    //         try {
    //             var sp = await ChiTietSanPham.find({
    //                 kichco_id: kichcoList_new[v], mausanpham_id: mausanpham_id
    //             }).exec();
    //             console.log('sp', sp)
    //             if (sp.length != 0){
    //                 console.log('has exist', sp)
                    
    //             } else {
    //                 var chitietsanpham = new ChiTietSanPham({
    //                     mausanpham_id: mausanpham_id,
    //                     kichco_id: kichcoList_new[v],
    //                     soluong: 0
    //                 });
    //                 var res = await chitietsanpham.save();
    //                 console.log('res', res)
    //                 const result = await ChiTietSanPham.findById(res._id)
    //                         .populate('mausanpham_id').populate('kichco_id')
    //                             .populate({
    //                                 path: 'mausanpham_id',
    //                                 populate: [{path: 'hinh'}, {path: 'mausac_id'}, {path: 'sanpham_id'}]
    //                                 })
    //                             .exec();
    //                 console.log('added', result)
    //                 // response.json({
    //                 //     success: true,
    //                 //     message: 'Sản phẩm created thành công!',
    //                 //     data: result
    //                 // });
    //                 if (v == kichcoList_new.length-1 ){
    //                     console.log('ADD thành công!')
    //                     response.json({
    //                         success: true,
    //                         message: 'Thêm phân loại hàng thành công!',
    //                     });
    //                 }
    //             }
    //         } catch (error){
    //             console.log(error)
    //             response.json({
    //                 success: false,
    //                 message: error
    //             });
    //         }
    //     }
        
        
    // }else{
    //     response.json({
    //         success: false,
    //         message: 'Chưa chọn kích cỡ'
    //     })
    // }
    
    
};


exports.chitietsanpham_list = async(request, response) =>{
    try {
        
        const result = await ChiTietSanPham.find()
        .populate({
            path: 'mausanpham_id',
            populate: {
                path: 'mausac_id'
            }
        })
        .populate('kichco_id').exec();

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

exports.chitietsanpham_get = async(request, response)=>{
    try{
        const result =  await ChiTietSanPham.findById(request.params.id)
                        .populate('mausanpham_id').populate('kichco_id')
                        .populate({
                            path: 'mausanpham_id',
                            populate: [{path: 'hinh'}, {path: 'mausac_id'}, {path: 'sanpham_id'}]
                            })
                        .exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                message: 'Sản phẩm không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.chitietsanpham_update = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try{
        
        var result = await ChiTietSanPham.findById(request.params.id).exec();
        
        if (result){
            var sptrung = await ChiTietSanPham.find({ 
                kichco_id: request.body.kichco_id, 
                mausanpham_id: request.body.mausanpham_id})
                .exec();
            // response.json({          
            //     sptrung: sptrung
            // });
            if ((sptrung.length == 0) || (sptrung[0]._id == request.params.id)){
                result.set(request.body);
                var res = await result.save();
                const sp =  await ChiTietSanPham.findById(request.params.id)
                        .populate('mausanpham_id').populate('kichco_id')
                        .populate({
                            path: 'mausanpham_id',
                            populate: [{path: 'hinh'}, {path: 'mausac_id'}, {path: 'sanpham_id'}]
                            })
                        .exec();
                response.json({
                    success: true,
                    message: 'Cập nhật sản phẩm thành công!',
                    data: sp
                });
            }
            if (sptrung[0]._id != request.params.id){
                response.json({          
                    message: 'Sản phẩm đã tồn tại!',
                    data: sptrung
                });
            }
            
            
        } else{
            response.json({
                message: 'Sản phẩm không tồn tại!'
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

exports.chitietsanpham_delete = async(request, response)=>{
    try{
        var result = await ChiTietSanPham.findById(request.params.id).exec();
        if (result){
            var result = await ChiTietSanPham.deleteOne({ _id: request.params.id}).exec();
            response.json({
                message: 'Xóa sản phẩm thành công!'
            });
        } else{
            response.json({
                message: 'Sản phẩm không tồn tại!'
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