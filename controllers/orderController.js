const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {BuyOrderValidation} = require("../Validators/orderValidator");
const stripe = require("../utils/stripepayment")

// maybe add req.body = items later?
exports.Checkout = [BuyOrderValidation,asynchandler(async (req,res) => {
    const connection = getConnection()
    const items = req.body // user items selected
    const placeholders = items.map(() => "SELECT ? AS ProductID, ? AS Quantity").join(" UNION ALL ");
    const values = items.flatMap(item=> [item.ProductID , item.Quantity])
    const Total_amount_query = `
    SELECT SUM(p.Price * c.Quantity) AS Total_amount
    FROM (
      ${placeholders}
    ) AS c
    JOIN product p ON c.ProductID = p.ProductID;
  `; // single query execution for acquiring total_amount for selected user products (instead of for loop)
    const [result,fields] = await connection.query(Total_amount_query , values)
    const total_amount = Number(result[0].Total_amount)
    const paymentIntent = await stripe.paymentIntents.create({
        amount:total_amount * 100, //You can change your account to process transactions in jod by adding a bank account for this currency at https://dashboard.stripe.com/account
        currency:'usd', // usd for now
        automatic_payment_methods: {enabled: true , allow_redirects:"never"}
    })// payment intent creation
    console.log("The paymentIntent: ",paymentIntent)
    return res.status(200).json({message:"Payment intent created succesfully" , client_secret :paymentIntent.client_secret})
})]

// confirm payment , maybe when using acid transactions and we rollback on the database inserts , we refund the user ?
exports.PlaceOrder = asynchandler(async(req,res)=>{
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0
        const paymentIntentID = req.params.paymentIntentID
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID)
        if(paymentIntent.status !== "succeeded") return res.status(400).json({message:"transaction not successful"}) // setup webhook later to retreive payment_intent status to check for payment success
        const alreadypayed = await stripe.paymentIntents.confirm(paymentIntentID,{payment_method: 'pm_card_visa',});
        if(alreadypayed.message === "You cannot confirm this PaymentIntent because it has already succeeded after being previously confirmed") return res.status(400).json({message:"this order has already been payed and placed"})
        const paymentmethodID = paymentIntent.payment_method
        const payment_method_details = await stripe.paymentMethods.retrieve(paymentmethodID)//from payment intent get the card details to get the payment_method to insert in database
        const payment_method = payment_method_details.type //+ "/" + payment_method_details.brand  gets the type(card,link,amazon) and the brand (visa,mastercard,etc)

        const products = req.body
        const UserID = req.user.id
        const status = "accepted" // depends on the transaction but for now accepted

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
    return res.status(201).json({message:"Transaction succeeded and order accepted"}) // add another object for -  order select * from order where OrderID = OrderID
})


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