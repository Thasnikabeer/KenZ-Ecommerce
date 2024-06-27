const User = require('../models/userModel');      //import the User model from '../models/userModel'

const bcrypt = require('bcrypt');
const nodemailer= require("nodemailer");
const config  = require("../config/config")
const randomstring = require("randomstring");


console.log("second commit changes ")
console.log("third commit changes ")
//generate hashed password
const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password, 10); 
        return passwordHash;
    }catch(error){
        console.log(error.message); 
    }
}
 //for send mail
const sendVerifyMail = async(name,email,user_id)=>{
    try{
        const transporter= nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false, 
            requireTLS:true, 
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'for verification mail',
            html:'<p>Hii '+name+', please click here to <a href="http://127.0.0.1:3000/verify?id='+user_id+'">Verify</a>your mail.</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent: ",info.response);
            }
        })
 
    }catch(error){
        console.log(error.message);
    }
}


//for reset password send mail

const sendResetPasswordMail = async(name,email,token)=>{
    try{
        const transporter= nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true, 
            auth:{
                user:config.emailUser,
                pass:config.emailPassword
            }
        });
        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'for reset password',
            html:'<p>Hii '+name+', please click here to <a href="http://127.0.0.1:3000/forget-password?token='+token+'">Reset </a>your password.</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent: ",info.response);
            }
        })

    }catch(error){
        console.log(error.message);
    }
}

//load register/signup

const loadRegister= async(req,res)=>{             //define an asynchronous function called loadRegister that takes req and res (request and response) as parameters.
    try {
        if (!req.session.user) {
            res.render("signup")
        } else {
            res.redirect("/")
        }
    } catch (error) {
        console.log(error.message);
    }
}


// a function to handle inserting a new user into your database

const insertUser = async(req,res)=>{                  //define an asynchronous function called insertUser that takes req and res (request and response) as parameters.
    try{
        const spassword = await securePassword(req.body.password);
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            mobile:req.body.mno,
            image:req.file.filename,
            password:spassword,
            is_admin:0
        });
    
      const userData = await user.save();      //You then use await to save this new user to the database using user.save(). This operation is asynchronous and will wait for the user to be saved before proceeding.
      
      if(userData){
            sendVerifyMail(req.body.name,req.body.email,userData._id);
            res.render('registration',{message:"your registration has been successfull,Please verify your email."})       //render the 'registration' view with a success or failure message accordingly.
        }else{
            res.render('registration',{message:"your registration has been failed."})
        }

    }catch(error){
        console.log(error.message);
    }
}

const verifyMail = async(req,res)=>{
    try{
        const updateInfo= await User.updateOne({_id:req.query.id},{$set:{is_verified:1}})
        console.log(updateInfo);
        res.render("email-verified");
    }catch(error){
        console.log(error.message)

    }
}

//login user methods started

const loginLoad = async(req,res)=>{
    try{
        if (!req.session.user) {
            res.render('login')
        } else {
        res.redirect("/")
    } 
} catch (error){
        console.log(error.message);
    }
}

const verifyLogin = async(req,res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        const userData= await User.findOne({email:email});
        if(userData){
            const passwordMatch = await bcrypt.compare(password,userData.password);
            if(passwordMatch){
                if(userData.is_verified === 0){
                    res.render('login',{message:"please verify your mail"});
                }else{
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            }else{
                res.render('login',{message:"Email and password is incorrect"});
              }
        }else{
            res.render('login',{message:"Email and password is incorrect"});
        }
    }catch(error){
        console.log(error.message)
    }
}

const loadHome = async(req,res)=>{
    try{
        res.render('home');
    }catch(error){
        console.log(error.message);
    }
}

const userLogout= async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/');
    }catch(error){
        console.log(error.message);
    }
}
//forget password 

const forgetLoad = async(req,res)=>{
    try{
        res.render('forget');
    }catch(error){
        console.log(error.message);
    }
}

const forgetVerify = async(req,res)=>{
    try{
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            
            if(userData.is_verified === 0){
                res.render('forget',{message:" please verify your email."})
             }
             else{
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"please check your mail to reset your password."});
        }
        }else{
            res.render('forget',{message:"user email is incorrect."});
        }

    }catch(error){
        console.log(error.message);
    }
}
const forgetPasswordLoad=async(req,res)=>{
    try{
        const token = req.query.token;
        const tokenData =await User.findOne({token:token});
        if(tokenData){
            res.render('forget-password',{user_id:tokenData._id});
        }
        else{
            res.render('404',{message:"Token is invalid."});
        }
    }catch(error){
        console.log(error.message);
    }
}
const resetPassword = async(req,res)=>{
    try{
        const password = req.body.password;
        const user_id = req.body.user_id;
        const secure_password= await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}});
        res.redirect("/");
    
    }catch(error){
        console.log(error.message);
    }
}

//for verification send link

const verificationLoad= async(req,res)=>{
    try{
        res.render('verification');

    }catch(error){
        console.log(error.message);
    }
}


const sentVerificationLink = async(req,res)=>{
    try{
        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            sendVerifyMail(userData.name,userData.email,userData._id);
            res.render('verification',{message:"Reset verification mail sent your mail id, please check."});

        }else{
            res.render('verification',{message:"This email does not exist"})
        }
    } catch(error){
        console.log(error.message);
    }
}



module.exports= {
    loadRegister,                              //export an object with loadRegister as a property, making it available for other parts of your application to use.
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sentVerificationLink
} 