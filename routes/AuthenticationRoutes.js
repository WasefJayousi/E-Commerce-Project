const express = require('express');
const router = express.Router();
const AuthenticationController = require("../controllers/AuthenticationController")


router.post('/SendVerificationEmail' ,AuthenticationController.sendVerificationEmail);
router.post('/CompleteRegister' , AuthenticationController.CompleteRegister)
router.post('/login' , AuthenticationController.Login )



module.exports = router;
