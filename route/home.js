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
const send_mail = process.env.SEND_EMAIL;
const send_mail_pass = process.env.SEND_EMAIL_PASSWORD;
app.post('/',encoded,async (req,res)=>{
    var data=[req.body.user_name,req.body.user_pass];
    var message="";
    var input1=[];
    var check=true;
    for(var i=0;i<2;i++){
        if(data[i]===""){
            check=false;
            break;
        }
        else{
            check=true;
        }
    }
    if(check){
        const college_data=await Registration.find({User_Email:data[0]});
        if(college_data.length===0){
            input1=["",data[1]];
            message="User Name Not Found ";
        }
        else{
            if(college_data[0].User_Password===data[1]){
                var otp = Math.floor((Math.random() * 10000) + 1);
	            text_otp=otp.toString();
                const check=await mailSender(college_data[0].User_Email,text_otp);
                if(check){
                    req.session.log_college_email=data[0];
                    req.session.log_otp=text_otp;
                    return res.redirect('/log_verify');
                }
                else{
                    message="Some Error In Your Email";
                    input1=[];
                }
            }
            else{
                input1=[data[0],""];
                message="User Password Not Matched !"
            }
        }
    }
    else{
        input1=data;
        message="Enter All Credentials !"
    }
    res.render('index',{
        input1,
        style1:[
            "block",
            message
        ]
    })
})
app.get('/',async (req,res)=>{
    if(req.session.reg_otp){
        res.redirect('/reg_verify');
    }
    else if(req.cookies.college_email){
        res.redirect('/profile');
    }
    else{
        if(req.session.log_otp){
            req.session.destroy();
        }
        res.render('index',{
            style1:[
                "none"
            ]
        })
    }
})

const mailSender= async (reciver,text_otp) =>{
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
        subject:"Your Login OTP  ",
        text:"Your OTP "+text_otp
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