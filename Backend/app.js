const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bodyParser = require("body-parser");
require('dotenv').config(); // using .env through process.env

//Routers
const productRouter = require('./routes/productsRoutes')
const cateogryRouter = require('./routes/categoryRoutes')
const orderRouter = require('./routes/ordersRoutes')
const authRouter = require('./routes/AuthenticationRoutes')
const userRouter = require('./routes/userRoutes')
const passport = require('passport')
const webhooks = require('./middleware/webhookstripe')
const {corsOptions} = require('./middleware/cors')
require('./configs/passport')(passport)

//Database connection
const connect = require('./database/DBconnection')
connect.ConnectToMySql()

const app = express(); // express app (The actual Code Server)

app.post('/stripe/webhook',bodyParser.raw({type: "application/json"}),webhooks.VerifyOrder)

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
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
app.use(function (err, req, res, next) {
  res.locals.message = err.message;

  // Set locals for development use
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log full stack trace
  console.error('❌ Error Stack:', err.stack);

  // Respond with full error if in development
  return res.status(err.status || 500).json({error: err.message});
});


module.exports = app;