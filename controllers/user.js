const User = require("../models/user.js");
const Listing = require("../models/listing.js")
const Review = require("../models/review.js")

module.exports.rendersignupForm = (req,res)=>{
    res.render("./user/signup.ejs")
}


module.exports.signup = async(req,res)=>{
    try{
        let { username , email ,password } = req.body;
        const newUser = new User({email, username});
        let registerUser = await User.register(newUser , password)
        console.log(registerUser);
        req.login(registerUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","welcome to wanderLust")
            res.redirect("/listing");
        })
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup")
    }
   
}


module.exports.renderLoginForm = (req,res)=>{
    res.render("./user/login.ejs")
}


module.exports.login =  async(req,res)=>{
    req.flash("success","Welcome back to WanderLust");
    let redirectUrl =  res.locals.redirectUrl || "/listing" ;
    res.redirect(redirectUrl)
    // res.redirect("/listing")
}


module.exports.logout = (req,res,next)=>{
    req.logout((err)=>{
        if(err){
            console.log(err)
            return next(err)
        }
        req.flash("success","you are logged out!")
        res.redirect("/listing")
    })
}