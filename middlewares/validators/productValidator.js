const {body , validationResult} = require("express-validator")
const {getConnection} = require("../../database/DBconnection");
exports.productValidation = [
    body("Productname" , "Product name is empty!").trim().isLength({min:1}).escape(),
    body("Quantity").isNumeric().withMessage("Not Numeric number").isLength({min:1}).withMessage("Cannot be Empty"),
    body("Price" , "Empty or not Numeric input for price!").isNumeric().withMessage("Not Numeric number").isLength({min:1}).withMessage("Cannot be Empty"),
    body("Description" , "Description is empty!").trim().isLength({min:1}).escape(),
    body("Availability" , "Availability is empty").trim().isLength({min:1}).escape(),
    body("CategoryID" , "Empty or not Numeric input for CategoryID").isNumeric().withMessage("Not Numeric number").isLength({min:1}).withMessage("Cannot be Empty"),
    async(req,res,next)=>{
        const connection = getConnection()
        const productname = req.body.Productname
        const query = "SELECT 1 FROM product WHERE Productname = ? LIMIT 1";
        const [ProductExists] = await connection.query(query , [productname])
        if(ProductExists.length > 0) {return res.status(404).json({errormessage:"Product Already Exists"})}
        const result = validationResult(req)
        if(!result.isEmpty()) {
            return res.status(404).json({errors:result.array()})
        }
        next()
    }
]


