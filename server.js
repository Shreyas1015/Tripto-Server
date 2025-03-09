require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoute");
const driversRoute = require("./src/routes/driversRoute");
const vendorRoute = require("./src/routes/vendorRoute");
const passengersRoute = require("./src/routes/passengersRoute");
const adminRoute = require("./src/routes/adminRoute");
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const corsOptions = require("./src/middlewares/corsMiddleware");
const PORT = 5000;

const app = express();

//MiddleWare
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/drivers", driversRoute);
app.use("/passengers", passengersRoute);
app.use("/admin", adminRoute);
app.use("/vendor", vendorRoute);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
