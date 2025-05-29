const {getConnection} = require('../database/DBconnection')
const stripe = require('stripe')
// confirm payment , maybe when using acid transactions and we rollback on the database inserts , we refund the user ?
const VerifyOrder = async(req,res)=>{
    try {
        console.log("Web hook in progress")
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0 also fail
        const sig = req.headers["stripe-signature"] // Stripe sends a unique signature in the request headers.
        let event

        try {
            event = stripe.webhooks.constructEvent(req.body , sig , process.env.STRIPE_WEBHOOK_SECRET )
            
        } catch (error) {
            console.error("Webhook signature verification failed:", error.message)
            return res.status(400).send(`Webhook Error: ${error.message}`)
        }

        if(event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object
            console.log("Payment successful for :" , paymentIntent.id)

        const UserID = event.data.object.metadata.userID
        const OrderID = event.data.object.metadata.OrderID
        const status = "paid" // status changed to paid / accepted and ready to be shipped
        const payment_method = event.data.object.payment_method_types[0]
        const paymentInentID = event.data.object.paymentInentID

        const connection = getConnection()
        const [ShipmentResult] = await connection.query('INSERT INTO Shipment (UserID,AddressID) VALUES (?,?)' , [UserID,1])
        const [OrderResult] = await connection.query('SELECT ProductID , Quantity FROM order_product WHERE OrderID = ?' , [OrderID])
        const items = OrderResult
        // add here to check if product not available
        await connection.query(`UPDATE orders SET Status = ? , PaymentMethod = ? , ShipmentID = ? , paymentintentID = ? WHERE UserID = ? and OrderID = ?` ,[status,payment_method,ShipmentResult.insertId,paymentIntent.id,UserID,OrderID] ) // Update status and payment_metho

        //✅ Parallel Execution of Updates – Using Promise.all() ensures all updates run concurrently.
        //✅ Performance Boost – Instead of sequentially updating each product, all updates happen at once, reducing execution time.
        await Promise.all(
            items.map(async product => {
                await connection.query(`UPDATE product SET Quantity = Quantity - ? WHERE ProductID = ?`,[product.Quantity, product.ProductID])
                const [quantityresult] = await connection.query(`SELECT Quantity FROM product WHERE ProductID = ?` , [product.ProductID])
                if(quantityresult.Quantity === 0) {
                    await connection.query(`UPDATE product SET Availability = Not-in-Stock WHERE ProductID = ?`,[product.ProductID])
                }
            })
        ) 
        console.log("Transaction succeeded and order accepted")
        return res.status(201).json({message:"Transaction succeeded and order accepted"}) // add another object for -  order select * from order where OrderID = OrderID
        }
    else {
        console.log("Payment error?")
        return res.status(400).json({error:"Payment error yikes!"})
    }   
    } catch (error) {
        console.log(error)
        return res.status(400).json({error:error})
    }
}

module.exports = {VerifyOrder}