-- schema.sql

-- Users Table
CREATE TABLE users (
    usn VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

-- Courses Table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    faculty VARCHAR(100)
);

-- Enrollments Table
CREATE TABLE enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usn VARCHAR(20),
    course_id INT,
    FOREIGN KEY (usn) REFERENCES users(usn),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (usn, course_id)  -- to prevent duplicate registrations
);
