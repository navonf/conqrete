const   express     = require("express"),
        router      = express.Router(),
        passport    = require("passport"),
        User        = require("../models/user"),
        Skatepark   = require("../models/skatepark"),
        async       = require("async"),
        nodemailer  = require("nodemailer"),
        multer      = require("multer"),
        cloudinary  = require("cloudinary");

let     crypto      = require("crypto");

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


//HOME - renders the home template
router.get("/", (req, res) => {
    res.redirect("/skateparks");
});

//REGISTER ROUTE - renders form template
router.get("/register", (req, res) => {
    res.render("register");
});

//REGISTER ROUTE - registers the new user with passport
router.post("/register", upload.single("image"), (req, res) => {
    cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }

        // add cloudinary url for the image to the skatepark object under image property
        let image = req.body.image;
        image = result.secure_url;
        // add image's public_id to skatepark object
        let imageId = req.body.imageId; 
        imageId = result.public_id;

        const newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            image: image,
            imageId: imageId
        });

        const password = req.body.password;
        console.log(newUser);
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
});

//LOGIN ROUTE - renders the login template
router.get("/login", (req, res) => {
    res.render("login");
});

//LOGIN ROUTE - logs a user in with passport
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

// //FORGOT PASSWORD - renders forgot password form
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

//FORGOT PASSWORD - create reset token and sends email to user for pw reset
router.post("/forgot", (req, res, next) => {
    async.waterfall([
        (done) => {
            crypto.randomBytes(20, (err, buf) => { //creates a 20 bit long token for resetting password
                const token = buf.toString("hex");
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({ email: req.body.email }, (err, user) => { //find the user's email
                if(!user){
                    req.flash("error", "Couldn't find an account with that email"); 
                    return res.redirect("/forgot");
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //token expires after 1 hour

                user.save((err) => {
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            const smtpTransport = nodemailer.createTransport({ //sends the email to the user
                service: "Gmail",
                auth: {
                    user: "bushikazedev@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: "bushikazedev@gmail.com",
                subject: "conqrete Password Reset",
                text: "You are receiving this because you have requested the reset of the password associate with this email. " +
                    "Please follow the link below or paste it in your browser in order to reset your password: " +
                    "http://" + req.headers.host + "/reset/" + token +  "\n\n" +
                    "If you did not request this, please ignore this email."
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash("success", "An e-mail to reset your password was sent to " + user.email);
                done(err, "done");
            });
        }
    ], (err) => {
        if(err) return next(err);
        res.redirect("/forgot");
    });
});

//FORGOT PASSWORD - renders new password form
router.get("/reset/:token", (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if(!user) {
            req.flash("error", "Password reset token is invalid or expired.");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

//FORGOT PASSWORD - creates new password
router.post("/reset/:token", (req, res) => {
    async.waterfall([
        (done) => {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if(!user){
                    req.flash("error", "Password reset token is invalid or expired.");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, (err) => { //reset password
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save((err) => {
                            req.logIn(user, (err) => { //save the new password
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect("back");
                }
            });
        },
        (user, done) => {
            const smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "bushikazedev@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: "bushikazedev@gmail.com",
                subject: "conqrete Password Reset",
                text: "Hello,\n\n" +
                    "This is a confirmation that the password for your account " 
                    + user.email + " has been changed."
            };
            smtpTransport.sendMail(mailOptions, (err) => {
                req.flash("success", "Success! your password has been changed.");
                done(err);
            });
        }
    ], (err) => {
        res.redirect("/skateparks");
    });
});

//User Profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            req.flash("err", "Something went wrong");
            res.redirect("/");
        } else {
            Skatepark.find().where("author.id").equals(foundUser._id).exec((err, userSkateparks) => {
                if(err){
                    req.flash("error", "Something went wrong");
                    res.redirect("/");
                } else {
                    res.render("users/show", { user: foundUser, skateparks: userSkateparks});
                }
            })
            
        }
    });
});

module.exports = router;