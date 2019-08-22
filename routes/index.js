const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user");


//HOME - renders the home template
router.get("/", (req, res) => {
    res.redirect("/skateparks");
});


//REGISTER ROUTE - renders form template
router.get("/register", (req, res) => {
    res.render("register");
});

// - registers the new user with passport
router.post("/register", (req, res) => {
    let newUser = new User({ username: req.body.username });
    let password = req.body.password;
    User.register(newUser, password, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Successfully signed up")
            res.redirect("/skateparks");
        });
    });
});

//LOGIN ROUTE - renders the login template
router.get("/login", (req, res) => {
    res.render("login");
});

// - logs a user in with passport
router.post("/login",
    //passport-local-mongoose middleware    
    passport.authenticate("local",
        {
            successRedirect: "/skateparks",
            failureRedirect: "/login"
        }
    ));

//LOGOUT ROUTE - logs a user out
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/skateparks");
});

module.exports = router;