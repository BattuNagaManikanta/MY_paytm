const express=require("express")
const {User, Account}=require("../db.js")
const jwt=require("jsonwebtoken")
const app=express();
const zod=require("zod")
const zodSchema=require("../validations.js")
const JWT_SECRET=require("../config.js");
const {authmiddleware} = require("../middleware.js");


app.post("/signup",async(req,res)=>{
    const {success}=zodSchema.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }
    const existingUser=await User.findOne({
        username:req.body.username
    })

    if(existingUser._id){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const dbUser=await User.create(req.body)
    const userId=dbUser._id
    const bUser=await Account.create({
        userId,
        balance: Math.floor(Math.random()*10000)
    })

    res.status(411).json({
        message: "User created successfully and balance is intialized ........:-)"
    })

})

const signinSchema=zod.object({
    username:zod.string().email(),
    password:zod.string()
})

app.post("/signin",async (req,res)=>{
    const {success}=signinSchema.safeParse(req.body)
    if(!success){
        return res.status(401).json({
            message: "Incorrect inputs"
        })
    }
    const dbUser= await User.findOne({
        username:req.body.username,
        password:req.body.password
    })
    if(dbUser._id){
        const token=jwt.sign({
            dbuser : dbUser._id
        },JWT_SECRET)
        return res.status(200).json({
            token:token
        })
    }
    res.status(411).json({
        message:"Incorrect inputs/User doesn't exist please sign up"
    })

})

const updateBody=zod.object({
    password:zod.string().min(6).optional(),
    firstname:zod.string().optional(),
    lastname:zod.string().optional()
})

app.put("/",authmiddleware,async (req,res)=>{
    const updates=req.body;
    const {success}=updateBody.safeParser(req.body);
    if(!success){
        return res.status(411).json({
            message: "Password is too small"
        })
    }
    await User.findOneAndUpdate({
        _id:req.userId
    },updates);
    return res.status(200).json({
        message: "Updated successfully:-)"
    })

})


app.get("/bulk",authmiddleware,async ()=>{
    const filter=req.query.filter||"";

    const users=await User.find({
        $or:[{
            firstName:{
                "$regex":filter
            }},{
            lastname:{
                "$regex":filter
            }}
        ]
    })
    res.status(200).json({
        users: users.map(user=>{({
            username:user.username,
            firstname:user.firstname,
            lastname:user.lastname
        })
        })
    })
})

module.exports=app