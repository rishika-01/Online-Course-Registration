/*import jsPDF from 'jspdf';
import 'jspdf-autotable';*/


document.addEventListener("DOMContentLoaded", async () => {
  const name = localStorage.getItem("name");
  const usn = localStorage.getItem("usn");
  document.getElementById("studentName").textContent = name;
  document.getElementById("studentUsn").textContent = usn;

  const courseTable = document.getElementById("courseTable");
  const message = document.getElementById("message");

  // Load available courses
  const res = await fetch("http://localhost:5000/courses");
  const courses = await res.json();

  courses.forEach(course => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.code}</td>
      <td>${course.name}</td>
      <td>${course.type}</td>
      <td>${course.faculty}</td>
      <td><button onclick="registerCourse('${course.id}')">Register</button></td>
    `;
    courseTable.appendChild(row);
  });

  // Load enrolled courses
  loadEnrolledCourses(usn);
});

async function registerCourse(courseId) {
  const usn = localStorage.getItem("usn");
  const message = document.getElementById("message");

  const res = await fetch("http://localhost:5000/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usn, courseId }),
  });

  const data = await res.json();
  message.textContent = data.message;
  message.style.color = res.ok ? "green" : "red";

  if (res.ok) {
    await loadEnrolledCourses(usn); // refresh only on success
  }

  // 👇 Scroll to enrolled section regardless of success or failure
  setTimeout(() => {
    document.getElementById("enrolledCoursesTable").scrollIntoView({ behavior: "smooth" });
  }, 300);
}

async function loadEnrolledCourses(usn) {
  const enrolledTable = document.getElementById("enrolledCoursesTable");
  enrolledTable.innerHTML = ""; // Clear old rows

  const res = await fetch(`http://localhost:5000/enrolled/${usn}`);
  const enrolled = await res.json();

  enrolled.forEach(course => {
    const row = enrolledTable.insertRow();
    row.innerHTML = `
      <td>${course.course_code}</td>
      <td>${course.course_name}</td>
      <td>${course.faculty}</td>
    `;
  });
}

function downloadEnrolledCourses() {
  const table = document.getElementById("enrolledCoursesTable");
  if (!table.rows.length) {
    alert("No enrolled courses to download.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const usn = localStorage.getItem("usn");
  const name = localStorage.getItem("name");

  // Title
  doc.setFontSize(18);
  doc.text("Course Registration Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 20, 30);
  doc.text(`USN: ${usn}`, 20, 38);
  doc.text(`Semester: 4`, 20, 46);
  doc.text(" ", 20, 30); // space

  // Table headers
  let y = 60;
  doc.setFont(undefined, "bold");
  doc.text("Code", 20, y);
  doc.text("Name", 70, y);
  doc.text("Faculty", 160, y);
  doc.setFont(undefined, "normal");

  // Table content
  for (let row of table.rows) {
    y += 10;
    const cells = row.cells;
    doc.text(cells[0].innerText, 20, y);
    doc.text(cells[1].innerText, 70, y);
    doc.text(cells[2].innerText, 160, y);
  }

  doc.save(`enrolled_courses_${usn}.pdf`);
}
