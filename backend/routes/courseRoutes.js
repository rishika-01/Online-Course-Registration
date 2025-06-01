const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all courses
router.get("/courses", (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Register student to course
router.post("/register", (req, res) => {
  const { usn, course_id } = req.body;
  const sql = "INSERT INTO enrollments (usn, course_id) VALUES (?, ?)";
  db.query(sql, [usn, course_id], (err) => {
    if (err) return res.status(400).json({ error: "Already enrolled or invalid input" });
    res.json({ message: "Registered successfully" });
  });
});

module.exports = router;
