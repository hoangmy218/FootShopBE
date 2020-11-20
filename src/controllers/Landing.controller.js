
const ChiTietSanPham = require('../models/ChiTietSanPham.model');
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const DonGia = require('../models/DonGia.model');
const SanPham = require('../models/SanPham.model');
const MauSanPhamModel = require('../models/MauSanPham.model');
const HinhAnhModel = require('../models/HinhAnh.model');
const BinhLuanModel = require('../models/BinhLuan.model');
const {check, validationResult} = require('express-validator');
const DanhMucModel = require('../models/DanhMuc.model');
const ThuongHieuModel = require('../models/ThuongHieu.model');
const HTVC = require('../models/HTVC.model');
const HTTT = require('../models/HTTT.model');
const stripe = require('stripe')('sk_test_51HHmGZJ6o6GkwUDly7YZgf0ObwbYQcS6tZ9VJsjimnJmjWejzARPERav14oKpa3CCncCxwiVE9ICXmGVUWszWf4E00zCrtJ4gB');

exports.sanpham_timkiem = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {
        var key = request.body.ten
        var thuonghieu = request.body.thuonghieu
        var danhmuc = request.body.danhmuc
        var query = {}
        if (key){
            query.ten = { $regex: key, $options: "i"}
        }
        if (danhmuc){
            query.danhmuc_id = danhmuc
        }
        if (thuonghieu){
            query.thuonghieu_id = thuonghieu
        }
        query.trangthai = true
        //var query = {ten: { $regex:  key, $options: "i"}, danhmuc_id: danhmuc, thuonghieu_id: thuonghieu}
        var result = await SanPham.find(query).exec()
        response.json({
            thuonghieu: thuonghieu,
            danhmuc: danhmuc,
            params: request.body,
            data: result
        })
    } catch (error) {
        response.json({
            error: error
        })
    }
}
exports.sanpham_timkiem2 = async(request, response)=>{
    var errors = validationResult(request)
    if (!errors.isEmpty()){
        response.json({
            error: errors
        })
    }
    try {
        var key = request.body.ten
        var query = {}
        if (key){
            query.ten = { $regex: key, $options: "i"}
        }
        query.trangthai = true;

        query.trangthai = true
        //var query = {ten: { $regex:  key, $options: "i"}, danhmuc_id: danhmuc, thuonghieu_id: thuonghieu}
        // var result = await SanPham.find(query).exec()
        try {
            var result = []
            // var sanpham = []
            var sp_hople = []
            var sanpham = await SanPham.find(query).populate('khuyenmai_id').exec()
            console.log('SAN PHAM', sanpham)
            var ctsp = await ChiTietSanPham.aggregate([
                {
                    $match: {
                        $and: [
                            {soluong: {$gt: 0}}
                        ]
                    }
                },
                // {$group: {
                //     _id: '$mausanpham_id'
                // }}
                
            ]);
            // console.log('-----------CTSP ARR---------',ctsp);
            var ctsp_msp = await ChiTietSanPham.aggregate([
                {
                    $match: {
                        $and: [
                            {soluong: {$gt: 0}}
                        ]
                    }
                },
                {$group: {
                    _id: '$mausanpham_id'
                }}
                
            ]);
            // console.log('-----------CTSP MSP ARR---------',ctsp_msp);
            var y = 0;
            for (const c_msp of ctsp_msp){
                var msp_data = await MauSanPhamModel.findById(c_msp._id).exec();
                console.log(msp_data, c_msp._id)
                var sp_data = await SanPham.findById(msp_data.sanpham_id).exec();
                console.log('sp_data', sp_data)
                if (sp_data.trangthai == true){
                    sp_hople[y]={}
                    sp_hople[y].sanpham = sp_data
                }
            }
    
    
            // for(var i = 0; i<sanpham.length; i++){
            for( const [i, sanpham_i] of sanpham.entries()){
                result[i] = {}
                result[i].sanpham = sanpham_i
                var gia = await DonGia.find({sanpham_id: sanpham_i._id}).sort({ngay: -1}).limit(1).exec();
                result[i].dongia = gia[0].dongia
                // sp_hople[i].dongia = gia[0].dongia
                
                var msp = await MauSanPhamModel.find({
                    sanpham_id: sanpham_i._id
                })
                .populate('mausac_id').populate('hinh[]').exec()
                result[i].mausanpham = []
                // for (var j =0; j<msp.length; j++){
                
                // console.log('SANPHAM ',sanpham_i._id, 'MSP', msp)
                for(const [j,msp_j] of msp.entries()){
                    // console.log('MSP HINH', msp_j)
                    if (msp_j.hinh == null){
                        continue;
                    }
                    
                    // ctsp.forEach(function(doc){
                        var haveStock = false;
                        var x =0;
                    for(const doc of ctsp){
                        console.log('DOC', doc, "MSP J ", msp_j._id)
                        if (doc.mausanpham_id+"" == msp_j._id+"" ){
                            // if (haveStock == false){
                                // console.log('--------HOP LEEEEE----------', haveStock)
                                // console.log('MSP BEFORE',x, result[i].mausanpham[x])
                                // result[i].mausanpham[x] = {};
                                mau_hinh = {};
                            //     haveStock = true;
                            // }
                            // console.log('MSP MIIDLE x',x,result[i], result[i].mausanpham[x], haveStock)
                            // console.log('doc', doc, 'x',x,'mspj', msp_j)
                            mau_hinh.mau = msp_j;
                            // result[i].mausanpham.mau = msp_j;
                            // console.log('MSP AFTER', x,result[i], result[i].mausanpham[x])
                            // if (msp_j.hinh!= null){
                            // console.log('HINH', msp_j.hinh[0])
                            // result[i].mausanpham[x] = {};
                            var hinh = await HinhAnhModel.findById(msp_j.hinh[0]).exec()
                            if (hinh){
                                mau_hinh.hinh = hinh;
                                if (result[i].mausanpham.length > 0){
                                    const duplicate = result[i].mausanpham.find(element=> element.mau._id == mau_hinh.mau._id);
                                    // console.log('DUPLICATE', duplicate)
                                    if (duplicate != undefined){
                                        // console.log('KHAC undefined')
                                        
                                    }else{
                                        // console.log('before add',result[i].mausanpham)
                                        result[i].mausanpham.push(mau_hinh);
                                        // console.log('after add',result[i].mausanpham)
                                    }
                                }else{
                                    result[i].mausanpham.push(mau_hinh);
                                }
                                x++;
                            }else{
                                mau_hinh.hinh = {
                                    "_id": "5f9283044bed53304c8d1d5c",
                                    "hinh": "http://localhost:3000/uploads/image-1603437316801.png",
                                    "stt": 2,
                                    "__v": 0
                                }
                                result[i].mausanpham.push(mau_hinh);
                                x++;
                            }
                       }  
                    }
                             
                }
                console.log('result', result[i])
            }
            var array_end = result.filter(function(el){
                return el.mausanpham.length != 0
            })
            // console.log('-------RESULT---', result)
            // console.log('-------ARRAY FiLTER---', array_end)
            response.json({
                data: sanpham,
                result: array_end
            })
        } catch (error) {
            console.log(error)
            response.json({
                error: error
            })
        }
    } catch (error) {
        response.json({
            error: error
        })
    }
}


