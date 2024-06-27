// setting up a route for handling user registration
const express= require("express");
const user_route= express();
const session = require("express-session");
const config = require("../config/config");

//session
user_route.use(session({
  secret: config.emailPassword,
  resave: false, // Set to false to avoid deprecation warning
  saveUninitialized: true // Set to true to avoid deprecation warning
}));


user_route.use(session({secret:config.sessionSecret}));
const auth = require("../middleware/auth");

user_route.set('view engine','ejs');
user_route.set('views','./views/users')

const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer= require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'));
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
});
const upload = multer({storage:storage});

const userController = require("../controllers/userController");
user_route.get('/register',auth.isLogout,userController.loadRegister);         //You define a route for handling GET requests to the '/register' endpoint using user_route.get(). When a GET request is made to '/register', it will be handled by the loadRegister function from the userController
user_route.post('/register',upload.single('image'),userController.insertUser);         //By setting up this route, when a user navigates to '/register' in their browser, the loadRegister function from the userController will be invoked, rendering the registration page.
user_route.get('/verify',userController.verifyMail);
user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/home',auth.isLogin,userController.loadHome);
user_route.get('/logout',auth.isLogin,userController.userLogout);
user_route.get('/forget',auth.isLogout,userController.forgetLoad);
user_route.post('/forget',userController.forgetVerify)
user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
user_route.post('/forget-password',userController.resetPassword);
user_route.get('/verification',userController.verificationLoad);
user_route.post('/verification',userController.sentVerificationLink);



module.exports = user_route;  