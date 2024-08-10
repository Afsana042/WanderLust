const ExpressError = require("./utils/ExpressError.js")
const Listing = require("./models/listing.js");
const Review = require("./models/review.js")
const {listingSchema,reviewSchema} = require("./schema.js");



module.exports.isloggedIn = (req,res,next)=>{
    req.session.redirectUrl= req.originalUrl;
    if(!req.isAuthenticated()){
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login")
    }
    next()
}


module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
}



module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params
    let listing = await Listing.findById(id);
    console.log(listing.owner)
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You are not the owner of this listing")
        return res.redirect(`/listing/${id}`)
    }
    next();
}


module.exports.validateListing = ((req,res,next)=>{
    let { error }= listingSchema.validate(req.body)
    if(error){
       console.log(error)
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400,errMsg);
    }
    else{
        next();
    }
})


module.exports.validateReview = ((req,res,next)=>{
    let { error } = reviewSchema.validate(req.body);

    if(error){
        console.log(error)
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(errMsg)

        throw new ExpressError(400,errMsg)
    }else{
        next();
    }
})


module.exports.isReviewAuthor =async (req,res,next)=>{
    let { id ,reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review")
        return res.redirect(`/listing/${id}`)
    }
    next();
}