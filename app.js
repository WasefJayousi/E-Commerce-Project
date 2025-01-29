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
