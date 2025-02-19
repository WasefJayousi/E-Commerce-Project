const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {BuyOrderValidation} = require("../Validators/orderValidator");

// execute order ... payment method not added yet
exports.BuyOrder = [
    BuyOrderValidation,
    asynchandler(async(req,res)=>{
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0
        const products = req.body
        const UserID = parseInt(req.params.id , 10); // req.params returns as a string , so convert to int Base 10 (decimal numbers)
        const status = "accepted" // depends on the transaction but for now accepted
        const payment_method = "Card" // temp for now
        const connection = getConnection()
        const [OrderResult,OrderFields] = await connection.query(`INSERT INTO orders (UserID , PaymentMethod) VALUES (?,?)` ,[UserID,payment_method] )
        const OrderID = OrderResult.insertId // same orderID for each entry
        const orderitemsdata = products.map((product)=> [
            OrderID,
            product.ProductID ,
            product.Quantity,
            status,])
        const add_order_query = `INSERT INTO order_product (OrderID , ProductID , Quantity , Status ) VALUES ?`
        const [OrderProductResult , OrderProductFields] =  await connection.query( add_order_query,[orderitemsdata]) 
        const total_order_amount_query = `select sum(op.Quantity * p.price) as total_order_amount from order_product as op
                       join product as p on p.ProductID = op.ProductID
                       where OrderID = ?
                       group by OrderID;`
        const [totalresult , totalfield] = await connection.query(total_order_amount_query , [OrderID])       
        const add_payment_query = `INSERT INTO payment (UserID , payment_method , amount) VALUES (?,?,?)`
        const [paymentresults , fields] = await connection.query(add_payment_query , [UserID,payment_method,totalresult[0].total_order_amount])
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
    const UserID = req.user.id
    const connection = getConnection();
    const OrderHistory = `SELECT o.OrderID , p.Productname , DATE_FORMAT(o.OrderDate , "%Y-%M-%D %r")Date , op.Quantity , p.Price , op.Status , op.PaymentMethod FROM orders o 
                                               JOIN order_product op ON op.OrderID = o.OrderID
                                               JOIN product p ON p.ProductID = op.ProductID
                                               WHERE o.UserID = ?;`
    const [ordersesults,ordersfields] = await connection.query( OrderHistory, [UserID])
    return res.status(200).json({orders:ordersesults})
})