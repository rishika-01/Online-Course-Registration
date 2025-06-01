const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SHAKTHI@5', // update if you set a MySQL root password
  database: 'course_portal'
});

// ✅ 1. Login route
app.post('/login', (req, res) => {
  const { usn, password } = req.body;
  const query = 'SELECT * FROM users WHERE usn = ? AND password = ?';
  db.query(query, [usn, password], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful', name: results[0].name });
  });
});

// ✅ 2. Get all courses
app.get('/courses', (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching courses' });
    res.json(results);
  });
});

// ✅ 3. Enroll in a course (with full data insertion)
app.post('/enroll', (req, res) => {
  const { usn, courseId } = req.body;

  // Step 1: Fetch student name
  const getUserQuery = 'SELECT name FROM users WHERE usn = ?';
  db.query(getUserQuery, [usn], (err, userResult) => {
    if (err || userResult.length === 0) {
      console.error("User fetch failed:", err);
      return res.status(500).json({ message: 'Student not found' });
    }

    const studentName = userResult[0].name;

    // Step 2: Fetch course details
    const getCourseQuery = 'SELECT code, name, faculty FROM courses WHERE id = ?';
    db.query(getCourseQuery, [courseId], (err, courseResult) => {
      if (err || courseResult.length === 0) {
        console.error("Course fetch failed:", err);
        return res.status(500).json({ message: 'Course not found' });
      }

      const courseCode = courseResult[0].code;
      const courseName = courseResult[0].name;
      const faculty = courseResult[0].faculty;

      // Step 3: Check for duplicates
      const checkQuery = 'SELECT * FROM enrollments WHERE usn = ? AND course_id = ?';
      db.query(checkQuery, [usn, courseId], (err, result) => {
        if (err) {
          console.error("Duplicate check failed:", err);
          return res.status(500).json({ message: 'Enrollment check failed' });
        }

        if (result.length > 0) {
          return res.status(400).json({ message: 'Already enrolled' });
        }

        // Step 4: Insert enrollment with full data
        const enrollQuery = `
          INSERT INTO enrollments (course_id, usn, student_name, course_code, course_name, faculty)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(enrollQuery, [
          courseId,
          usn,
          studentName,
          courseCode,
          courseName,
          faculty
        ], (err) => {
          if (err) {
            console.error("Insert failed:", err);
            return res.status(500).json({ message: 'Enrollment failed' });
          }

          res.json({ message: 'Enrolled successfully' });
        });
      });
    });
  });
});



// ✅ 4. Get enrolled courses for a student
app.get('/enrolled/:usn', (req, res) => {
  const { usn } = req.params;
  const query = `
    SELECT 
      c.code AS course_code,
      c.name AS course_name,
      c.faculty,
      u.name AS student_name
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN users u ON e.usn = u.usn
    WHERE e.usn = ?
  `;

  db.query(query, [usn], (err, results) => {
    if (err) {
      console.error("Fetch error:", err);
      return res.status(500).json({ message: 'Error fetching enrolled courses' });
    }
    res.json(results);
  });
});


// ✅ Start server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));


const fs = require('fs');
const path = require('path');

// Ensure this is in server.js
app.get('/download/:usn', (req, res) => {
  const usn = req.params.usn;
  const filePath = path.join(__dirname, `enrolled_courses_${usn}.pdf`);

  if (!fs.existsSync(filePatsh)) {
    return res.status(404).send("File not found");
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=enrolled_courses_${usn}.pdf`);
  
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});
