const asynchandler = require("express-async-handler");
const {getConnection} = require("../database/DBconnection");
const {sendEmail} = require("../utils/emailutils")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt');
const {body , validationResult} = require("express-validator")

exports.GetUserInfo = asynchandler(async (req,res) => {
    const UserID = req.user.id
    const connection = getConnection()
    const [UserInfo] = await connection.query(`SELECT Email , Firstname , Lastname , Gender , Role , JoinDate FROM user WHERE UserID = ?` , [UserID])
    return res.status(200).json({UserInfo:UserInfo})
})
exports.EmailUpdateVerification = asynchandler(async (req,res) => {
        const Email = req.body.Email
        const connection = getConnection()
        const [results] = await connection.query("SELECT Email FROM `user` WHERE Email = ?" , [Email])
        if(results.length !== 0) {
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
        res.status(200).json({message:`Verification Email sent to ${Email}`})
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

// maybe change to one query only?
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


// password reset
exports.ForgetPasswordVerification = asynchandler(async (req,res) => {
    const Email = req.body.Email
    if(!Email) return res.status(400).json({error:"email not provided"})
    const connection = getConnection()
    const [EmailExist,fields] = await connection.query("SELECT UserID,Email FROM `user` WHERE Email = ?" , [Email])
    if(!EmailExist) return res.status(404).json({error:"Email Does not exist"})
    const VerificationToken = jwt.sign({Email},process.env.JWT_SECRET_Password_KEY , {expiresIn:'1h'})
    const subject = "Password Verification"
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
    
    <h1>Change Password Verification , Valid for 1 Hour</h1>
    <p>Click or Get the Token below to Verify email.</p>
    <a href="http://localhost:5500/Frontend/resetpassword.html?token=${VerificationToken}" class="verify-btn">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>`
    await sendEmail(Email,subject,"",html)
    return res.status(200).json({message:`Verification Email sent to ${Email}`})
})

exports.PasswordUpdate = [
body("Password").trim().isStrongPassword({minLength:8,minLowercase:1,minUppercase:1,minSymbols:1}).withMessage("Password must be 8 Characters long , 1 min upper case , 1 min lowercase and 1 Specical character").escape(),
asynchandler(async (req,res) => {
            const result = validationResult(req)
            if(!result.isEmpty()) {
                console.log(result.array())
                return res.status(400).json({errors:result.array()})
            }
const token = req.body.token || req.query.token
const newPassword = req.body.Password
const HashedPassword = await bcrypt.hash(newPassword,10)
if(!token) return res.status(400).json({error:"token empty!"})
if(!newPassword) return res.status(400).json({error:"new password needed!"})
jwt.verify(token , process.env.JWT_SECRET_Password_KEY , async(err,decoded)=>
   {
    if(err)
    return res.status(400).json({err:err.message})
    else {
        console.log(decoded)
        const connection = getConnection()
        const Email = decoded.Email
        const UpdateEmailQuery = "UPDATE `user` set Password = ? where Email = ?"
        await connection.query(UpdateEmailQuery , [HashedPassword,Email])
        return res.status(201).json({message:"Password Updated Successfuly"})
    }
  })
})]
