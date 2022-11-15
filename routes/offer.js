const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;


const User = require("../models/User.js");
const Offer = require("../models/Offer.js");
const isAuthenticated = require("../middlewares/isAuthenticated.js");



const convertToBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
  };

router.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
    try {
        //console.log(req.headers);
        //console.log(req.body);
        //console.log(req.files);
        //console.log(req.user);

        const details = [
            {"MARQUE": req.body.brand},
            {"TAILLE": req.body.size},
            {"ÉTAT": req.body.condition},
            {"COULEUR": req.body.color},
            {"EMPLACEMENT": req.body.city}
        ];

        const newOffer = new Offer({
            product_name: req.body.title,
            product_description: req.body.description,
            product_price: req.body.price,
            product_details: details,
            //product_image: uploadedPicture,
            owner: req.user,
        });

        if (req.files?.picture){
            const uploadedPicture = await cloudinary.uploader.upload(convertToBase64(req.files.picture), {folder: `/vinted/offer/${newOffer._id}`});

            newOffer.product_image = uploadedPicture;
        }

        await newOffer.save();

        //const offer = await Offer.findById(newOffer._id).populate("owner", "account");
                
        res.status(200).json(newOffer);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.delete("/offer/delete", isAuthenticated, async (req, res) => {
    try {
        if(!req.body.id){
            return res.status(400).json({error: {message: "Id missing"}});
        }
        
        const deletedOffer = await Offer.findByIdAndDelete(req.body.id);
    
        await cloudinary.uploader.destroy(deletedOffer.product_image.public_id);

        await cloudinary.api.delete_folder(deletedOffer.product_image.folder);

        res.status(200).json({message: "Offer deleted"});
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});

router.get("/offers", async (req, res) => {
    try {
        const title = new RegExp(req.query.title, "i");
        let priceMin = 0;
        if (req.query.priceMin){
            priceMin = req.query.priceMin;
        }
        let priceMax = 100000;
        if (req.query.priceMax){
            priceMax = req.query.priceMax;
        }
        const sort = {};
        if (req.query.sort === "price-desc"){
            sort.product_price = "desc"
        } else if (req.query.sort === "price-asc") {
            sort.product_price = "asc";
        }
        let page = 1;
        if (req.query.page) {
            page = req.query.page;
        }
        

        const offers = await Offer.find({
            product_name: title, 
            product_price: {$gte: priceMin, $lte: priceMax},
        })
            .sort(sort)
            .limit(5)
            .skip(5 * (page -1))
            //.select("product_name product_price -_id");
            .populate("owner");

        const count = await Offer.countDocuments({
            product_name: title, 
            product_price: {$gte: priceMin, $lte: priceMax},
        });

        res.status(200).json({count: count, offers});
    } catch (error) {
        res.status(400).json({error: error.message});
    }

});



router.get("/offer/:id", async (req, res) => {
    try {
        if (!req.params.id){
            return res.status(400).json({message: "Missing id"});
        }

        const result = await Offer.findById(req.params.id).populate("owner");;

        if (!result){
            return res.status(400).json({message: "Id inexist"});
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
});


module.exports = router;