const express = require("express")
const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const router = express.Router()


router.get("/" , asynchandler(async(req,res)=> {
    const connection = getConnection()
    const [rows,fields] = await connection.query("select * from category")
    return res.status(200).json({Categories:rows})
}))


module.exports = router