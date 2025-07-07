const mongoose = require("mongoose");
const initData = require("./data");
const listing = require("../models/listings");

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

mongoose
.connect(MONGO_URL)
.then( () => {
    console.log("connected");
})
.catch( (err) => {
    console.log(err);
});

const initDB = async () => {
    await listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6863c91b0393027a7abfd437"}));
    await listing.insertMany(initData.data);
    console.log("data was initialized");

};

initDB();