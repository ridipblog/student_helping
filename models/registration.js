const mongoose=require('mongoose');
let userSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    User_Name:String,
    User_Email:String,
    User_Phone:String,
    User_Password:String
},{collection:'registration'});
module.exports=mongoose.model('registration',userSchema);