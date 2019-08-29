const mongoose = require("mongoose");

const skateparkSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    image: String,
    imageId: String,
    description: { type: String, required: true },
    cost: Number,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default: Date.now},
    author: {
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
    ]
});

module.exports = mongoose.model("Skatepark", skateparkSchema);