exports.sanpham_list = async(request, response)=>{
    try {
        var result = []
        var sanpham = []
        sanpham = await SanPham.find({trangthai: true}).populate('khuyenmai_id').exec()
        for(var i = 0; i<sanpham.length; i++){
            result[i] = {}
            result[i].sanpham = sanpham[i]
            var gia = await DonGia.find({sanpham_id: sanpham[i]._id}).sort({ngay: -1}).limit(1).exec();
            result[i].dongia = gia[0].dongia
            
            var msp = await MauSanPhamModel.find({
                sanpham_id: sanpham[i]._id
            })
            .populate('mausac_id').populate('hinh[]').exec()
            result[i].mausanpham = []
            for (var j =0; j<msp.length; j++){
                result[i].mausanpham[j] = {}
                result[i].mausanpham[j].mau = msp[j]
                if (msp[j].hinh!= null){
                    var hinh = await HinhAnhModel.findById(msp[j].hinh[0]).exec()
                    result[i].mausanpham[j].hinh = hinh
                }
                
                
            }
            console.log('msp',msp)
            //result[i].mau = msp
            console.log('result', result[i])
        }
        response.json({
            data: sanpham,
            result: result
        })
    } catch (error) {
        console.log(error)
        response.json({
            error: error
        })
    }
}

