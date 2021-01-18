const jwt=require('jsonwebtoken');
const mongoose=require('mongoose')
const User=mongoose.model("User");
const {SECRET_KEY}=require('../config/keys')
module.exports=(req,res,next)=>{
    const authorization=req.headers.authorization;
    if(!authorization){
        res.status(401).send({error:"please login firsts"})
    }
    else{
            const token=authorization.replace("Bearer ","");
        //401 unauthorized
            jwt.verify(token,SECRET_KEY,(err,payload)=>{
            if(err){
               return res.status(401).send({error:'please login first'})
            }
            else{
                const id=payload.user_id;
                User.findById({_id:id}).then(result=>{
                   req.user=result;
                   //req k andar ek user var m hmne result store kra diya 
                   //and then uska use hm next middleware m krenge joki post h
                   next();
                })
              
            }
        })
    }
}