const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const usersRouter = require('./routes/usersRoutes');
const productRouter = require('./routes/productsRoutes')
const cateogryRouter = require('./routes/categoryRoutes')
const connect = require('./database/DBconnection')
connect.ConnectToMySql()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//routers middleware (Endpoints entry point)
//maybe delete this part of code?
app.post('/test' , async (req,res) => {
        // if the products are in-stock we continue otherwise fail... also when product quantity becomes 0
        const products = req.body
        const status = "accepted" // depends on the transaction but for now accepted
        const connection = connect.getConnection()
        const [check , fields] = await connection.query(`SELECT Availability,Quantity FROM product WHERE ProductID = 17`) // Check if Available
        const orderitemsdata = products.map((product)=> [
            product.ProductID ,
            product.Quantity,
            status])
            for (let index = 0; index < orderitemsdata.length; index++) {
              const ProductID = orderitemsdata[index][0]
              const [check , fields] = await connection.query(`SELECT Availability,Quantity FROM product WHERE ProductID = ?` , [ProductID]) // Check if Available
              const DBAvailability = check[0].Availability
              const DBQuantity = check[0].Quantity
              const UserQuantity = orderitemsdata[index][1]
              if(DBAvailability !== "in Stock") {
                  return res.status(404).json({message:"Product not in Stock!" , ProductID : ProductID})
              }
              if(DBQuantity >= UserQuantity ) {
                continue
              }
              else {
                return res.status(404).json({message:"Product Chosen Quantity Over Quantity Limit!" , ProductID : ProductID})
              }
              return res.status(200).json({message:"Successful"})
                 
            }
})
app.use('/Categories' , cateogryRouter)
app.use('/Products' , productRouter)


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // error response
  res.status(err.status || 500).json({message:err.stack});

});

module.exports = app;
