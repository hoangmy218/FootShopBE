const NguoiDung = require('../models/NguoiDung.model')
const {response, request} = require('express');
const mongoClient = require('mongodb').MongoClient;
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator');
const jwkToPem = require('jwk-to-pem');
// const request = require('request');
exports.auth_signup = async(request, response)=>{
    try {
        const user = new NguoiDung(request.body)
        await user.save()
        const token = await user.generateAuthToken()
        response.send({ user, token})
    } catch (error) {
        console.log(error)
        response.json({
            message: error
        })
    }
}

exports.auth_register  = async(request, response)=>{
    try {
        var nd = await NguoiDung.find({ email: request.body.email}).exec();
        if (nd.length != 0){
            response.json({  
                success: false,        
                message: 'Email đã được đăng ký!',
                // data: nd
            });
        } else{
            const user = new NguoiDung(request.body)
            var user_new = await user.save();
            response.json({
                success: true,
                data: user_new
            })
        }
        
    } catch (error) {
        console.log(error)
        response.json({
            message: error
        })
    }
}
exports.auth_login = async(request, response)=>{
    
    try {
        const {email, matkhau} = request.body
        
        // const user = await NguoiDung.findByCredentials(email, matkhau)
        const user = await NguoiDung.findOne({email: email})
        
        if (!user){
            return response.status(422).json({message: 'Email or Password is not correct'});
        }
        
        const isPasswordMatch = await bcrypt.compare(matkhau, user.matkhau)
        if (!isPasswordMatch){
            return response.status(422).json({message: 'Email or Password is not correct'});
        }
        const token = await user.generateAuthToken()
        response.send({ user, token})
    } catch (error) {
        response.send(error)
    }
}

exports.auth_me = async(request, response)=>{
    try {
        console.log('request' , request.payload.username)
        var user = await NguoiDung.findById(request.payload.username).exec();
        console.log(user)
        response.json({
            success: true,
            data: user
        })
        
    } catch (error) {
        console.log(error)
        response.json({
            success: false,
            message: error
        })
    }
    // response.send(request.user)
}

exports.auth_logout = async(request, response)=>{
    try {
        request.user.tokens = request.user.tokens.filter((token)=>{
            return token.token != request.token
        })
        await request.user.save()
        response.json({
            success: true,
            message: 'Logout thành công!'
        })
    } catch (error) {
        response.send(error)
    }    
}

exports.auth_logoutall = async(request, response)=>{
    try {
        request.user.tokens.splice(0, request.user.tokens.length)
        await request.user.save()
        response.json({
            success: true,
            message: 'Đăng xuất thành công!'
        })
    } catch (error) {
        response.status(500).send(error)
    }
}
//Verify Token

// exports.validate = function(req, res, next) {
//     var token = req.headers['Authorization'];
//     request({
//         url: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_sMYPBjOhu/.well-known/jwks.json`,
//         json: true
//     }, function(error, response, body) {
//         if (!error && response.statusCode === 200) {
//             pems = {};
//             var keys = body['keys'];
//             for (var i = 0; i < keys.length; i++) {
//                 var key_id = keys[i].kid;
//                 var modulus = keys[i].n;
//                 var exponent = keys[i].e;
//                 var key_type = keys[i].kty;
//                 var jwk = { kty: key_type, n: modulus, e: exponent };
//                 var pem = jwkToPem(jwk);
//                 pems[key_id] = pem;
//             }
//             var decodedJwt = jwt.decode(token, { complete: true });
//             if (!decodedJwt) {
//                 console.log("Not a valid JWT token");
//                 res.status(401);
//                 return res.send("Invalid token");
//             }
//             var kid = decodedJwt.header.kid;
//             var pem = pems[kid];
//             if (!pem) {
//                 console.log('Invalid token');
//                 res.status(401);
//                 return res.send("Invalid token");
//             }
//             jwt.verify(token, pem, function(err, payload) {
//                 if (err) {
//                     console.log("Invalid Token.");
//                     res.status(401);
//                     return res.send('Unauthorized');
//                 } else {
//                     console.log("Valid Token.");
//                     req.payload = payload;
//                     req.token = token;
//                     return next();
//                 }
//             });
//         } else {
//             console.log("Error! Unable to download JWKs");
//             res.status(500);
//             return res.send("Error! Unable to download JWKs");
//         }
//     });
// }