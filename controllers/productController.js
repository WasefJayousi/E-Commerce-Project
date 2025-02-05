const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const { BuyOrderValidation , productValidation} = require("../middlewares/validators/productValidator");

// Create product
exports.PostProduct = [
    productValidation,
    asynchandler(async (req, res) => {
        const { Productname, Quantity, Price, Description, Availability, CategoryID} = req.body;

        // Safely construct the SQL query using placeholders
        const insertQuery = `
            INSERT INTO product (Productname, Quantity, Price, Description, Availability, CategoryID) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
            const connection = getConnection(); // Ensure this is called
            const [result,fields] = await connection.query(insertQuery, [
                Productname,
                Quantity,
                Price,
                Description,
                Availability,
                CategoryID
            ]);
            console.log(result , fields)
            return res.status(200).json({ message: `Created successfully`});
    })
];

// search product by category
exports.GetProductsByCategory = asynchandler(async(req,res)=> {
    const CategoryID = parseInt(req.params.id,10)
    if(!CategoryID) {
        return res.status(404).json({ErrorMessage: "CategoryID params required!"})
    }
    const connection = getConnection();
    const GetProductsByCategory = `
    SELECT 
    product.Productname, 
    product.Price, 
    product.Availability 
    FROM product
    WHERE CategoryID = ?
    ORDER BY Price DESC;`;
    const [rows,fields] = await connection.query(GetProductsByCategory , [CategoryID])
    const [totalproducts]= await connection.query("SELECT COUNT(*) as TotalProducts FROM Product")
    return res.status(200).json({Products : rows , Total_Products : totalproducts})
})


// uptdate product
exports.UpdateProduct = [
    productValidation,
    asynchandler(async(req,res)=> {
        const ProductID = parseInt(req.params.id,10)
        const { Productname, Quantity, Price, Description, Availability, CategoryID} = req.body;
        const UpdateQuery = `UPDATE product 
                             SET Productname = ? , Quantity = ? , Price = ?, Description = ? , Availability = ? , CategoryID = ?
                             WHERE = ProductID = ? LIMIT 1`
        const connection = getConnection();
        const [Results,fields] = await connection.query(UpdateQuery , [Productname , Quantity , Price , Description , Availability , CategoryID , ProductID])
        if(Results.affectedRows === 0) {
            return res.status(200).json({message:"Product Does not Exists!"})
        }
        return res.status(200).json({message:"Product Updated!" , Results , fields})
    })]
// search any product that matches input
exports.SearchProduct = asynchandler(async(req,res)=> {

        const inputquery = `%${req.query.text}%`
        const connection = getConnection()
        const query = `SELECT * FROM product WHERE productName LIKE ?`;
        const [results , fields] = await connection.query(query , [inputquery] )
        return res.status(200).json({products:results})    
})





