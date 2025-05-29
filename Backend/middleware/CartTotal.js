const {getConnection} = require("../database/DBconnection")

exports.CartTotalPrice = async (UserID) => {
    const connection = getConnection()
    const [carttotal] = await connection.query(`SELECT sum(p.Price * c.Quantity) as Total_Price FROM cart c JOIN product p on p.ProductID = c.ProductID Where UserID = ?` , [UserID])
    return carttotal[0].Total_Price
}

