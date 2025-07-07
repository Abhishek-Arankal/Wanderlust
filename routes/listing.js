const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const listing = require("../models/listings");
const { isLoggedIn, isOwner, validateListing,} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudconfig.js");
const upload = multer({ storage });



// index route
router.get("/", wrapAsync(listingController.index));

// new route
router.get("/new", isLoggedIn, listingController.renderNewForm);

// show route
router.get("/:id", wrapAsync(listingController.showListing));

// create route
router.post("/", isLoggedIn, validateListing, upload.single("listings[image]"), wrapAsync(listingController.createListing));


// edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.getEditListingForm));

// update route
router.put("/:id", isLoggedIn, isOwner, upload.single("listings[image]"), validateListing, wrapAsync(listingController.editListing));

// listing delete
router.post("/:id", isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

module.exports = router;


