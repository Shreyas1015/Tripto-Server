require("dotenv").config();
const mysql = require("mysql2");

// Validate environment variables
if (
  !process.env.DB_HOST ||
  !process.env.DB_USER ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME ||
  !process.env.DB_PORT
) {
  console.error("Missing database configuration in environment variables");
  process.exit(1);
}

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the Database:", err.message);
    return;
  }
  console.log(`Connected to the ${process.env.DB_NAME} Database`);
});

module.exports = connection;
