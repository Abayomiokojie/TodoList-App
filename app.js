const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();


//App use statements
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static("public"));

app.set('view engine', 'ejs');

// mongoose.set('useFindAndModify', false);



//Connecting MongoDB Database using Moongoose
mongoose.connect("mongodb+srv://admin-abayomi:Ma1da4833@todolist.xv5uh.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true }, { useFindAndModify: false });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "Hit this to delete an item!"
});

const defaultItems = [item1, item2, item3];



//New Schema for customLists
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




// Handle's GET request from the client-side to the server. i.e. What the server supplies when a query is made to the homepage or root of the site.

app.get("/", function (req, res) {

    Item.find({}, function (err, itemsFound) {

        if (itemsFound.length === 0) {
Item.insertMany(defaultItems, function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Default Items Successfully added!");
    }
});            
            res.redirect("/");
        } else {
res.render("list", {
            listTitle: "Today",
            newListItems: itemsFound
        });
        }
    });
});




app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
               const list = new List({
        name: customListName,
        items: defaultItems
               });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            } 
        }
    });
});

   

//Handle's POST request from the client-side to the server. i.e. Captures and responds to data posted to the server from client-side interaction with the root/home-page.

app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();

    res.redirect("/")
    } else {
        List.findOne({name:listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
    }
});




app.post("/delete", function (req, res) {
    const checkedItemId = (req.body.checkbox);
    const listName = req.body.listName

    if (listName === "Today") {
         Item.findByIdAndRemove(checkedItemId, function (err) {
        if (!err) {
        console.log("Checked Item successfully removed!");
        }
    });
    res.redirect("/");
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }
});



app.get("/about", function (req, res) {
    res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully!")
});