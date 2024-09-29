require("dotenv").config();
const allowedOrigins = ["https://tripto-client.vercel.app/"];

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
