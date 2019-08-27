require("dotenv").config();

const   express         = require("express"),
        app             = express(),
        bodyParser      = require("body-parser"),
        mongoose        = require("mongoose"),
        Comment         = require("./models/comment"), //Comment schema and model
        User            = require("./models/user"), //User schema and model
        seedDb          = require("./seeds"),
        passport        = require("passport"),
        Skatepark       = require("./models/skatepark"), //Skatepark schema and model
        LocalStrategy   = require("passport-local"),
        methodOverride  = require("method-override"),
        flash           = require("connect-flash");
    
//Importing routes
const   indexRoutes     = require("./routes/index"),
        skateparkRoutes = require("./routes/skateparks"),
        commentRoutes   = require("./routes/comments");

//Connecting the database
// mongoose.connect("mongodb://localhost:27017/skate_yelp", {useNewUrlParser: true});
mongoose.connect("mongodb://localhost:27017/conqreteDB", {useNewUrlParser: true});

//Setting up body-parser
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set('useFindAndModify', false);

//Use method-override
app.use(methodOverride("_method"));

//Setting the view engine to ejs
app.set("view engine", "ejs");

//Allowing for access to the stylesheet
app.use(express.static(__dirname + "/public"));

//Moment JS sllows for post timestamps - used on comments and new parks
app.locals.moment = require('moment');

//Connect-flash
app.use(flash());

//SEEDING THE DATABASE - adding some preloaded skateparks for test purposes
//seedDb();

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "qm6n-r2d2",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    //Passing user information to every template as currentUser
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//Requiring routes
app.use("/", indexRoutes);
app.use("/skateparks", skateparkRoutes);
app.use("/skateparks/:id/comments", commentRoutes);

app.listen(3000, () => {
    console.log("Server is up an running!");
});