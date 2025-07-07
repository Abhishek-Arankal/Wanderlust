const user = require("../models/user.js");
const passport = require("passport");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs", {showSearch: false});
};

module.exports.signUp = async (req, res) => {
    try{
        let {username, password, email} = req.body;
        const newUser = new user({email, username});
        const registerdUser = await user.register(newUser, password);
        console.log(registerdUser);
        req.login(registerdUser, (err) =>{
            if(err){
                return next();
            }
            req.flash("success", "Welcome to Wanderlust");
            res.redirect("/listings");
        })
        
    } catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }
    
};

module.exports.loginRenderForm = (req, res) => {
    res.render("users/login.ejs", {showSearch: false});
};

module.exports.login = (req, res) => {
    req.flash("success", "Welcome to Wandarlust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logOut((err) => {
        if(err){
            return next();
        }
        req.flash("success", "You are logged Out");
        res.redirect("/listings");
    })
};