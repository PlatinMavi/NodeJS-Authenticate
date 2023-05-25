const { authenticate } = require("passport")
const bcrypt = require("bcrypt")

const LocalStrategy = require("passport-local").Strategy

function initialize(passport,getUserByEmail,getUserById){
    const authenticateUser = async (email,password,done) =>{
        const user = getUserByEmail(email)
        if(user==null){
            return done(null,false,{message:"invalid email"})
        }
        try {
            if(await bcrypt.compare(password,user.password)){
                return done(null,user)
            }else{
                return done(null,false,{message:"invalid password"})
            }
        } catch (error) {
            return done(error)
        }
    }
    passport.use(new LocalStrategy({usernameField:"email"},authenticateUser))
    passport.serializeUser((user,done)=>done(null,user.id))
    passport.deserializeUser((id,done)=>{
        return done(null,getUserById(id))
    })
}

module.exports = initialize