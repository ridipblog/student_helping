const express=require('express');
const app=express();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const encoded=bodyParser.urlencoded({extended:true});
const path=require('path');
const Registration=require('../models/registration');
const Reasons=require('../models/reasons');
require('../require/connection.js');
app.use(cookieParser());
app.use(session({secret:"cookieSecret",resave:true,saveUninitialized:true}));
app.get('*',(req,res)=>{
    res.render('error');
})
module.exports=app;