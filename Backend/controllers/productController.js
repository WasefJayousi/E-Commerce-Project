const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {productValidation} = require("../Validators/productValidator");

// Create product
exports.PostProduct = [
    productValidation,
    asynchandler(async (req, res) => {
        const { Productname, Quantity, Price, Description, Availability, CategoryID , img } = req.body;

        // Safely construct the SQL query using placeholders
        const insertQuery = `
            INSERT INTO product (Productname, Quantity, Price, Description, Availability, CategoryID , img) 
            VALUES (?, ?, ?, ?, ?, ? ,?)
        `;
            const connection = getConnection(); // Ensure this is called
            const [result,fields] = await connection.query(insertQuery, [
                Productname,
                Quantity,
                Price,
                Description,
                Availability,
                CategoryID,
                img,
            ]);
            return res.status(200).json({ message: `Created successfully`});
    })
];

exports.HomePageProducts = asynchandler(async (req,res) => {
    const connection = getConnection() // database connection
     const products = await connection.query(
    "SELECT ProductID, Productname, Price , CategoryID FROM product ORDER BY RAND() LIMIT 8"
  );
  return res.status(200).json(products[0]);
})

exports.RelatedProducts = asynchandler(async (req,res) => {
  const CategoryID = req.params.id
  const connection = getConnection() // database connection
  const products = await connection.query(`SELECT ProductID, Productname, Price , CategoryID FROM product Where CategoryID = ? ORDER BY RAND() LIMIT 4` , [CategoryID]);
  return res.status(200).json(products[0]);
})

exports.ViewProduct = asynchandler(async (req,res) => {
    const ProductID = parseInt(req.params.id,10) || parseInt(req.body.id ,10)
    if(!ProductID) return res.status(404).json({error:"ProductID required!"})
    const connection = getConnection()
    const [product] = await connection.query(`SELECT * FROM product WHERE ProductID = ?` , [ProductID])
      if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
    return res.status(200).json({product:product[0]})
})

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
                             WHERE ProductID = ? 
                             LIMIT 1`
        const connection = getConnection();
        console.log("in work")
        const [Results,fields] = await connection.query(UpdateQuery , [Productname , Quantity , Price , Description , Availability , CategoryID , ProductID])
        if(Results.affectedRows === 0) {
            return res.status(200).json({message:"Product Does not Exist!"})
        }
        console.log("updated!")
        return res.status(200).json({message:"Product Updated!" , Results , fields})
    })]

// apply best practices : https://planetscale.com/blog/mysql-pagination
// complete later..
// search any product that matches input
// pagnation , get index from query or param and then multiply it by the limit of retrievable product in sql
// apply defered join pagnation
exports.SearchProduct = asynchandler(async (req, res) => {
  const text = req.query.text?.trim();
  const indexpage = Number(req.query.index);

  if (!text || text.length === 0) {
    return res.status(400).json({ message: "No search query!" });
  }

  if (isNaN(indexpage)) {
    return res.status(400).json({ message: "Invalid page index!" });
  }

  const inputquery = `%${text}%`;
  const limit = 10;
  const offset = (indexpage * limit) - limit;

  const connection = getConnection();
  const query = `SELECT * FROM product WHERE productName LIKE ? LIMIT ? OFFSET ?`;
  const [results] = await connection.query(query, [inputquery, limit, offset]);

  return res.status(200).json({ products: results });
});






