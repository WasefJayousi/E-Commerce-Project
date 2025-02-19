const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {sendEmail} = require("../utils/emailutils")
const jwt = require("jsonwebtoken")


exports.EmailUpdateVerification = asynchandler(async (req,res) => {
        const Email = req.body.Email
        const connection = getConnection()
        const [results] = await connection.query("SELECT Email FROM `user` WHERE Email = ?" , [Email])
        if(results) {
            return res.status(400).json({error:"Email already in use!"})
        }
        if(!Email) return res.status(400).json({error:"email not provided"})
        const VerificationToken = jwt.sign({Email},process.env.JWT_SECRET_EMAIL_KEY , {expiresIn:'1h'})
        const subject = "Verification"
        const html = `<style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 20px;
              text-align: center;
          }
      
          h1 {
              color: #333;
          }
      
          p {
              color: #555;
              line-height: 1.5;
              margin-bottom: 10px;
          } 
          .Do8Zj{
            align-item: center !importent;
            </style>
        
        <h1>Change Email Verification , Valid for 1 Hour</h1>
        <p>Click or Get the Token below to Verify email.</p>
        <p>${VerificationToken}</p>
        <p>If you did not request this, please ignore this email.</p>`
        await sendEmail(Email,subject,"",html)
        res.status(200).json({messagee:`Verification Email sent to ${Email}`})
})

exports.EmailUpdate = asynchandler(async (req,res) => {
    const token = req.body.token
    if(!token) {
        return res.status(400).json({error:"token empty!"})
    }
    jwt.verify(token , process.env.JWT_SECRET_EMAIL_KEY , async(err,decoded)=>
    {
        if(err)
        return res.status(400).json({err:err.message})
        else {
            const connection = getConnection()
            const email =  decoded.Email
            const UserID = req.user.id
            const UpdateEmailQuery = "UPDATE `user` set Email = ? where UserID = ?"
            await connection.query(UpdateEmailQuery , [email,UserID])
            return res.status(201).json({message:"Email Updated Successfuly"})
        }
    })
})


exports.updatename = asynchandler(async (req,res) => {
    const connection = getConnection()
    const UserID = req.user.id
    const firstname = req.body.firstname
    const lastname = req.body.lastname
    if(firstname && lastname) {
        await connection.query("UPDATE `user` SET Firstname = ? , Lastname = ? where USERID = ?" , [firstname , lastname, UserID])
        return res.status(201).json({message:"Firstname and lastname updated!"})
    }
    if(firstname) {
        await connection.query("UPDATE `user` SET Firstname = ? where USERID = ?" , [firstname , UserID])
        return res.status(201).json({message:"Firstname updated!"})
    }
    if(lastname) {
        await connection.query("UPDATE `user` SET Lastname = ? where USERID = ?" , [lastname , UserID])
        return res.status(201).json({message:"Lastname updated!"})
    }
    else {
        return res.status(400).json({error:"values to change not provided!"})
    }
})