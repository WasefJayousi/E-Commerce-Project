const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const { productValidation , BuyOrderValidation} = require("../middlewares/validators/productValidator");
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
            const connection = getConnection(); // Ensure this is called
            const [result,fields] = await connection.query(insertQuery, [
                Productname,
                Quantity,
                Price,
                Description,
                Availability,
                CategoryID
            ]);
            console.log(req.body)
            return res.status(200).json({ message: `Created successfully` , result:result.insertId});
    })
];

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
        return res.status(200).json({message:"Product Updated!" , Results , fields})

    })

]

exports.BuyOrder = [
    BuyOrderValidation,
    asynchandler(async(req,res)=>{
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0 
        const Items = req.body
        const UserID = parseInt(req.params.id , 10); // req.params returns as a string , so convert to int Base 10 (decimal numbers)
        const status = "accepted" // depends on the transaction but for now accepted
        const connection = getConnection()
        const [OrderResult,OrderFields] = await connection.query(`INSERT INTO orders (UserID) VALUES (?)` ,[UserID] )
        const OrderID = OrderResult.insertId // same orderID for each entry
        const add_product_query = `INSERT INTO order_product (OrderID , ProductID , Quantity , Status) VALUES (?,?,?,?)`
        Items.forEach(async(item) => {
            const [OrderJunctionResult , OrderJunctionFields] =  await connection.query( add_product_query, [OrderID, item.ProductID , item.Quantity , status]) // for loop?
            // maybe add here to see execution result finished by order query and then execute the decrement
            const decrementQunatity =  await connection.query(`UPDATE product Set Quantity = Quantity-? WHERE ProductID = ?` , [item.Quantity , item.ProductID])     
        });
        return res.status(201).json({message:"Order Accepted"}) // add another object for -  order select * from order where OrderID = OrderID
    })
]
exports.SearchProduct 
