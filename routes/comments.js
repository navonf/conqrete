const   express     = require("express"),
        router      = express.Router({mergeParams: true}),
        Skatepark   = require("../models/skatepark"),
        Comment     = require("../models/comment"),
        middleware  = require("../middleware");

//NEW - displays a form for new comments
router.get("/new", middleware.isLoggedIn, (req, res) => {
    let id = req.params.id;
    Skatepark.findById(id, (err, foundSkatepark) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { skatepark: foundSkatepark });
        }
    });
});

//CREATE - Posts new comments
router.post("/", middleware.isLoggedIn, (req, res) => {
    Skatepark.findById(req.params.id, (err, foundSkatepark) => {
        if (err) {
            res.redirect("/skateparks");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Failed to create");
                    res.redirect("/skateparks");
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save new comment
                    comment.save();
                    foundSkatepark.comments.push(comment);
                    foundSkatepark.save();
                    
                    res.redirect("/skateparks/" + foundSkatepark._id);
                }
            });
        }
    });
});

//EDIT - Renders form to edit a comment

router.get("/:comment_id/edit", middleware.checkCommentOwnerShip, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err){
            res.redirect("back");
        } else {
        
            res.render("comments/edit", { skatepark_id: req.params.id, comment: foundComment });
        }
    });
});

//UPDATE - Puts a new comment where the original was

router.put("/:comment_id", middleware.checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, foundComment) => {
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/skateparks/" + req.params.id);
        }
    });
});

//DELETE - Removes a comment

router.delete("/:comment_id", middleware.checkCommentOwnerShip, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err, foundSkatepark) => {
        if (err) {
            res.redirect("/skateparks/" + req.params.id);
        } else {
            req.flash("success", "Comment removed");
            res.redirect("/skateparks/" + req.params.id);
        }
    });
});

module.exports = router;