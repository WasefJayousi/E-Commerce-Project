const express = require("express")
const router = express.Router();
const orderController = require("../controllers/orderController")
const passport = require("passport")

router.post("/Create-Checkout-Paymentintent" , passport.authenticate('jwt',{session:false}),orderController.Checkout) // user checkout for order creating a payment intent.

router.post("/Place-Order/:paymentIntentID" , passport.authenticate('jwt',{session:false}),orderController.PlaceOrder) // after success user payment , place order.

router.get("/History" ,passport.authenticate('jwt',{session:false}), orderController.History) // get past or current orders for user.

module.exports = router