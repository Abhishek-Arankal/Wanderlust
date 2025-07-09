if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
    console.log("Mongo URL is: ", process.env.ATLASDB_URL);

}

const express = require("express");
const methodOveride = require("method-override");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const listings = require("./models/listings");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const mongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const searchRouter = require("./routes/search.js");

const dbUrl = process.env.ATLASDB_URL;

mongoose
.connect(dbUrl)
.then( () => {
    console.log("connected");
})
.catch( (err) => {
    console.log(err)
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true}));
app.use(methodOveride("_method"));
app.engine('ejs', ejsMate);  
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json({
    strict: true
}));

const store = mongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.searchLocation = "";
    next();
});



app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/search", searchRouter);




app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong"} = err;
    res.status(statusCode).render("./listings/error.ejs", {message});

});

const PORT = process.env.PORT_NUM || 8080;
app.listen(PORT, () => {
    console.log("server is listening to port 8080" );
});