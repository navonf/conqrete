const   express     = require("express"),
        router      = express.Router(),
        Skatepark   = require("../models/skatepark"),
        Comment     = require("../models/comment"),
        middleware  = require("../middleware");
        
//INDEX - Displays all the skateparks
router.get("/", (req, res) => {
    //get all skateparks from db
    Skatepark.find({}, (err, skateparks) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render("skateparks/index", { skateparks: skateparks });
        }
    });
});

//NEW - Displays the form to add a skatepark
router.get("/new", (req, res) => {
    res.render("skateparks/new");
});

//CREATE - Adds a new skatepark to the database, then redirects the post to the /skateparks GET route
router.post("/",  (req, res) => {
    let skatepark = req.body.skatepark;
    skatepark.author = {
        id: req.user._id,
        username: req.user.username
    };    
    //create new skatepark and save it to the database
    Skatepark.create(skatepark, (err, skatepark) => {
        if (err) {
            console.log(err);
        }
        else {
            //redirect back to skateparks page
            res.redirect("/skateparks");
        }
    });
});

//SHOW - Shows a description of the skatepark
router.get("/:id", (req, res) => {
    //find the campground with provided id and populate the comments array onto the page
    Skatepark.findById(req.params.id).populate("comments").exec((err, foundSkatepark) => { 
        //Find the skatepark and find all the posts for that user
        if (err) {
            console.log(err);
        }
        else {
            res.render("skateparks/show", { skatepark: foundSkatepark });
        }
    });
});

//EDIT - Renders skatepark edit form
router.get("/:id/edit", (req, res) => {
    //find the campground with provided id and populate the comments array onto the page
    Skatepark.findById(req.params.id).populate("comments").exec((err, foundSkatepark) => {
        console.log(foundSkatepark);
        res.render("skateparks/edit", { skatepark: foundSkatepark });
    });
});

//UPDATE - Puts new information on the show page 
router.put("/:id", (req, res) => {
    var id = req.params.id;
    let skatepark = req.body.skatepark;
    //find and update the skatepark
    console.log(req.params.id);
    console.log(id);
    Skatepark.findByIdAndUpdate(id, skatepark, (err, updatedSkatepark) => {
        if(err){
            res.redirect("/skateparks");
        } else {
            console.log(updatedSkatepark._id);
            res.redirect("/skateparks/" + updatedSkatepark._id);
        }
    });
});

//DESTROY - Removes a skatepark on 
router.delete("/:id", middleware.checkPostOwnerShip, (req, res) => {
    Skatepark.findOneAndRemove(req.params.id, (err, foundSkatepark) => {
        if(err){
            res.redirect("/skateparks");
        } else {
            Comment.deleteMany({ _id: { $in: foundSkatepark.comments } }, (err) => {
                if(err){
                    console.log(err);
                }
            });
            res.redirect("/skateparks");
        }
    });
});

module.exports = router;