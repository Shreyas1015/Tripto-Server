require("dotenv").config();
const allowedOrigins = [process.env.CORS_URL];

const corsOptions = {
  origin: (origin, callback) => {
    console.log("Request received from origin:", origin);
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS policy:", origin);
      callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
