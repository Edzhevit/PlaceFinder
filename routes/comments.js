var express = require("express");
var router = express.Router({mergeParams: true});
var Place = require("../models/place");
var Comment = require("../models/comment");
var middleware = require("../middleware/middleware");

// show new comment form
router.get("/new", middleware.isLoggedIn, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, place) => {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {place: place});
        }
    })
});

// create a new comment
router.post("/", middleware.isLoggedIn, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, place) => {
        if (err) {
            console.log(err);
            req.redirect("/places")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong!");
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();

                    place.comments.push(comment);
                    place.save();
                    req.flash("success", "Successfully added a comment!");
                    res.redirect("/places/" + place.slug);
                }
            })
        }
    })
});

// show edit comment form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Place.findOne({slug: req.params.slug}, (err, foundPlace) => {
        if (err || !foundPlace) {
            req.flash("error", "Place not found!");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash("error", "Comment not found!");
                res.redirect("back");
            } else {
                res.render("comments/edit",
                    {
                        place_slug: req.params.slug,
                        comment: foundComment
                    });
            }
        });
    });
});

// edit a comment
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment edited!");
            res.redirect("/places/" + req.params.slug);
        }
    });
});

// delete a comment
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/places/" + req.params.slug);
        }
    });
});

module.exports = router;