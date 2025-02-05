const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const { BuyOrderValidation} = require("../middlewares/validators/orderValidator");

// execute order ... payment method not added yet
exports.BuyOrder = [
    BuyOrderValidation,
    asynchandler(async(req,res)=>{
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0
        const products = req.body
        const UserID = parseInt(req.params.id , 10); // req.params returns as a string , so convert to int Base 10 (decimal numbers)
        const status = "accepted" // depends on the transaction but for now accepted
        const connection = getConnection()
        const [OrderResult,OrderFields] = await connection.query(`INSERT INTO orders (UserID) VALUES (?)` ,[UserID] )
        const OrderID = OrderResult.insertId // same orderID for each entry
        const orderitemsdata = products.map((product)=> [
            OrderID,
            product.ProductID ,
            product.Quantity,
            status])
        const add_product_query = `INSERT INTO order_product (OrderID , ProductID , Quantity , Status) VALUES ?`
        const [OrderJunctionResult , OrderJunctionFields] =  await connection.query( add_product_query,[orderitemsdata]) 
        //✅ Parallel Execution of Updates – Using Promise.all() ensures all updates run concurrently.
        //✅ Performance Boost – Instead of sequentially updating each product, all updates happen at once, reducing execution time.
        await Promise.all(
            products.map(product => {
                connection.query(`UPDATE product SET Quantity = Quantity - ? WHERE ProductID = ?`,[product.Quantity, product.ProductID])
            })
        ) 

    return res.status(201).json({message:"Order Accepted"}) // add another object for -  order select * from order where OrderID = OrderID
})]


exports.History = asynchandler(async (req,res) => {
    if(!isNaN(req.params.id) && !req.params.id) {
        return res.status(404).json({error:"id is empty or not a number"})
    }
    const UserID = parseInt(req.params.id,10)
    const connection = getConnection();
    const [results,fields] = await connection.query(`SELECT o.OrderID , p.Productname , DATE_FORMAT(o.OrderDate , "%Y-%M-%D %r")Date , op.Quantity , p.Price , op.Status FROM orders o 
                                               JOIN order_product op ON op.OrderID = o.OrderID
                                               JOIN product p ON p.ProductID = op.ProductID
                                               WHERE o.UserID = ?;` , [UserID])
    return res.status(200).json({orders:results})
})