const zod=require("zod")


const zodSchema=zod.object({
    username:zod.string().email(),
    firstname:zod.string(),
    lastname:zod.string(),
    password:zod.string().min(4)
})

module.exports=zodSchema