exports.sanpham_list2 = async(request, response)=>{
    try {
        var result = []
        // var sanpham = []
        var sp_hople = []
        var sanpham = await SanPham.find({trangthai: true}).populate('khuyenmai_id').exec()
        console.log('SAN PHAM', sanpham)
        var ctsp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            // {$group: {
            //     _id: '$mausanpham_id'
            // }}
            
        ]);
        // console.log('-----------CTSP ARR---------',ctsp);
        var ctsp_msp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            {$group: {
                _id: '$mausanpham_id'
            }}
            
        ]);
        // console.log('-----------CTSP MSP ARR---------',ctsp_msp);
        var y = 0;
        for (const c_msp of ctsp_msp){
            var msp_data = await MauSanPhamModel.findById(c_msp._id).exec();
            console.log(msp_data, c_msp._id)
            var sp_data = await SanPham.findById(msp_data.sanpham_id).exec();
            console.log('sp_data', sp_data)
            if (sp_data.trangthai == true){
                sp_hople[y]={}
                sp_hople[y].sanpham = sp_data
            }
        }


        // for(var i = 0; i<sanpham.length; i++){
        for( const [i, sanpham_i] of sanpham.entries()){
            result[i] = {}
            result[i].sanpham = sanpham_i
            var gia = await DonGia.find({sanpham_id: sanpham_i._id}).sort({ngay: -1}).limit(1).exec();
            result[i].dongia = gia[0].dongia
            // sp_hople[i].dongia = gia[0].dongia
            
            var msp = await MauSanPhamModel.find({
                sanpham_id: sanpham_i._id
            })
            .populate('mausac_id').populate('hinh[]').exec()
            result[i].mausanpham = []
            // for (var j =0; j<msp.length; j++){
            
            // console.log('SANPHAM ',sanpham_i._id, 'MSP', msp)
            for(const [j,msp_j] of msp.entries()){
                // console.log('MSP HINH', msp_j)
                if (msp_j.hinh == null){
                    continue;
                }
                
                // ctsp.forEach(function(doc){
                    var haveStock = false;
                    var x =0;
                for(const doc of ctsp){
                    console.log('DOC', doc, "MSP J ", msp_j._id)
                    if (doc.mausanpham_id+"" == msp_j._id+"" ){
                        // if (haveStock == false){
                            // console.log('--------HOP LEEEEE----------', haveStock)
                            // console.log('MSP BEFORE',x, result[i].mausanpham[x])
                            // result[i].mausanpham[x] = {};
                            mau_hinh = {};
                        //     haveStock = true;
                        // }
                        // console.log('MSP MIIDLE x',x,result[i], result[i].mausanpham[x], haveStock)
                        // console.log('doc', doc, 'x',x,'mspj', msp_j)
                        mau_hinh.mau = msp_j;
                        // result[i].mausanpham.mau = msp_j;
                        // console.log('MSP AFTER', x,result[i], result[i].mausanpham[x])
                        // if (msp_j.hinh!= null){
                        // console.log('HINH', msp_j.hinh[0])
                        // result[i].mausanpham[x] = {};
                        var hinh = await HinhAnhModel.findById(msp_j.hinh[0]).exec()
                        if (hinh){
                            mau_hinh.hinh = hinh;
                            if (result[i].mausanpham.length > 0){
                                const duplicate = result[i].mausanpham.find(element=> element.mau._id == mau_hinh.mau._id);
                                // console.log('DUPLICATE', duplicate)
                                if (duplicate != undefined){
                                    // console.log('KHAC undefined')
                                    
                                }else{
                                    // console.log('before add',result[i].mausanpham)
                                    result[i].mausanpham.push(mau_hinh);
                                    // console.log('after add',result[i].mausanpham)
                                }
                            }else{
                                result[i].mausanpham.push(mau_hinh);
                            }
                            x++;
                        }else{
                            mau_hinh.hinh = {
                                "_id": "5f9283044bed53304c8d1d5c",
                                "hinh": "http://localhost:3000/uploads/image-1603437316801.png",
                                "stt": 2,
                                "__v": 0
                            }
                            result[i].mausanpham.push(mau_hinh);
                            x++;
                        }
                   }  
                }
                         
            }
            console.log('result', result[i])
        }
        var array_end = result.filter(function(el){
            return el.mausanpham.length != 0
        })
        console.log('-------RESULT---', result)
        console.log('-------ARRAY FiLTER---', array_end)
        response.json({
            data: sanpham,
            result: array_end
        })
    } catch (error) {
        console.log(error)
        response.json({
            error: error
        })
    }
}

