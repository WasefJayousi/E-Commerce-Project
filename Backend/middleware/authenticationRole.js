const asyncHandler = require("express-async-handler")

exports.isAdmin = asyncHandler(async (req,res,next) => {
    const role = req.user.role
    if(role.toLowerCase() !== "admin") return res.status(403).json({error:"Forbidden Access!"})  // for now exact admin comparision
    next()
})