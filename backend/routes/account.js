const express=require("express");
const { authmiddleware } = require("../middleware");
const { User, Account } = require("../db");
const app=express()
const mongoose=require("mongoose");


app.get("/balance",authmiddleware,async (req,res)=>{
    const user=await Account.findOne({
        userId: req.userId
    })
    res.status(200).json({
        balance:user.balance
    })

})
//bad solution
// app.post("/transfer",authmiddleWare,async(req,res)=>{
//     const {to,amount}=req.body
//     const sender=await Account.findOne({
//         userId:req.userId
//     })

//     if(amount>sender.balance){
//         return res.status(411).json({
//             message:"Insufficient balance"
//         })
//     }
//     const reciever=await Account.findOne({
//         userId:to
//     })
//     if(!reciever){
//         return res.status(400).json({
//             message:"Invalid account data"
//         })
//     }

//     await Account.findOneAndUpdate({userId:req.userId},{
//         "$inc":{
//             balance: -amount
//         }
//     })

//     await Account.findOneAndUpdate({userId:to},{
//         "$inc":{
//             balance: +amount
//         }
//     })

//     res.status(200).json({
//         message:"Transfer successfull"
//     })



// })

//Good solution
app.post("/transfer",authmiddleware,async(req,res)=>{
    const session=await mongoose.startSession();
    session.startTransaction()

    const {to,amount}=req.body

    const sender=await Account.findOne({
        userId:req.userId
    }).session(session)

    if(amount>sender.balance || !amount){
        await session.abortTransaction()
        return res.status(411).json({
            message:"Insufficient balance"
        })
    }
    const reciever=await Account.findOne({
        userId:to
    }).session(session)

    if(!reciever){
        await session.abortTransaction()
        return res.status(400).json({
            message:"Invalid account data"
        })
    }

    await Account.findOneAndUpdate({userId:req.userId},{
        "$inc":{
            balance: -amount
        }
    }).session(session)

    await Account.findOneAndUpdate({userId:to},{
        "$inc":{
            balance: +amount
        }
    }).session(session)

    await session.commitTransaction()

    res.status(200).json({
        message:"Transfer successfull"
    })
})





module.exports=app