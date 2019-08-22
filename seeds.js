const   mongoose    = require("mongoose"),
        Skatepark   = require("./models/skatepark"),
        Comment     = require('./models/comment');

const skateparks = [
    {
        name: "Wadsworth",
        image: "https://pbs.twimg.com/media/DwwOo5rV4AAIUPE.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id sapien justo. Proin vel felis magna. Nam dictum mattis vehicula. Vivamus ornare venenatis est, tincidunt euismod elit efficitur quis. Ut ullamcorper, ante et porta tristique, dui nibh sagittis nisi, a aliquam ipsum nisl quis sapien. Nunc placerat ipsum metus. Sed dapibus vel lacus eget elementum. Aliquam quam massa, blandit et pulvinar sed, aliquam imperdiet velit. Quisque faucibus eget erat in maximus. Quisque fermentum tincidunt est, sit amet accumsan mauris rutrum id."
    },
    {
        name: "Wadsworth",
        image: "https://pbs.twimg.com/media/DwwOo5rV4AAIUPE.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id sapien justo. Proin vel felis magna. Nam dictum mattis vehicula. Vivamus ornare venenatis est, tincidunt euismod elit efficitur quis. Ut ullamcorper, ante et porta tristique, dui nibh sagittis nisi, a aliquam ipsum nisl quis sapien. Nunc placerat ipsum metus. Sed dapibus vel lacus eget elementum. Aliquam quam massa, blandit et pulvinar sed, aliquam imperdiet velit. Quisque faucibus eget erat in maximus. Quisque fermentum tincidunt est, sit amet accumsan mauris rutrum id."
    },
    {
        name: "Wadsworth",
        image: "https://pbs.twimg.com/media/DwwOo5rV4AAIUPE.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id sapien justo. Proin vel felis magna. Nam dictum mattis vehicula. Vivamus ornare venenatis est, tincidunt euismod elit efficitur quis. Ut ullamcorper, ante et porta tristique, dui nibh sagittis nisi, a aliquam ipsum nisl quis sapien. Nunc placerat ipsum metus. Sed dapibus vel lacus eget elementum. Aliquam quam massa, blandit et pulvinar sed, aliquam imperdiet velit. Quisque faucibus eget erat in maximus. Quisque fermentum tincidunt est, sit amet accumsan mauris rutrum id."
    },
    {
        name: "Wadsworth",
        image: "https://pbs.twimg.com/media/DwwOo5rV4AAIUPE.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin id sapien justo. Proin vel felis magna. Nam dictum mattis vehicula. Vivamus ornare venenatis est, tincidunt euismod elit efficitur quis. Ut ullamcorper, ante et porta tristique, dui nibh sagittis nisi, a aliquam ipsum nisl quis sapien. Nunc placerat ipsum metus. Sed dapibus vel lacus eget elementum. Aliquam quam massa, blandit et pulvinar sed, aliquam imperdiet velit. Quisque faucibus eget erat in maximus. Quisque fermentum tincidunt est, sit amet accumsan mauris rutrum id."
    }

];

async function seedDB () {
    try {
        await Skatepark.deleteMany({});
        // console.log("skateparks removed");
        // await Comment.deleteMany({});
        // console.log("comment removed");

        // for (const park of skateparks) {
        //     let skatepark = await Skatepark.create(park);
        //     console.log("skatepark created");
        //     let comment = await Comment.create({
        //         text: "This park is awesome",
        //         author: "Thomas"
        //     });

        //     console.log("Comment created");
        //     skatepark.comments.push(comment);
        //     skatepark.save();
        //     console.log('Comments added');
        // }
    } catch(err) {
        console.log(err);
    }
    
}

module.exports = seedDB;











// function seedDB() {

//     Comment.deleteMany({}, (err) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log("removed comments");
//             //Remove all skateparks
//             Skatepark.deleteMany({}, (err) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log("Removed all skateparks");
//                     //add a few skateparks
//                     data.forEach((seed) => {
//                         //creating new parks from the array of objects called data
//                         Skatepark.create(seed, (err, skatepark) => {
//                             if (err) {
//                                 console.log(err);
//                             } else {
//                                 console.log("Added a camp ground");

//                                 // creating a comment and adding it to each park
//                                 Comment.create({
//                                     text: "This park is rad",
//                                     author: "Thomas Haire"
//                                 }, (err, comment) => {
//                                     if (err) {
//                                         console.log(err);
//                                     } else {
//                                         //pushing the comment into the comments array of each skatepark
//                                         skatepark.comments.push(comment);
//                                         skatepark.save();
//                                         console.log("Created new comment");
//                                     }
//                                 });
//                             }
//                         });
//                     });
//                 }
//             });

//         }
//     });

// }