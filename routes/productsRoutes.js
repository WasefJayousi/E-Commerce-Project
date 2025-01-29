const express = require("express")
const ProductController = require("../controllers/productController")
const router = express.Router()


router.get("/Category/:id" , ProductController.GetProductsByCategory ) // Get all Categories Router

router.post("/NewProduct" ,ProductController.PostProduct) // Post New Product By Company(Admin or employee) Router

router.put("/Update/:id" , ProductController.UpdateProduct) // Update multiple data in the product By Company(Admin or employee) Router

router.post("/Order/:id" , ProductController.BuyOrder) // Buy Product Router , ID of User

router.get("") // Search Router

module.exports = router