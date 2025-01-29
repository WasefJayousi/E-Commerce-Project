const {body , validationResult} = require("express-validator")
const {getConnection} = require("../../database/DBconnection");
exports.productValidation = [
    body("Productname" , "Product name is empty!").trim().isLength({min:1}).escape(),
    body("Quantity").isNumeric().withMessage("Not Numeric").isLength({min:1}).withMessage("Cannot be Empty"),
    body("Price" , "Empty or not Numeric input for price!").isLength({min:1}).withMessage("Cannot be Empty").isNumeric().withMessage("Not Numeric"),
    body("Description" , "Description is empty!").trim().isLength({min:1}).escape(),
    body("Availability" , "Availability is empty").trim().isLength({min:1}).escape(),
    body("CategoryID" , "Empty or not Numeric input for CategoryID").isLength({min:1}).withMessage("Cannot be Empty").isNumeric().withMessage("Not Numeric"),// maybe CategoryID does not exist validation?
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

exports.BuyOrderValidation = [
    body("arr.*.ProductID").isLength({min:1}).withMessage("Cannot be Empty").isNumeric().withMessage("Not Numeric"),
    body("arr.*.Quantity").isLength({min:1}).withMessage("Cannot be Empty").isNumeric().withMessage("Not Numeric"),
    body("arr.*.Status").trim().isLength({min:5}).withMessage("Status Needed"),
    async(req,res,next)=>{
        const result = validationResult(req)
        if(!result.isEmpty()) {
            console.log(req.body)
            return res.status(404).json({errors:result.array()})
        }
        next()
    }

]
