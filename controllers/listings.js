const listing = require("../models/listings");
const mboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mboxGeocoding({ accessToken: mapToken });


module.exports.index = async (req, res) => {
    let allListings = await listing.find({});
    allListings.forEach(listing => listing.price = Number(listing.price));
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/newlisting.ejs");

};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listingInfo = await listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listingInfo){
        req.flash("error", "Listing you requested does not exists");
        res.redirect("/listings");
    } else {
        res.render("./listings/show.ejs", {listingInfo,  showSearch: false });
    }
    
};

module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listings.location,
        limit: 1,
    })
        .send()   

    let url = req.file.path;
    let filename = req.file.filename;
    const listedInfo = new listing(req.body.listings)
    listedInfo.owner = req.user._id;
    listedInfo.image = {url, filename};
    listedInfo.geometry = response.body.features[0].geometry;
    let savedInfo = await listedInfo.save();
    console.log(savedInfo);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");  
};

module.exports.getEditListingForm = async (req, res) => {
    let {id} = req.params;
    let Listing = await listing.findById(id);
    if (!Listing) {
        req.flash("error", "Listing you requested does not exists");
        res.redirect("/listings");
    } else {
        res.render("./listings/edit.ejs", {Listing});
    }
};

module.exports.editListing = async (req, res) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listings.location,
        limit: 1,
    })
        .send() 
    let {id} = req.params;
    let updatedListing = await listing.findByIdAndUpdate(id, {  ...req.body.listings },  { new: true });
    if(typeof req.file !== "undefined"){ // this condition is to check if file is uploaded or not.
    let url = req.file.path;
    let filename = req.file.filename;
    updatedListing.image = {url, filename};
    await updatedListing.save();
    };
    updatedListing.geometry = response.body.features[0].geometry;
    await updatedListing.save();
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};