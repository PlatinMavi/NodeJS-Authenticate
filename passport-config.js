//requirements--------------------------------------------
const bcrypt = require("bcrypt")
const LocalStrategy = require("passport-local").Strategy
//requirements--------------------------------------------

function initialize(passport,getUserByEmail,getUserById){ //we give the passport module as a paremeter for config,and 2 functions for your database querries so it is modifyable
    const authenticateUser = async (email,password,done) =>{
        const user = getUserByEmail(email)//the function you have given that querries database
        if(user==null){
            return done(null,false,{message:"invalid email"}) //if user is not found,it returns a done function with message
        }
        try {   //try catch is used to catch any possible errors for auth
            if(await bcrypt.compare(password,user.password)){   //the inputted pasword is being hashed, then compared to querried hash
                return done(null,user)  //returns done function with the user that is going to be authenticated
            }else{  //returns if password doesnt match
                return done(null,false,{message:"invalid password"})
            }
        } catch (error) {
            return done(error)
        }
    }
    passport.use(new LocalStrategy({usernameField:"email"},authenticateUser))
    //we define localstrategy, but because we use email instead of username,we have to specify it
    passport.serializeUser((user,done)=>done(null,user.id))//it serializes user
    passport.deserializeUser((id,done)=>{return done(null,getUserById(id))})//it deserializes user
}

module.exports = initialize // we export the main function to config our passaport