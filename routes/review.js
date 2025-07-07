const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const listing = require("../models/listings");
const { validateReview, isLoggedIn, isAuthor, saveRedirectUrl } = require("../middleware.js") 
const reviewController = require("../controllers/review.js");




// review
router.post("/", isLoggedIn, validateReview, wrapAsync (reviewController.createReview));

// review delete

router.delete("/:reviewId",isLoggedIn, isAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;