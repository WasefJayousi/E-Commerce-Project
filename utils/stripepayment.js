const Stripe = require("stripe")
const stripe = new Stripe(process.env.Stripe_Sk_test_key)

module.exports = stripe