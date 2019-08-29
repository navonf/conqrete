const   express         = require("express"),
        router          = express.Router(),
        Skatepark       = require("../models/skatepark"),
        Comment         = require("../models/comment"),
        middleware      = require("../middleware"),
        NodeGeocoder    = require("node-geocoder"),
        multer          = require("multer"),
        cloudinary      = require("cloudinary");

const options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}      
const geocoder = NodeGeocoder(options);

const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");
}

const storage = multer.diskStorage({ //storage variable takes files
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});
const imageFilter = (req, file, cb) => { //file or image filter accepts certain file types
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter }); //config items as key:value pairs
 
cloudinary.config({ //cloud based file storage for web apps
    cloud_name: 'doly38kxv',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - Displays all the skateparks
router.get("/", (req, res) => {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    let noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all skateparks from DB
        Skatepark.find({ name: regex }, function (err, allSkateparks) {
            if (err) {
                console.log(err);
            } else {
                if (allSkateparks.length < 1) {
                    noMatch = "No skateparks match that query, please try again.";
                }
                res.render("skateparks/index", { skateparks: allSkateparks, noMatch: noMatch });
            }
        });
    } else {
        //get all skateparks from db
        Skatepark.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec( (err, allskateparks) => {
            Skatepark.countDocuments().exec(function (err, count) {
                if (err) {
                    console.log(err);
                    req.flash("error", err.message);
                } else {
                    res.render("skateparks/index", {
                        skateparks: allskateparks,
                        noMatch: noMatch,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage)
                    });
                }
            });
        });
    }
});

//NEW - Displays the form to add a skatepark
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("skateparks/new");
});

//CREATE - Adds a new skatepark to the database, then redirects the post to the /skateparks GET route
router.post("/", middleware.isLoggedIn, upload.single("skatepark[image]"), (req, res) => {
    let skatepark = req.body.skatepark;
 
    geocoder.geocode(req.body.skatepark.location, (err, data) => {
        if (err || !data.length) {
            req.flash("error", "Invalid adress");
            return res.redirect("back");
        }
        skatepark.lat = data[0].latitude;
        skatepark.lng = data[0].longitude;
        skatepark.location = data[0].formattedAddress;

        cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            // add cloudinary url for the image to the skatepark object under image property
            skatepark.image = result.secure_url;
            // add image's public_id to skatepark object
            skatepark.imageId = result.public_id;
            
            skatepark.author = {
                id: req.user._id,
                username: req.user.username
            }
            Skatepark.create(skatepark, function (err, skatepark) {
                if (err) {
                    req.flash('error', err.message);
                    return res.redirect('back');
                }
                res.redirect('/skateparks/' + skatepark.id);
            });
        });
    });
});

//SHOW - Shows a description of the skatepark
router.get("/:id", (req, res) => {
    //find the skatepark with provided id and populate the comments array onto the page
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
router.get("/:id/edit", middleware.checkPostOwnerShip, (req, res) => {
    //find the skatepark with provided id and populate the comments array onto the page
    Skatepark.findById(req.params.id).populate("comments").exec((err, foundSkatepark) => {
        console.log(foundSkatepark);
        res.render("skateparks/edit", { skatepark: foundSkatepark });
    });
});

//UPDATE - Puts new information on the show page 
router.put("/:id", middleware.checkPostOwnerShip, upload.single('skatepark[image]'), (req, res) => {
    var id = req.params.id;
    let skatepark = req.body.skatepark;
    geocoder.geocode(req.body.skatepark.location, (err, data) => {
        if (err || !data.length) {
            req.flash("error", "Invalid adress");
            return res.redirect("back");
        }
        skatepark.lat = data[0].latitude;
        skatepark.lng = data[0].longitude;
        skatepark.location = data[0].formattedAddress;
        //find and update the skatepark
        Skatepark.findById(req.params.id, async function (err, skatepark) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.file) {
                    try {
                        await cloudinary.v2.uploader.destroy(skatepark.imageId);
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        skatepark.imageId = result.public_id;
                        skatepark.image = result.secure_url;
                    } catch (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
                skatepark.name = skatepark.name;
                skatepark.description = skatepark.description;
                skatepark.save();
                req.flash("success", "Successfully Updated!");
                res.redirect("/skateparks/" + skatepark._id);
            }
        });
    });
});

//DESTROY - Removes a skatepark on 
router.delete("/:id", middleware.checkPostOwnerShip, (req, res) => {
    Skatepark.findById(req.params.id, async function (err, skatepark) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(skatepark.imageId);
            skatepark.remove();
            req.flash('success', 'skatepark deleted successfully!');
            res.redirect('/skateparks');
        } catch (err) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});

module.exports = router;