exports.sanpham_probrand = async(request, response)=>{
    try {
        var result = []
        // var sanpham = []
        var sp_hople = []
        var sanpham = await SanPham.find({trangthai: true, thuonghieu_id: request.params.thuonghieu_id}).populate('khuyenmai_id').exec()
        console.log('SAN PHAM', sanpham)
        var ctsp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            // {$group: {
            //     _id: '$mausanpham_id'
            // }}
            
        ]);
        // console.log('-----------CTSP ARR---------',ctsp);
        var ctsp_msp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            {$group: {
                _id: '$mausanpham_id'
            }}
            
        ]);
        // console.log('-----------CTSP MSP ARR---------',ctsp_msp);
        var y = 0;
        for (const c_msp of ctsp_msp){
            var msp_data = await MauSanPhamModel.findById(c_msp._id).exec();
            console.log(msp_data, c_msp._id)
            var sp_data = await SanPham.findById(msp_data.sanpham_id).exec();
            console.log('sp_data', sp_data)
            if (sp_data.trangthai == true){
                sp_hople[y]={}
                sp_hople[y].sanpham = sp_data
            }
        }


        // for(var i = 0; i<sanpham.length; i++){
        for( const [i, sanpham_i] of sanpham.entries()){
            result[i] = {}
            result[i].sanpham = sanpham_i
            var gia = await DonGia.find({sanpham_id: sanpham_i._id}).sort({ngay: -1}).limit(1).exec();
            result[i].dongia = gia[0].dongia
            // sp_hople[i].dongia = gia[0].dongia
            
            var msp = await MauSanPhamModel.find({
                sanpham_id: sanpham_i._id
            })
            .populate('mausac_id').populate('hinh[]').exec()
            result[i].mausanpham = []
            // for (var j =0; j<msp.length; j++){
            
            // console.log('SANPHAM ',sanpham_i._id, 'MSP', msp)
            for(const [j,msp_j] of msp.entries()){
                // console.log('MSP HINH', msp_j)
                if (msp_j.hinh == null){
                    continue;
                }
                
                // ctsp.forEach(function(doc){
                    var haveStock = false;
                    var x =0;
                for(const doc of ctsp){
                    console.log('DOC', doc, "MSP J ", msp_j._id)
                    if (doc.mausanpham_id+"" == msp_j._id+"" ){
                        // if (haveStock == false){
                            // console.log('--------HOP LEEEEE----------', haveStock)
                            // console.log('MSP BEFORE',x, result[i].mausanpham[x])
                            // result[i].mausanpham[x] = {};
                            mau_hinh = {};
                        //     haveStock = true;
                        // }
                        // console.log('MSP MIIDLE x',x,result[i], result[i].mausanpham[x], haveStock)
                        // console.log('doc', doc, 'x',x,'mspj', msp_j)
                        mau_hinh.mau = msp_j;
                        // result[i].mausanpham.mau = msp_j;
                        // console.log('MSP AFTER', x,result[i], result[i].mausanpham[x])
                        // if (msp_j.hinh!= null){
                        // console.log('HINH', msp_j.hinh[0])
                        // result[i].mausanpham[x] = {};
                        var hinh = await HinhAnhModel.findById(msp_j.hinh[0]).exec()
                        if (hinh){
                            mau_hinh.hinh = hinh;
                            if (result[i].mausanpham.length > 0){
                                const duplicate = result[i].mausanpham.find(element=> element.mau._id == mau_hinh.mau._id);
                                // console.log('DUPLICATE', duplicate)
                                if (duplicate != undefined){
                                    // console.log('KHAC undefined')
                                    
                                }else{
                                    // console.log('before add',result[i].mausanpham)
                                    result[i].mausanpham.push(mau_hinh);
                                    // console.log('after add',result[i].mausanpham)
                                }
                            }else{
                                result[i].mausanpham.push(mau_hinh);
                            }
                            x++;
                        }else{
                            mau_hinh.hinh = {
                                "_id": "5f9283044bed53304c8d1d5c",
                                "hinh": "http://localhost:3000/uploads/image-1603437316801.png",
                                "stt": 2,
                                "__v": 0
                            }
                            result[i].mausanpham.push(mau_hinh);
                            x++;
                        }
                   }  
                }
                         
            }
            console.log('result', result[i])
        }
        var array_end = result.filter(function(el){
            return el.mausanpham.length != 0
        })
        console.log('-------RESULT---', result)
        console.log('-------ARRAY FiLTER---', array_end)
        response.json({
            data: sanpham,
            result: array_end
        })
    } catch (error) {
        console.log(error)
        response.json({
            error: error
        })
    }
}
exports.sanpham_procate = async(request, response)=>{
    try {
        var result = []
        // var sanpham = []
        var sp_hople = []
        var sanpham = await SanPham.find({trangthai: true, danhmuc_id: request.params.danhmuc_id}).populate('khuyenmai_id').exec()
        console.log('SAN PHAM', sanpham)
        var ctsp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            // {$group: {
            //     _id: '$mausanpham_id'
            // }}
            
        ]);
        // console.log('-----------CTSP ARR---------',ctsp);
        var ctsp_msp = await ChiTietSanPham.aggregate([
            {
                $match: {
                    $and: [
                        {soluong: {$gt: 0}}
                    ]
                }
            },
            {$group: {
                _id: '$mausanpham_id'
            }}
            
        ]);
        // console.log('-----------CTSP MSP ARR---------',ctsp_msp);
        var y = 0;
        for (const c_msp of ctsp_msp){
            var msp_data = await MauSanPhamModel.findById(c_msp._id).exec();
            console.log(msp_data, c_msp._id)
            var sp_data = await SanPham.findById(msp_data.sanpham_id).exec();
            console.log('sp_data', sp_data)
            if (sp_data.trangthai == true){
                sp_hople[y]={}
                sp_hople[y].sanpham = sp_data
            }
        }


        // for(var i = 0; i<sanpham.length; i++){
        for( const [i, sanpham_i] of sanpham.entries()){
            result[i] = {}
            result[i].sanpham = sanpham_i
            var gia = await DonGia.find({sanpham_id: sanpham_i._id}).sort({ngay: -1}).limit(1).exec();
            result[i].dongia = gia[0].dongia
            // sp_hople[i].dongia = gia[0].dongia
            
            var msp = await MauSanPhamModel.find({
                sanpham_id: sanpham_i._id
            })
            .populate('mausac_id').populate('hinh[]').exec()
            result[i].mausanpham = []
            // for (var j =0; j<msp.length; j++){
            
            // console.log('SANPHAM ',sanpham_i._id, 'MSP', msp)
            for(const [j,msp_j] of msp.entries()){
                // console.log('MSP HINH', msp_j)
                if (msp_j.hinh == null){
                    continue;
                }
                
                // ctsp.forEach(function(doc){
                    var haveStock = false;
                    var x =0;
                for(const doc of ctsp){
                    console.log('DOC', doc, "MSP J ", msp_j._id)
                    if (doc.mausanpham_id+"" == msp_j._id+"" ){
                        // if (haveStock == false){
                            // console.log('--------HOP LEEEEE----------', haveStock)
                            // console.log('MSP BEFORE',x, result[i].mausanpham[x])
                            // result[i].mausanpham[x] = {};
                            mau_hinh = {};
                        //     haveStock = true;
                        // }
                        // console.log('MSP MIIDLE x',x,result[i], result[i].mausanpham[x], haveStock)
                        // console.log('doc', doc, 'x',x,'mspj', msp_j)
                        mau_hinh.mau = msp_j;
                        // result[i].mausanpham.mau = msp_j;
                        // console.log('MSP AFTER', x,result[i], result[i].mausanpham[x])
                        // if (msp_j.hinh!= null){
                        // console.log('HINH', msp_j.hinh[0])
                        // result[i].mausanpham[x] = {};
                        var hinh = await HinhAnhModel.findById(msp_j.hinh[0]).exec()
                        if (hinh){
                            mau_hinh.hinh = hinh;
                            if (result[i].mausanpham.length > 0){
                                const duplicate = result[i].mausanpham.find(element=> element.mau._id == mau_hinh.mau._id);
                                // console.log('DUPLICATE', duplicate)
                                if (duplicate != undefined){
                                    // console.log('KHAC undefined')
                                    
                                }else{
                                    // console.log('before add',result[i].mausanpham)
                                    result[i].mausanpham.push(mau_hinh);
                                    // console.log('after add',result[i].mausanpham)
                                }
                            }else{
                                result[i].mausanpham.push(mau_hinh);
                            }
                            x++;
                        }else{
                            mau_hinh.hinh = {
                                "_id": "5f9283044bed53304c8d1d5c",
                                "hinh": "http://localhost:3000/uploads/image-1603437316801.png",
                                "stt": 2,
                                "__v": 0
                            }
                            result[i].mausanpham.push(mau_hinh);
                            x++;
                        }
                   }  
                }
                         
            }
            console.log('result', result[i])
        }
        var array_end = result.filter(function(el){
            return el.mausanpham.length != 0
        })
        // console.log('-------RESULT---', result)
        // console.log('-------ARRAY FiLTER---', array_end)
        response.json({
            data: sanpham,
            result: array_end
        })
    } catch (error) {
        console.log(error)
        response.json({
            error: error
        })
    }
}

