const {body , validationResult} = require("express-validator")
const asynchandler = require("express-async-handler");
const {getConnection} = require("../../database/DBconnection");

exports.BuyOrderValidation = asynchandler(async (req, res , next) => {
    const products = req.body;
    const connection = getConnection();

        for (let index = 0; index < products.length; index++) {
            const product = products[index];

            // Validate ProductID
            if (isNaN(product.ProductID) || !product.ProductID) {
                return res.status(400).json({ message: "ProductID Not Numeric or Empty!" });
            }

            // Validate Quantity
            if (isNaN(product.Quantity) || !product.Quantity) {
                return res.status(400).json({ message: "Quantity Not Numeric or Empty!" });
            }

            const ProductID = product.ProductID;
            const [check, fields] = await connection.query(`SELECT Availability ,Quantity FROM product WHERE ProductID = ?`, [ProductID]);

            // Check if product exists
            if (check.length === 0) {
                return res.status(404).json({ message: "Product Not Found!", ProductID: ProductID });
            }

            const AvailableQuantity = check[0].Quantity;
            const DBAvailability = check[0].Availability
            const UserChosenQuantity = product.Quantity;

            // Check if available quantity is sufficient
            if(DBAvailability !== "in Stock") {
                return res.status(404).json({message:"Product not in Stock!" , ProductID : ProductID})
            }
            if (AvailableQuantity >= UserChosenQuantity) {
                continue
            }
            else {
                return res.status(400).json({ message: "Product Chosen Quantity Exceeds Available Quantity!", ProductID: ProductID });
            }
        }
        // Next MiddleWare
        next() 
})