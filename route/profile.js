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
const Reasons=require('../models/reasons');
require('../require/connection.js');
app.use(cookieParser());
app.use(session({secret:"cookieSecret",resave:true,saveUninitialized:true}));
const send_mail=process.env.SEND_EMAIL;
const send_mail_pass=process.env.SEND_EMAIL_PASSWORD;
const to_mail=process.env.TO_MAIL;
app.get('/profile',async(req,res)=>{
    if(req.session.reg_otp){
        res.redirect('/reg_verify');
    }
    else if(req.session.log_otp){
        res.redirect('/log_verify');
    }
    else if(req.cookies.college_email){
        res.render('profile',{
            style1:[
                "none",
            ],
            college_name:req.cookies.college_name
        });
    }
    else{
        res.redirect('/');
    }
});
app.post('/profile',encoded,async(req,res)=>{
    var data=[req.body.student_name,req.body.phone_no,req.body.student_email,req.body.parents_name,req.body.class,req.body.address.trim(),req.body.reason.trim(),req.body.contact]
    var check=true;
    var message=""
    var sendData=[];
    for(var i=0;i<7;i++){
        if(data[i]===""){
            check=false;
            break;
        }
        else{
            check=true;
        }
    }
    if(check){
        if(data[7]==="Select"){
            message="Select Contact Type";
            sendData=data;
        }
        else{
            const save_reason=new Reasons({
                _id:new mongoose.Types.ObjectId,
                Student_Name:data[0],
                Student_Phone:data[1],
                Student_Email:data[2],
                Parents_Name:data[3],
                Student_CLass:data[4],
                Student_Address:data[5],
                Student_Reason:data[6],
                Contact_Type:data[7],
                School_Email:req.cookies.college_email
            });
            const check_email=await mailSender(data[2],"Student Query Submited !","<h1>Thanks For Contact With Your Query !<h1>");
            if(check_email){
                var body="<h1>A New Student Query Add From "+req.cookies.college_name+"<h1>";
                const check_email_1=await mailSender(to_mail,"Query Information !",body);
                if(check_email_1){
                    const save_data=await save_reason.save();
                    message="Stuent Query Submited !";
                }
                else{
                    message="Some Error In Email !";
                    sendData=data;
                }
            }
            else{
                message="Some Error In Student Email !";
                sendData=data;
            }
        }
    }
    else{
        message="Fill All Inputs !";
        sendData=data;
    }
    res.render('profile',{
        sendData,
        style1:[
            "block",
            message
        ],
        college_name:req.cookies.college_name
    });
});
const mailSender= async (reciver,subject,message) =>{
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
        subject:subject,
        html:message
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