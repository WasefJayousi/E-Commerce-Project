const express = require("express")
const ProductController = require("../controllers/productController")
const router = express.Router()


router.get("/Category/:id" , ProductController.GetProductsByCategory )

router.post("/NewProduct" ,ProductController.PostProduct)

router.put("/") // update multiple data in the product

router.patch("/") // update a single data in the product depending on the last one

router.delete("/Delete")

module.exports = router