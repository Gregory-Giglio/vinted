const express = require("express");
const router = express.Router();

const stripe = require("stripe")(process.env.STRIPE_SECRET);


router.post("/payment", async (req, res) => {
    try {
        const stripeToken = req.body.token;
        const amount = req.body.amount * 100;

        const response = await stripe.charges.create({
            amount: amount,
            currency: "eur",
            description: req.body.title,
            source: stripeToken,
        });
          
        res.json(response.status);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

});