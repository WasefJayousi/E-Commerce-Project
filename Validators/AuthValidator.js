const {body , validationResult} = require("express-validator")
const asyncHandler = require("express-async-handler"); // Ensure this is installed and imported
const {getConnection} = require("../database/DBconnection");

exports.RegisterValidation = [
    body("Email").trim().isLength({min:6}).withMessage("minimum email length is 6 characters").isEmail().withMessage("Email format invalid").escape()
    .custom(async(value)=>{
        const connection = getConnection()
        const [result , fields] = await connection.query('SELECT Email FROM `user` WHERE Email = ?' , [value])
        if(result.length > 0) {
            return Promise.reject("Email Already in Use")
        }
    }),
    body("Firstname").trim().isLength({min:4}).withMessage("first name required and minimum length is 4 characteres!").escape(),
    body("Lastname").trim().isLength({min:4}).withMessage("first name required and minimum length is 4 characteres!").escape(),
    body("Gender").trim().isLength({min:1 , max:1}).withMessage("Gender Required , min 1 and max 1 number").escape(),
    body("Password").trim().isStrongPassword({minLength:8,minLowercase:1,minUppercase:1,minSymbols:1}).withMessage("Password must be 8 Characters long , 1 min upper case , 1 min lowercase and 1 Specical character").escape(),
    asyncHandler(async (req,res,next) => {
        const result = validationResult(req)
        if(!result.isEmpty()) {
            return res.status(404).json({errors:result.array()})
        }
        next()
    })
]

exports.LoginValidation = [
    body("Email").trim().isLength({min:1}).withMessage("Email Required").isEmail().withMessage("Email format invalid").escape()
    .custom(async(value ,{req})=>{
        const connection = getConnection()
        const [result , fields] = await connection.query('SELECT * FROM `user` WHERE Email = ?' , [value])
        if(result.length === 0) {
            return Promise.reject("Email or Password is Invalid!")
        }
        req.user = {
            id:result[0].UserID,
            email:result[0].Email,
            password:result[0].password,
            role:result[0].Role
        }
    }),
    body("Password").trim().isLength({min:1}).withMessage("Password is required").escape(),
    asyncHandler(async (req,res,next) => {
        const result = validationResult(req)
        if(!result.isEmpty()) {
            return res.status(404).json({errors:result.array()})
        }
        next()
    })
]