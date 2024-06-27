const mongoose = require("mongoose");
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{            //if admin, then value 1, if user then 0
        type:Number,
        required:true
    },
    is_verified:{         // email verification when user registration time
        type:Number,
        default:0 
    },
    token:{
        type:String,
        default:''
    }
});
module.exports = mongoose.model('User', userSchema);