const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const passport = require("passport")

router.post('/EmailChangeVerify' ,passport.authenticate('jwt',{session:false}), userController.EmailUpdateVerification)

router.post('/EmailUpdate' ,passport.authenticate('jwt',{session:false}), userController.EmailUpdate)

router.put('/Updatename' ,passport.authenticate('jwt',{session:false}), userController.updatename)

module.exports = router