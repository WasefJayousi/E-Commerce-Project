const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {AddOrderValidation} = require("../Validators/orderValidator");
const {CartTotalPrice} = require("../middleware/CartTotal")
const stripe = require("../utils/stripepayment");
const { get } = require("../app");


// maybe add req.body = items later?
exports.Checkout = [AddOrderValidation,asynchandler(async (req,res) => {
    const connection = getConnection()
    const UserID = req.user.id
    const payment_method = "card" // change later to cash or card by user 
    const status = "unpaid"
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
    
    const [result] = await connection.query(Total_amount_query , values)
    const total_amount = Number(result[0].Total_amount) + 5 // 5 for shipment cost
    const [OrderResult] = await connection.query(`INSERT INTO orders (UserID , PaymentMethod , status) VALUES (?,?,?)` ,[UserID,payment_method,status])
    const OrderID = OrderResult.insertId
    await Promise.all(
      items.map(async product=>{
    const add_order_query = `INSERT INTO order_product (OrderID, ProductID, Quantity) VALUES (?, ?, ?)`
    connection.query(add_order_query, [OrderID,product.ProductID , product.Quantity])
      })
    )

    const paymentIntent = await stripe.paymentIntents.create({
        amount:total_amount * 100, //You can change your account to process transactions in jod by adding a bank account for this currency at https://dashboard.stripe.com/account
        currency:'usd', // usd for now
        metadata: {
            userID: req.user.id,
            OrderID:OrderID
        }
    })
    connection.query(`UPDATE orders SET StripeClientSecret = ? , paymentintentID = ? WHERE OrderID = ? and UserID = ?` , [paymentIntent.client_secret,paymentIntent.id,OrderID,UserID])
    return res.status(200).json({message:"Payment intent created succesfully" , client_secret :paymentIntent.client_secret} , ) 
  } 
)]

//cancel order function
exports.CancelOrder = asynchandler(async (req,res) => {
  const OrderID = req.params.orderid
  const UserID = req.user.id
  const connection = getConnection()  
  const [OrderResult] = await connection.query('SELECT UserID , paymentintentID FROM orders WHERE OrderID = ?' , [OrderID])
  console.log(OrderResult)
  if(OrderResult[0].UserID === UserID) {
    const paymentIntent = await stripe.paymentIntents.cancel(OrderResult[0].paymentintentID);

    const [result] = await connection.query('DELETE FROM order_product WHERE OrderID = ?' , [OrderID]) 
    if(result.affectedRows === 0) {
      return res.status(410).json({error:"Order not found"})
    }
    await connection.query('DELETE FROM orders WHERE OrderID = ?' , [OrderID])   // placed here incase its already deleted and no need to do the query!
    return res.status(201).json({message:"Order Deleted Successfully" , paymentIntent})
  } 
  else {
    return res.status(403).json({error:"Not Authorized!"})
  } 
  })

//add to cart functionality
exports.addtocart = [AddOrderValidation,asynchandler(async (req,res) => {
    const connection = getConnection()
    const UserID = req.user.id
    const product = req.body[0]
    //check if the user selected a product he already has in the cart and increment quantity
    const [cartresult] = await connection.query(`SELECT CartID FROM cart WHERE UserID = ? and ProductID = ?` , [UserID,product.ProductID])
    if(cartresult.length === 0){
      await connection.query(`INSERT INTO cart(UserID,ProductID,Quantity) VALUES (?,?,?)` , [UserID,product.ProductID,product.Quantity])
      return res.status(201).json({message:"item added to cart successfully" ,})
    }
    // else means that product already in cart and want to increase cart
    else {
      await connection.query(`UPDATE cart SET Quantity = Quantity + ? WHERE CartID= ?` , [product.Quantity , cartresult[0].CartID])
      return res.status(201).json({message:"item quantity incremented "})
    }

})]

exports.viewcart = asynchandler(async (req,res) => {
  const UserID = req.user.id
  const connection = getConnection()

  const [cartresult] = await connection.query(`SELECT c.CartID , c.ProductID , p.Productname , c.Quantity , p.Price , cg.name as category , c.Quantity * p.Price as total_item_price  FROM cart c
                                              JOIN product p on c.ProductID = p.ProductID
                                              JOIN Category cg on cg.CategoryID = p.CategoryID
                                              where UserID = ?` , [UserID])
  const total_cart_price =  await CartTotalPrice(UserID)
  return res.status(200).json({cartresult:cartresult , total_cart_price:total_cart_price})
})

exports.totalcartitems = asynchandler(async (req,res) => {
  const UserID = req.user.id
  const connection = getConnection()
  const [CartTotal] = await connection.query(`SELECT count(*) total_cart_items  FROM cart WHERE UserID = ?` , [UserID])
  return res.status(200).json({CartTotal:CartTotal[0].total_cart_items})
})

exports.De_or_in_cremental = asynchandler(async (req,res) => {
  const UserID = req.user.id
  const product = req.body
  const connection = getConnection()
  await connection.query(`UPDATE cart SET Quantity = Quantity + ? WHERE UserID = ? and CartID = ?` , [product.QuantityChange , UserID , product.CartID])
  return res.status(201).json({message:"product quantity Changed"})
})

exports.removecartitem = asynchandler(async (req,res) => {
  const connection = getConnection()
  const UserID = req.user.id
  const CartID = req.body.CartID
  const CartResult = await connection.query('DELETE FROM cart WHERE CartID = ? and UserID = ?' , [CartID , UserID])
  if(CartResult.affectedRows === 0) return res.status(404).json({error:"item not found!"})
    return res.status(200).json({message:"item removed"})
})

exports.clearcart = asynchandler(async (req,res) => {
  const connection = getConnection()
  const UserID = req.user.id
  const CartResult = await connection.query('DELETE FROM cart WHERE UserID = ?' , [UserID])
  if(CartResult.affectedRows === 0) return res.status(404).json({error:"items not found!"})
    return res.status(200).json({message:"cart cleared"})
})

// change it to depends on if the user selected the paid orders or still checkout order
exports.History = asynchandler(async (req,res) => {

    const UserID = req.user.id
    const status = req.query.status
    const connection = getConnection();
    if(status.toLowerCase() === "unpaid") {
    const OrderHistory = `SELECT o.OrderID,o.StripeClientSecret , p.Productname , DATE_FORMAT(o.OrderDate , "%Y-%M-%D %r")Date , op.Quantity , p.Price , o.Status , o.PaymentMethod FROM orders o 
                                               JOIN order_product op ON op.OrderID = o.OrderID
                                               JOIN product p ON p.ProductID = op.ProductID
                                               WHERE o.UserID = ? and o.Status = "unpaid";`
    const [ordersesults] = await connection.query( OrderHistory, [UserID])
    return res.status(200).json({orders:ordersesults})
    } else {
    const OrderHistory = `SELECT o.OrderID ,o.ShipmentID, p.Productname , DATE_FORMAT(o.OrderDate , "%Y-%M-%D %r")Date , op.Quantity , p.Price , op.ShipmentStatus , o.PaymentMethod FROM orders o 
                                               JOIN order_product op ON op.OrderID = o.OrderID
                                               JOIN Shipment s ON s.ShipmentID = o.ShipmentID
                                               JOIN Address a ON a.AddressID = s.AddressID
                                               JOIN product p ON p.ProductID = op.ProductID
                                               WHERE o.UserID = ? and o.Status = "paid";`
    const [ordersesults] = await connection.query( OrderHistory, [UserID])
    console.log(ordersesults)
    return res.status(200).json({orders:ordersesults})                                           
    } 
})  