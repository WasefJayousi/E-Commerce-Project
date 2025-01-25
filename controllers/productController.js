const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const { productValidation } = require("../middlewares/validators/productValidator");
const { param ,  validationResult} = require('express-validator');

exports.PostProduct = [
    productValidation,
    asynchandler(async (req, res) => {
        const { Productname, Quantity, Price, Description, Availability, CategoryID} = req.body;

        // Safely construct the SQL query using placeholders
        const insertQuery = `
            INSERT INTO product (Productname, Quantity, Price, Description, Availability, CategoryID) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        try {
            const connection = getConnection(); // Ensure this is called
            const [result,fields] = await connection.query(insertQuery, [
                Productname,
                Quantity,
                Price,
                Description,
                Availability,
                CategoryID
            ]);

            return res.status(200).json({ message: "Created successfully", result });
        } catch (error) {
            console.error("Error inserting product:", error);
            return res.status(500).json({ message: "Internal server error", error });
        }
    }),
];

exports.GetProductsByCategory = asynchandler(async(req,res)=> {
    const CategoryID = parseInt(req.params.id,10)
    if(!CategoryID) {
        return res.status(404).json({ErrorMessage: "CategoryID params required!"})
    }
    const connection = getConnection();
    const GetCategoryQuery = 'Select * From `product` where `CategoryID` = ?';
    const [rows,fields] = await connection.query(GetCategoryQuery , [CategoryID])
    return res.status(200).json({Products : rows})
})

