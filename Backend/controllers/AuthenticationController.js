const asynchandler = require("express-async-handler")
const {getConnection} = require("../database/DBconnection")
const {RegisterValidation , LoginValidation} = require("../Validators/AuthValidator")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const {sendEmail} = require("../utils/emailutils")
const SECRET_KEY = process.env.JWT_SECRET_KEY


exports.sendVerificationEmail = [
    RegisterValidation,
    asynchandler(async (req,res) => {
        const {Email , Firstname , Lastname , Gender , Password} = req.body
        const payload = {Email , Firstname , Lastname , Gender , Password}
        const VerificationToken = jwt.sign(payload,process.env.JWT_SECRET_EMAIL_KEY , {expiresIn:'1h'})

const subject = "Verification";
const html = `
  <style>
    body {
      font-family: Arial, sans-serif;
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

    .verify-btn {
      display: inline-block;
      padding: 10px 20px;
      margin-top: 20px;
      background-color: #007bff;
      color: #fff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
    }

    .verify-btn:hover {
      background-color: #0056b3;
    }
  </style>

  <h1>Verify Your Email</h1>
  <p>Click the button below to verify your account.</p>
  <a href="http://localhost:5500/Frontend/HomePage.html?token=${VerificationToken}" class="verify-btn">Verify Email</a>
  <p>If you did not request this, you can safely ignore this email.</p>
`;
await sendEmail(Email, subject, "", html);
        return res.status(200).json({message:`Verification Email sent to ${Email}`})
    })
]

exports.CompleteRegister = asynchandler(async (req,res) => {
    const authHeader = req.headers['authorization']
    if(!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({error:"Authorization header missing or invalid"})
    const VerificationToken = authHeader.split(' ')[1]
    const DecodedToken = jwt.verify(VerificationToken,process.env.JWT_SECRET_EMAIL_KEY)
    const {Email , Firstname , Lastname , Gender , Password} = DecodedToken
    const Role = "Customer" // default value
    const connection = getConnection()
    const [EmailExists] = await connection.query('SELECT Email FROM `user` WHERE Email = ?' , [Email])
    if(EmailExists.length > 0) {
        return res.status(404).json({error:"Email already registered! , login instead"})
    }
    const HashedPassword = await bcrypt.hash(Password,10)
    const query = "INSERT INTO `user` (Email,Firstname,Lastname,Gender,Password,Role) VALUES(?,?,?,?,?,?)"
    await connection.query(query,[Email,Firstname,Lastname,Gender,HashedPassword,Role])
    console.log("User created!")
    return res.status(200).json({message:"user signup successful", User:DecodedToken})
})

exports.Login =[LoginValidation , asynchandler(async (req,res) => {
    const UserPayload = req.user
    const {Password} = req.body
    const validpassword = await bcrypt.compare(Password, UserPayload.password)
    if(!validpassword) {
        return res.status(401).json({error:"Email or Password is Invalid!"})
    }
    const accessToken = jwt.sign(UserPayload,SECRET_KEY , {expiresIn:'1h'})
    const refreshToken = jwt.sign(UserPayload,process.env.JWT_SECRET_REFRESH_KEY , {expiresIn:'7d'})
    console.log("login success")
    return res.status(200).json({message:"Login successful" , accessToken , refreshToken})
})]

// for Relogin , if access token (login already active) not expired deny?
// Note: implement if refreshtoken expired recently , issue a new refreshtoken?
exports.RefereshToken = asynchandler(async (req,res) => {
    const UserPayload = req.user
    const token = req.body // refresh token
    const verified = jwt.verify(refreshtoken,SECRET_KEY)
    if(!verified) return res.status(404).json({error:"token invalid , please login again"})
    const accessToken = jwt.sign(UserPayload,SECRET_KEY , {expiresIn:'1h'})
    return res.status(200).json({message:"Re-Login successful" , accessToken})
})

