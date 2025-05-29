const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const {getConnection} = require('../database/DBconnection');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done ) => {
      try {
        const connection = getConnection()
        const payload = jwt_payload.id
        const query = "SELECT UserID ,Firstname , Lastname , Gender , Role , JoinDate , Email FROM `user` WHERE UserID = ?" // Userid and role only for now
        const [user] = await connection.query(query , [payload]);
        const User = {id:user[0].UserID ,firstname:user[0].Firstname,lastname:user[0].Lastname,Gender:user[0].Gender, role:user[0].Role , joindate:user[0].JoinDate , email:user[0].Email}
        if (user) {
          return done(null,User);
        }

        return done(null, false);
      } catch (error) {
        console.log(error)
        return res(error, false);
      }
    })
  );
};