if (process.env.NODE_ENV !=="production"){
    require("dotenv").config()
}
//requirements------------------------------------
const express = require("express")
const bcrypt = require("bcrypt")
const Pconfig = require("./passport-config")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
//requirements-----------------------------------

//special function for passaport config, and localstrategy
Pconfig(passport,email=>users.find(user =>user.email===email),id=>users.find(user =>user.id===id))//passaport module is given with inline 2 functions

//this is temporary database
const users=[]

const app = express()
app.set("view-engine","ejs")//template engin installation
app.use(express.urlencoded({extended:true}))//to parse post data
app.use(flash())//for error messages if the password is incorrect etc.

//session is being defined and given required parameters--------------
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
//session params end------------------------------

//index page that only auth users can acces, cAuth function checks it
app.get("/",cAuth,(req,res)=>{
    res.render("index.ejs",{name:req.user.name})
})

//Login page-----------------------------------------
app.get("/login",cNAuth,(req,res)=>{
    res.render("login.ejs")
})
app.post("/login", passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash:true
    //passaport does the auth for us,takes username and password,compares it. we changed username to email in config file 
    //and hashed it so it works. if succes or failure, associated things happen in params
}))
//login page-----------------------------------------

//Register page--------------------------------------
app.get("/register",cNAuth,(req,res)=>{
    res.render("register.ejs")
})
app.post("/register",async (req,res)=>{
    try {
        const Hpassword = await bcrypt.hash(req.body.password,10)
        //we hash the incoming password
        users.push({
            id:Date.now().toString(),
            name : req.body.name,
            email:req.body.email,
            password:Hpassword
        })
        //the inputs are being wroten to database
        res.redirect("/login")
    } catch (error) {
        console.log(error)
        res.redirect("/register")
    }
})
//register page---------------------------------------

//logout----------------------------------------------
app.post("/logout",(req,res)=>{
    req.logout(function(err) {  //we use logout function provided by passport
        if (err) { return next(err); }
        res.redirect('/login');
    });
})
//logout---------------------------------------------

//custom functions for checking auth-------------------
function cAuth(req,res,next){
    if(req.isAuthenticated()){
        return next() //if user is authenticated, the next function in line is executed which is render function
    }
    res.redirect("/login")//if not, user is redirected
}

function cNAuth(req,res,next){
    if (req.isAuthenticated()){  //this function is the same function above,just reverse
        res.redirect("/")
    }else{
        next()
    }
    
}
//custom functions for checking auth-------------------

app.listen("3000",()=> {
    console.log("3000 postu dinlemede")
})