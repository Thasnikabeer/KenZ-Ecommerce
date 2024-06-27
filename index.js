const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/kenz");
const express= require("express");
const app = express();
//const cookieParser = require("cookie-parser");
const session = require("express-session");
// const nocache = require("nocache");


// app.use(cookieParser());
app.use(
    session({
        secret: "myKey",
        resave: false,
        saveUninitialized: true,
    })
);

app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(nocache());


//for user routes
const userRoute = require('./routes/userRoute');
app.use('/',userRoute);


// //for admin routes
// const adminRoute = require('./routes/adminRoutes');
// app.use('/admin',adminRoutes);


app.listen(3000,function(){
    console.log("server is running...");
});