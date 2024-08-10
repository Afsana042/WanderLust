
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken : mapToken });

module.exports.index = async (req,res)=>{
    let allListing = await Listing.find({});
    res.render("listing/index.ejs", { allListing })
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listing/new.ejs")
}

module.exports.showListing= async(req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id).
    populate({
        path :"reviews",
        populate:{
            path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist !!");
        res.redirect("/listing")
    }
    // console.log(listing)
    res.render("listing/show.ejs",{ listing })
}


module.exports.createListing = async(req,res,next)=>{
    // through this we access the listing object
    // let listing = req.body.listing;
    let response = await geocodingClient
     .forwardGeocode({
        query: req.body.listing.location,
        limit: 2
      })
        .send()

       let url = req.file.path;
       let filename = req.file.filname;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url,filename};

        newListing.geometry = response.body.features[0].geometry
        let saveListing = await newListing.save();
        console.log(saveListing)
        
        req.flash("success","New Listing Created")
        res.redirect("/listing")
}

module.exports.renderEditForm = async(req,res)=>{
    let { id }= req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist !!");
        res.redirect("/listing")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl= originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listing/edit.ejs", { listing,originalImageUrl })
}


module.exports.updateListing = async(req,res)=>{
    let { id } = req.params; 
  
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save()
    }
    req.flash("success","Listing Updated")
    console.log(listing);
    res.redirect(`/listing/${id}`);
}


module.exports.destroyListing = async (req,res)=>{
    let { id } = req.params;
    const deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted!")
    console.log(deleteListing)
    res.redirect("/listing")
}