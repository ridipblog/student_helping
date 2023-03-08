const mongoose=require('mongoose');
let userSchema=new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    Student_Name:String,
    Student_Phone:String,
    Student_Email:String,
    Parents_Name:String,
    Student_CLass:String,
    Contact_Type:String,
    Student_Address:String,
    Student_Reason:String,
    School_Email:String
},{collection:'reasons'});
module.exports=mongoose.model('reasons',userSchema);