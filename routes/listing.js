
const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js")
const {listingSchema , reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {isloggedIn} = require("../middleware.js");
const {isOwner}  = require("../middleware.js");
const {validateListing} = require("../middleware.js")
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudConfid.js")
const upload = multer({storage})


router.
route("/")
.get(wrapAsync(listingController.index))
.post(isloggedIn,upload.single("listing[image]"),validateListing,wrapAsync(listingController.createListing))



router.get("/new",isloggedIn,listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isloggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync(listingController.updateListing))

.delete(isloggedIn,isOwner,wrapAsync(listingController.destroyListing))


router.get("/:id/edit",isloggedIn,isOwner, wrapAsync(listingController.renderEditForm))




module.exports = router;