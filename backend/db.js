const mysql = require("mysql2");
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",         // your MySQL username
  password: "SHAKTHI@5",         // your MySQL password
  database: "course_portal"  // your database name
});

conn.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL");
});

module.exports = conn;
