var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    location: String,
    // lat: Number,
    // lng: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Place", placeSchema);