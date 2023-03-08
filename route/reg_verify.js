const express=require('express');
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const nodemailer=require('nodemailer');
const encoded=bodyParser.urlencoded({extended:true});
const path=require('path');
const Registration=require('../models/registration');
require('../require/connection.js');
app.use(cookieParser());
app.use(session({secret:"cookieSecret",resave:true,saveUninitialized:true}));
const send_mail=process.env.SEND_EMAIL;
const send_mail_pass=process.env.SEND_EMAIL_PASSWORD;
app.post('/reg_verify',encoded,async (req,res)=>{
    var user_otp=req.body.reg_otp;
    var message="";
    if(user_otp===""){
        message="Enter Your OTP ";
    }
    else{
        otp=req.session.reg_otp;
        if(otp===user_otp){
            const save_college=new Registration({
                _id:new mongoose.Types.ObjectId,
                User_Name:req.session.reg_college_name,
                User_Email:req.session.reg_college_email,
                User_Phone:req.session.reg_college_phone,
                User_Password:req.session.reg_college_pass
            });
            const save_data=await save_college.save();
            const check_mail=await mailSender(req.session.reg_college_email);
            req.session.destroy();
            return res.redirect('/');
        }
        else{
            message="OTP Not Currect !";
        }
    }
    res.render('reg_verify',{
        style1:[
            "block",
            message
        ]
    })
})
app.get('/reg_verify',async (req,res)=>{
    if(req.session.reg_otp){
        res.render('reg_verify',{
            style1:[
                "none"
            ]
        });
    }
    else if(req.session.log_otp){
        res.redirect('/log_verify');
    }
    else if(req.cookies.college_email){
        res.redirect('/profile');
    }
    else{
        res.redirect('/registration');
    }
});

const mailSender= async (reciver) =>{
    let transport=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:send_mail,
            pass:send_mail_pass,
        }
    });
    let mailOptions={
        from:send_mail,
        to:reciver,
        subject:"Thank You For Your Registration !",
        html:"<h2>Click Link Below </h2><br><a href='www.google.com'>Website !</a>"
    }
    check_mail=true;
    transport.sendMail(mailOptions,(err,data)=>{
        if(err)
        {
            check_mail=false;
        }
        else
        {
            check_mail=true;
        }
    });
    return check_mail;
}
module.exports=app;