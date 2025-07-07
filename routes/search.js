const express = require("express");
const router = express.Router();
const listings = require("../models/listings");
const searchController = require("../controllers/search");



//autocomplete search
router.get("/location", searchController.autoSearch);

// search implimentation
router.get("/", searchController.searchedResult);


module.exports = router;