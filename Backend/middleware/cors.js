const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://e-commerce.com',
];
// Create a custom CORS middleware that checks the origin header
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      // If the origin is in the allowed list or it's not defined, allow the request
      callback(null, true);
    } else {
      // Otherwise, reject the request
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200, // Set the success status to 200
};

module.exports = {corsOptions}