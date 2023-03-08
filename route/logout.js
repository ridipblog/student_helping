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
app.get('/logout',async(req,res)=>{
    if(req.cookies.college_email)
	{
		res.clearCookie("college_email");
        res.clearCookie("college_name");
		return res.redirect("/");
	}
    else if(req.session.reg_otp){
        res.redirect('/reg_verify');
    }
    else if(req.session.log_otp){
        res.redirect('/log_verify');
    }
    else{
        res.redirect('/');
    }
});
module.exports=app;