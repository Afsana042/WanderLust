if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}


const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const MongoStore = require('connect-mongo');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")
const Review = require("./models/review.js")

const dbUrl = process.env.ATLASDB_URL;

const listingRoute = require("./routes/listing.js");
const reviewRoute =  require("./routes/review.js");
const userRoute = require("./routes/user.js");


const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter : 24 * 3600,
})

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err)
})

const sessionOption = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 *1000,
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly :true,
    },
}



app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")))
app.engine("ejs",ejsMate);

main()
.then(()=>{
    console.log("Connection successful")
})
.catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect(dbUrl);
}



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next()
})



app.use("/listing",listingRoute);
app.use("/listing/:id/reviews",reviewRoute);
app.use("/",userRoute)




app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found"))
})
app.use((err,req,res,next)=>{
    let {statusCode= 500 ,message= "Something went wrong"} = err;
    // res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs",{ message })
})

app.listen(8080,()=>{
    console.log("Listening on port 8080")
})