var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/skate_yelp", {useNewUrlParser: true});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//Schema setup
var skateparkSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Skatepark = mongoose.model("Skatepark", skateparkSchema)

// Skatepark.create({
//     name: "Wadsworth Skatepark",
//     image: "https://assets.simpleviewinc.com/simpleview/image/fetch/c_limit,q_75,w_1200/https://assets.simpleviewinc.com/simpleview/image/upload/crm/flaglercountyfl/DSCN00900-95d657055056a36_95d658b7-5056-a36a-0603bdb5c4e76cb2.jpg",
//     description: "This skatepark is located in Flagler Beach, FL. The park is compromised of metal pre-fabricated ramps and rails."
// }, (err, skatepark) => {
//     if(err){
//         console.log(err);
//     }
//     else{
//         console.log("Success\n" + skatepark);
//     }
// });

app.get("/", (req, res) => {
    res.render("home")
});

//INDEX - Displays all the skateparks
app.get("/skateparks", (req, res) => {
    
    //get all skateparks from db
    Skatepark.find({}, (err, skateparks) => {
        if(err){
            console.log(err);
        }
        else{
            res.render("index", {skateparks: skateparks})
        }
    });
});

//CREATE - Adds a new skatepark to the database, then redirects the post to the /skateparks GET route
app.post("/skateparks", (req, res) => {
    var name = req.body.name;
    var image = req.body.image;
    var newSkatepark = {"name": name, "image": image};

    //create new skatepark and save it to the database
    Skatepark.create(newSkatepark, (err, skatepark) => {
        if(err){
            console.log(err)
        }
        else{
            //redirect back to skateparks page
            res.redirect("/skateparks");
        }
    });

});

//NEW - Displays the form to add a skatepark
app.get("/skateparks/new", (req, res) => {
    res.render("new");
});

//SHOW - Shows a description of the skatepark
app.get("/skateparks/:id", (req, res) => {
    //find the campground with provide id

    //render the show template of that campground
    res.send("This is the show page");
});

app.listen(8080, () => {
    console.log("Server is up an running!");
});