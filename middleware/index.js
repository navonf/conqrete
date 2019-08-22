//Middleware methods
const Skatepark = require("../models/skatepark"),
      Comment   = require("../models/comment");  

const middlewareOBJ ={};

//Checking if a user is logged in
middlewareOBJ.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login or Sign Up");
    res.redirect("/login");
}

//Checking if a user owns th posted skatepark
middlewareOBJ.checkPostOwnerShip = (req, res, next) => {
    if (req.isAuthenticated()) {
        Skatepark.findById(req.params.id).populate("comments").exec((err, foundSkatepark) => {
            //Find the skatepark 
            if (err) {
                req.flash("error", "Skatepark not found");
                res.redirect("back");
            }
            else {
                //does user own the posted park
                if (foundSkatepark.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You Don't Have Permissions");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login or Signup");
        res.redirect("back");
    }
}


//Checking if a user owns th posted comment
middlewareOBJ.checkCommentOwnerShip = (req, res, next) => {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id).populate("comments").exec((err, foundComment) => {
            //Find the skatepark 
            if (err) {
                res.redirect("back");
            }
            else {
                //does user own the posted comment
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

module.exports = middlewareOBJ;