exports.danhmuc_get = async(request, response)=>{
    try{
        var result = await DanhMucModel.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Danh mục không tồn tại'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.thuonghieu_get = async(request, response)=>{
    try{
        var result = await ThuongHieuModel.findById(request.params.id).exec();
        if (result){
            response.json({
                data: result
            });
        } else{
            response.json({
                success: false,
                message: 'Thương hiệu không tồn tại!'
            });
        }
        
    } catch (error){
        response.status(500).error(error);
    }
};

exports.sanpham_details = async(request, response)=>{
    try {
        var ma_sanpham = request.params.id 
        var ma_mausac = request.params.color
        sanpham = await SanPham.findById(ma_sanpham).populate('khuyenmai_id').exec()
        console.log('sp', sanpham)
        var list_procolor = await MauSanPhamModel.find({sanpham_id: ma_sanpham, hinh: {$ne: null}}).populate('mausac_id').populate('hinh[]').exec()
        var list_procolor_ok = [];
        for (const procolor of list_procolor){
            console.log('ptocolor', procolor)
            var ctsp = await ChiTietSanPham.find({mausanpham_id: procolor._id, soluong: {$gt: 0}}).exec(); //>0
            if (ctsp.length != 0){
                list_procolor_ok.push(procolor)
                console.log('list pc ok', list_procolor_ok)
            }
        }
        var procolor = await MauSanPhamModel.findOne({sanpham_id: ma_sanpham, mausac_id: ma_mausac}) 
            .populate('mausac_id').exec()
        console.log('procolor',procolor);
        if (procolor.hinh != null){ 
            var imgs = procolor.hinh //image không tồn tại! id: 5f9283044bed53304c8d1d5c
            console.log('imgs', imgs)
            var hinh = []
            for (var i=0; i<imgs.length; i++){
                var img_res = await HinhAnhModel.findById(imgs[i]).exec();
                if (img_res == null){
                    var img_not_found_id = "5f9283044bed53304c8d1d5c"
                    hinh[i] = await HinhAnhModel.findById(img_not_found_id).exec();
                }else{
                    hinh.push(img_res)
                }
                console.log('imgs', i,imgs[i])
                console.log('hinh i', i, hinh[i])
    
            }
        }
       
        
        var list_size = await ChiTietSanPham.find({mausanpham_id: procolor._id, soluong: {$ne: 0}}).sort({ten: -1}) //!= null
        .populate('kichco_id').exec()
        console.log('size list', list_size)
        var gia = await DonGia.find({sanpham_id: ma_sanpham}).sort({ngay: -1}).limit(1).exec();
        
        // var ctsp_hople = await ChiTietSanPham.find({})
        
        response.json({
            data: sanpham,
            list_procolor: list_procolor_ok,
            procolor: procolor,
            hinh: hinh,
            list_size: list_size,
            dongia: gia
        })
    } catch (error) {
        console.log(error)
        response.json({
            error: error
        })
    }
}

exports.sanpham_comment = async(request, response)=>{
    try {
        var comment = await BinhLuanModel.find({sanpham_id: request.params.id}).sort({ngaybl: -1}).exec()
        response.json({
            data: comment
        })
    } catch (error) {
        response.json({
            error: error
        })
    }
}

exports.sanpham_color = async(request, response)=>{
    try{
        var ChiTietSanPham = await ChiTietSanPham.find().exec()
        response.json({
            data: ChiTietSanPham
        })
    } catch (error){
        response.json({
            error: error
        })
    }
}

exports.danhmuc_list = async(request, response)=>{
    try {
        var danhmuc = await DanhMucModel.find().exec()
        response.json({
            data: danhmuc
        })
    } catch (error){
        response.json({
            error: error
        })
    }
}

exports.thuonghieu_list = async(request, response)=>{
    try {
        var thuonghieu = await ThuongHieuModel.find().exec()
        response.json({
            data: thuonghieu
        })
    } catch (error){
        response.json({
            error: error
        })
    }
}

exports.soluong_get = async(request, response)=>{
    try{
        var sl = await ChiTietSanPham.findById(request.params.id).exec();
        response.json({
            data: sl
        })
    }catch (error){
        response.json({
            error: error
        })
    }
}

exports.htvc_get = async(request, response)=>{
    try{
        var sl = await HTVC.find().exec();
        response.json({
            data: sl
        })
    }catch (error){
        response.json({
            error: error
        })
    }
}

exports.htvc_details = async(request, response)=>{
    try{
        var sl = await HTVC.findById(request.params.id).exec();
        response.json({
            data: sl
        })
    }catch (error){
        response.json({
            error: error
        })
    }
}
exports.httt_get = async(request, response)=>{
    try{
        var sl = await HTTT.find().exec();
        response.json({
            data: sl
        })
    }catch (error){
        response.json({
            error: error
        })
    }
}

exports.stripePost = async(request, response)=>{
    var total = Math.round(Math.round(request.body.total,2)*100);
    stripe.charges.create({
        amount: total,
        currency:'USD',
        description: 'One-time setup fee',
        source: request.body.token
    }, (error, charge)=>{
        if (error){
            next(error);
        }
        response.json({
            success: true,
            message: 'Thanh toán thành công'
        });
    })
    console.log(request.body)
}

exports.mausanpham_prolist = async(request, response)=>{
    try {
        var res = [];
        var item = {};

        const result = await MauSanPhamModel.findById(request.params.id).populate('hinh').exec();
        
        response.json({
            data: result,
            details: res
        });
    } catch (error) {
        console.log(error)
        response.json({
            success: false,
            message: error
        })
    }
}
