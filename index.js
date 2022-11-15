const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const cors = require("cors");

app.use(express.json());
app.use(cors());

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
  });

mongoose.connect(process.env.MONGODB_URI);


const usersRoutes = require("./routes/user.js");
app.use(usersRoutes);
const offersRoutes = require("./routes/offer.js");
app.use(offersRoutes);
const paymentRoutes = require("./routes/payment.js");
app.use(paymentRoutes);


app.all("*", (req, res) => {
    res.status(400).json({message: "Page not found"});
});

app.listen(process.env.PORT, () => {
    console.log("Server has started !");
});