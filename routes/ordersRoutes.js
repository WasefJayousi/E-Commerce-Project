const express = require("express")
const router = express.Router();
const orderController = require("../controllers/orderController")

router.post("/Buy/:id" , orderController.BuyOrder) // Buy Product Router , ID of User

router.get("/History/:id" , orderController.History) // get past or current orders for user

router.get("/:id" , ) // get orders for the user (id:number)

router.post("/Create" , )

module.exports = router