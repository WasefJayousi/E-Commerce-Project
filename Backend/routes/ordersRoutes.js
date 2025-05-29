const express = require("express")
const router = express.Router();
const orderController = require("../controllers/orderController")
const passport = require("passport");


router.post("/Create-Checkout-Paymentintent" , passport.authenticate('jwt',{session:false}),orderController.Checkout) // user checkout for order creating a payment intent.

router.post("/AddToCart" ,passport.authenticate('jwt',{session:false}), orderController.addtocart)

router.get("/View-Cart" , passport.authenticate('jwt',{session:false}) , orderController.viewcart)

router.post("/QuantityChange" , passport.authenticate('jwt',{session:false}) , orderController.De_or_in_cremental)

router.delete("/DeleteCartItem" , passport.authenticate('jwt',{session:false}) , orderController.removecartitem)

router.delete("/Cancel-Order/:orderid" , passport.authenticate('jwt',{session:false}) , orderController.CancelOrder)

router.delete("/ClearCart" ,passport.authenticate('jwt',{session:false}), orderController.clearcart)

router.get("/History" ,passport.authenticate('jwt',{session:false}), orderController.History) // get past or current orders for user.

router.get("/TotalCartItems" , passport.authenticate('jwt',{session:false}) , orderController.totalcartitems)

module.exports = router