const YeuThich = require('../models/YeuThich.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const SanPham = require('../models/SanPham.model');
const {check, validationResult} = require('express-validator');

exports.YeuThich_create = async(request, response)=>{
    try {
        var dssp = await YeuThich.find(
            { nguoidung_id: request.payload.username}).exec();
        
        if (dssp.length == 0){
            var yeuthich = new YeuThich({
                nguoidung_id: request.payload.username,
                sanpham_ids: request.params.id
            })
            var yc = await yeuthich.save()
            response.json({
                success: true,
                message: 'Thêm sản phẩm vào danh sách yêu thích thành công!',
                data: yc
            })
        } else {
            var ds_sanpham = await YeuThich.findById(dssp[0]._id).exec();
            //KIEM TRA SAN PHAM TRUNG
            var sanphamtrung = ds_sanpham.sanpham_ids.filter(function(e, i){
                return ds_sanpham.sanpham_ids[i] == request.params.id
            })
            if (sanphamtrung.length == 0){
                var sanpham_moi = request.params.id
                ds_sanpham.sanpham_ids = ds_sanpham.sanpham_ids.concat(sanpham_moi)
                var ds = await ds_sanpham.save()
                response.json({
                    success: true,
                    data: ds,
                    message: 'Thêm sản phẩm vào danh sách yêu thích thành công!',
                    sp: ds_sanpham.sanpham_ids
                })
            } else{
                response.json({
                    message: 'Sản phẩm đã có trong danh sách yêu thích!'
                })
            }
            
        }
    } catch (error) {
        response.json({
            success: false,
            error: error,
            message: 'Không thể thêm sản phẩm vào danh sách yêu thích!'
        })
    }
}

exports.YeuThich_list  = async(request, response)=>{
    try {
        var ds_sanpham = await YeuThich.find(
            { nguoidung_id: request.payload.username}).exec();
        response.json({
            data: ds_sanpham
        })
    } catch (error) {
        response.json({
            success: false,
            error: error
        })
    }
}

exports.YeuThich_delete = async(request, response)=>{
    try {
        var dssp = await YeuThich.find(
            { nguoidung_id: request.payload.username}).exec();
        if (dssp.length == 0){
            response.json({
                message: 'Danh sách yêu thích trống!'
            })
        }
        var ds_sanpham = await YeuThich.findById(dssp[0]._id).exec();
        
        //KIEM TRA SAN PHAM K TRUNG
        var sanpham = ds_sanpham.sanpham_ids.filter(function(e, i){
            return ds_sanpham.sanpham_ids[i] != request.params.id
        })
        if (sanpham.length >= 1){
            ds_sanpham.sanpham_ids = sanpham
            await ds_sanpham.save()
            //var dssp_moi = await YeuThich.findById(dssp[0]._id).exec();
            
            response.json({
                success: true,
                message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!'
            })
        } else{
            await YeuThich.deleteOne({_id: dssp[0]._id}).exec()
            response.json({
                success: true,
                message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!'
            })
        }
    } catch (error) {
        response.json({
            success: false,
            error: error
        })
    }
}