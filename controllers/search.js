const listings = require("../models/listings");

module.exports.autoSearch = async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const Listings = await listings.find({
        location: { $regex: q, $options: "i" } // case-insensitive partial match
    })
    .limit(5)
    .select("location country -_id");

    // Make sure there are no duplicate suggestions
    const seen = new Set();
    const uniqueSuggestions = [];

    for (let l of Listings) {
        const key = `${l.location}|${l.country}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniqueSuggestions.push({ location: l.location, country: l.country });
        }
    }

    res.json(uniqueSuggestions); // return array of {location, country}
};

module.exports.searchedResult = async (req, res) => {
    const { location } = req.query;

    let Listings;
    if (location) {
        Listings = await listings.find({
            location: { $regex: location, $options: "i" } // case-insensitive
        });
    } else {
        Listings = await listings.find({});
        
    }
    if (Listings.length === 0) {
        req.flash("error", `No listings found in "${location}"`);
        return res.redirect("/listings");
    }
    // res.send(Listings);

    res.render("listings/serchindex.ejs", { Listings, searchLocation: location || "" });
};