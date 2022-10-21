const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "dzfp79loc",
    api_key: "264836667282714",
    api_secret: "Wu-6jnV9TKM4qI-UUCPjbD-TakU",
    secure: true
  });

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/vinted");

const usersRoutes = require("./routes/user.js");
app.use(usersRoutes);
const offersRoutes = require("./routes/offer.js");
app.use(offersRoutes);


app.all("*", (req, res) => {
    res.status(400).json({message: "Page not found"});
});

app.listen(3000, () => {
    console.log("Server has started !");
});