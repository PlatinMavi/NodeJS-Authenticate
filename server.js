if (process.env.NODE_ENV !=="production"){
    require("dotenv").config()
}

const express = require("express")
const bcrypt = require("bcrypt")
const Pconfig = require("./passport-config")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")

Pconfig(passport,email=>users.find(user =>user.email===email),id=>users.find(user =>user.id===id))

const users=[]

const app = express()
app.set("view-engine","ejs")
app.use(express.urlencoded({extended:true}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get("/",cAuth,(req,res)=>{
    res.render("index.ejs",{name:req.user.name})
})

//Login page
app.get("/login",cNAuth,(req,res)=>{
    res.render("login.ejs")
})
app.post("/login", passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login",
    failureFlash:true
}))

//Register page
app.get("/register",cNAuth,(req,res)=>{
    res.render("register.ejs")
})
app.post("/register",async (req,res)=>{
    try {
        const Hpassword = await bcrypt.hash(req.body.password,10)
        users.push({
            id:Date.now().toString(),
            name : req.body.name,
            email:req.body.email,
            password:Hpassword
        })
        res.redirect("/login")
    } catch (error) {
        console.log(error)
        res.redirect("/register")
    }
    console.log(users)
})
//logout
app.post("/logout",(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
})

function cAuth(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function cNAuth(req,res,next){
    if (req.isAuthenticated()){
        res.redirect("/")
    }else{
        next()
    }
    
}

app.listen("3000",()=> {
    console.log("3000 postu dinlemede")
})