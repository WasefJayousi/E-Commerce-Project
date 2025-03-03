const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config(); // using .env through process.env

//Routers
const productRouter = require('./routes/productsRoutes')
const cateogryRouter = require('./routes/categoryRoutes')
const orderRouter = require('./routes/ordersRoutes')
const authRouter = require('./routes/AuthenticationRoutes')
const userRouter = require('./routes/userRoutes')
const passport = require('passport')
require('./configs/passport')(passport)

//Database connection
const connect = require('./database/DBconnection')
connect.ConnectToMySql()

const app = express(); // express app (The actual Code Server)

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());


//routers middleware (Endpoints entry point)
app.use('/Categories' , cateogryRouter)
app.use('/Products' , productRouter)
app.use('/Orders' , orderRouter)
app.use('/Auth' , authRouter)
app.use('/Users' , userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.status(err.raw.statusCode||err.status || 500).json({
    message: err.message || "Internal Server Error",
    status: err.raw.statusCode||err.status || 500,})
    console.log(err)
});
console.log(`listening on http://127.0.0.1:3000`)
module.exports = app;