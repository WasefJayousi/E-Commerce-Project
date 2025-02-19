const express = require("express")
const router = express.Router();
const orderController = require("../controllers/orderController")
const passport = require("passport")

router.post("/Buy/:id" , passport.authenticate('jwt',{session:false}),orderController.BuyOrder) // Buy Product Router , ID of User

router.get("/History" ,passport.authenticate('jwt',{session:false}), orderController.History) // get past or current orders for user

module.exports = router