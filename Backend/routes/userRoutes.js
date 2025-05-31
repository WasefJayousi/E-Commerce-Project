const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const passport = require("passport")

router.post('/EmailChangeVerify' ,passport.authenticate('jwt',{session:false}), userController.EmailUpdateVerification)

router.patch('/EmailUpdate' ,passport.authenticate('jwt',{session:false}), userController.EmailUpdate)

router.patch('/Updatename' ,passport.authenticate('jwt',{session:false}), userController.updatename)

router.post('/PasswordChangeVerify' , userController.ForgetPasswordVerification)

router.patch('/PasswordUpdate' , userController.PasswordUpdate)

router.get('/GetUserInfo' ,passport.authenticate('jwt',{session:false}), userController.GetUserInfo)

module.exports = router