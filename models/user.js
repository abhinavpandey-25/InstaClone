const mongoose=require('mongoose');
const {ObjectId}=mongoose.Schema.Types;
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true

    },
    password:{
        type:String,
        required:true
    },
    followers:[
        {type:ObjectId,ref:"User"}
    ],
    following:[
        {type:ObjectId,ref:"User"}
    ],
    url:{
        type:String,
        default:"https://res.cloudinary.com/storagearea/image/upload/v1610876794/baseline_person_pin_black_36dp_zlgsxv.png"
    }

    //so its is not necessary that we need all the elements at beginnign
    //jese jse req aaegi u can put the elements 
})
mongoose.model("User",UserSchema)