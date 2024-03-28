
// import { mongoose } from "mongoose"
const mongoose= require("mongoose")

mongoose.connect("mongodb+srv://maniking22000:7kBWgivy7dANVMu9@cluster0.xushncm.mongodb.net/paytm")


const userSchema=new mongoose.Schema({
    username: String,
    password:String,
    firstname:String,
    lastname:String
})

const accountSchema=new mongoose.Schema({
    userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
    },
    balance:{
        type:Number,
        required:true
    }

})

const User=mongoose.model("User",userSchema)
const Account=mongoose.model("Account",accountSchema)

module.exports={
    User,
    Account
}