const express = require("express")
const router = express.Router()
const ProductController = require("../controllers/productController")
const {isAdmin} = require("../middleware/authenticationRole")
const passport = require("passport")


router.get("/SearchProductByCategory/:id" , ProductController.GetProductsByCategory ) // Get Products by a category

router.get("/SearchProduct" , ProductController.SearchProduct) // Search Router

router.get("/HomePageProduct" , ProductController.HomePageProducts)

router.get("/RelatedProducts/:id" , ProductController.RelatedProducts)

router.get("/Viewproduct/:id" , ProductController.ViewProduct)

router.post("/PostProduct" ,passport.authenticate('jwt',{session:false}),isAdmin,ProductController.PostProduct) // Post New Product By Company(Admin or employee) Router

router.put("/Update/:id" ,passport.authenticate('jwt',{session:false}),isAdmin, ProductController.UpdateProduct) // Update multiple data in the product By Company(Admin or employee) Router



module.exports = router