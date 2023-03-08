const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const encoded = bodyParser.urlencoded({ extended: true });
const path = require('path');
const Registration = require('../models/registration');
require('../require/connection.js');
app.use(cookieParser());
app.use(session({ secret: "cookieSecret", resave: true, saveUninitialized: true }));
const send_mail = process.env.SEND_EMAIL;
const send_mail_pass = process.env.SEND_EMAIL_PASSWORD;
const to_mail = process.env.TO_MAIL;
app.post('/registration', encoded, async (req, res) => {
    var data = [req.body.user_name, req.body.user_email, req.body.user_phone, req.body.user_pass];
    var input1 = [];
    var check = true;
    var message = "";
    for (var i = 0; i < 4; i++) {
        if (data[i] === "") {
            check = false;
            break;
        }
        else {
            check = true;
        }
    }
    if (check) {
        const college_data = await Registration.find({ User_Email: data[1].trim().toLowerCase() });
        if (college_data.length === 0) {
            var otp = Math.floor((Math.random() * 10000) + 1);
            text_otp = otp.toString();
            var check_mail = await mailSender(to_mail, text_otp, data[0]);
            if (check_mail) {
                req.session.reg_college_name = data[0].trim();
                req.session.reg_college_email = data[1].trim();
                req.session.reg_college_phone = data[2].trim();
                req.session.reg_college_pass = data[3].trim();
                req.session.reg_otp = text_otp;
                return res.redirect('/reg_verify');
            }
            else {
                input = data;
                message = "Some Error In Mail ";
            }
        }
        else {
            input1 = [data[0], "", data[2], data[3]];
            message = "Email ID Already Exists ";
        }
    }
    else {
        input1 = data;
        message = "Input All Input Boxs !";
    }
    res.render('registration', {
        input1,
        style1: [
            "block",
            message
        ]
    })
})
app.get('/registration', async (req, res) => {
    if (req.session.log_otp) {
        res.redirect('/log_verify');
    }
    else if(req.cookies.college_email){
        res.redirect('/profile');
    }
    else {
        if (req.session.reg_otp) {
            req.session.destroy();
        }
        res.render('registration', {
            style1: [
                "none"
            ]
        })
    }
})
const mailSender = async (reciver, text_otp, college_name) => {
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: send_mail,
            pass: send_mail_pass,
        }
    });
    let mailOptions = {
        from: send_mail,
        to: reciver,
        subject: "Registration OTP For  " + college_name,
        text: "Your OTP " + text_otp
    }
    check_mail = true;
    transport.sendMail(mailOptions, (err, data) => {
        if (err) {
            check_mail = false;
        }
        else {
            check_mail = true;
        }
    });
    return check_mail;
}
module.exports = app;