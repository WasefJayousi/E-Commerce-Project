const {body , validationResult} = require("express-validator")
const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");

exports.AddOrderValidation = asynchandler(async (req, res , next) => {
    const products = req.body
    if(!Array.isArray(products)) return res.status(422).json({error:"data should be array"})  //invalid data 422 status code
    const connection = getConnection()
        for (let index = 0; index < products.length; index++) {
            const product = products[index];
            console.log(product)

            // Validate ProductID
            if (isNaN(product.ProductID) || !product.ProductID) {
                return res.status(400).json({ message: "ProductID Not Numeric or Empty!" });
            }

            // Validate Quantity
            if (isNaN(product.Quantity) || !product.Quantity) {
                return res.status(400).json({ message: "Quantity Not Numeric or Empty!" });
            }

            const ProductID = product.ProductID;
            const [check] = await connection.query(`SELECT Availability ,Quantity , Productname FROM product WHERE ProductID = ?`, [ProductID]);

            // Check if product exists
            if (check.length === 0) {
                return res.status(404).json({ message: "Product Not Found!", ProductID: ProductID });
            }

            const AvailableQuantity = check[0].Quantity;
            const DBAvailability = check[0].Availability
            const UserChosenQuantity = product.Quantity;
            console.log(DBAvailability)
            // Check if available quantity is sufficient
            if(DBAvailability !== "In Stock") {
                return res.status(404).json({message:"Product not in Stock!" , ProductID : ProductID})
            }
            if (AvailableQuantity >= UserChosenQuantity) {
                continue
            }
            else {
                return res.status(400).json({ message: `Product Chosen Quantity Exceeds Available Quantity: ${check[0].Productname} `, ProductID: ProductID });
            }
        }
        // Next MiddleWare
        next() 
})

