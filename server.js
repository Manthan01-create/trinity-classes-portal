const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Seed database with mock data if it does not exist
const initialDb = {
  "_announcements": [
    { "id": 1, "title": "Quarterly Exam Schedule Out", "desc": "Quarterly exams will commence from next Monday. Please download the schedule from the circular section.", "date": "2026-07-02" },
    { "id": 2, "title": "Science Project Submission", "desc": "Physics lab manual submission deadline is June 30th. Ensure all experimental logs are signed.", "date": "2026-06-30" }
  ],
  "alice": {
    username: "alice",
    password: "password123",
    profile: {
      name: "Alice Smith",
      id: "TC-2026-084",
      grade: "Class XII - A",
      email: "alice.smith@trinityclasses.edu",
      phone: "+1 (555) 123-4567",
      avatar: "AS",
      joinedDate: "April 2025"
    },
    performance: {
      gpa: "3.85 / 4.0",
      totalTests: 6,
      subjects: [
        { name: "Mathematics", score: 95, color: "#6366f1" },
        { name: "Physics", score: 88, color: "#06b6d4" },
        { name: "Chemistry", score: 92, color: "#a855f7" },
        { name: "English", score: 85, color: "#ec4899" },
        { name: "Computer Science", score: 98, color: "#10b981" }
      ],
      history: [
        { month: "Jan", score: 82 },
        { month: "Feb", score: 85 },
        { month: "Mar", score: 90 },
        { month: "Apr", score: 88 },
        { month: "May", score: 94 },
        { month: "Jun", score: 95 }
      ]
    },
    attendance: {
      rate: 93,
      present: 132,
      absent: 6,
      late: 4,
      calendar: {
        "1": "present", "2": "present", "3": "present", "4": "late", "5": "present",
        "8": "present", "9": "present", "10": "absent", "11": "present", "12": "present",
        "15": "present", "16": "present", "17": "present", "18": "present", "19": "present",
        "22": "present", "23": "late", "24": "present", "25": "present", "26": "absent",
        "29": "present", "30": "present"
      }
    },
    fees: {
      total: 2500,
      paid: 1800,
      pending: 700,
      activeScheme: "installments",
      installments: [
        { id: 1, title: "1st Installment (Enrollment)", amount: 900, dueDate: "2026-04-15", status: "paid" },
        { id: 2, title: "2nd Installment (Midterm)", amount: 900, dueDate: "2026-05-15", status: "paid" },
        { id: 3, title: "3rd Installment (Final)", amount: 700, dueDate: "2026-06-30", status: "pending" }
      ],
      breakdown: [
        { item: "Tuition Fee (Q1 & Q2)", amount: 1500, status: "paid" },
        { item: "Science Lab Fee", amount: 300, status: "paid" },
        { item: "Computer Lab & Tech Fee", amount: 300, status: "paid" },
        { item: "Library & Study Material", amount: 200, status: "pending" },
        { item: "Annual Examination Fee", amount: 200, status: "pending" }
      ],
      transactions: [
        { id: "TXN-98421", date: "2026-04-10", amount: 1000, method: "Credit Card", status: "Completed" },
        { id: "TXN-99150", date: "2026-05-05", amount: 800, method: "PayPal", status: "Completed" }
      ]
    }
  },
  "bob": {
    username: "bob",
    password: "password123",
    profile: {
      name: "Bob Jones",
      id: "TC-2026-112",
      grade: "Class XII - B",
      email: "bob.jones@trinityclasses.edu",
      phone: "+1 (555) 987-6543",
      avatar: "BJ",
      joinedDate: "August 2025"
    },
    performance: {
      gpa: "3.42 / 4.0",
      totalTests: 6,
      subjects: [
        { name: "Mathematics", score: 78, color: "#6366f1" },
        { name: "Physics", score: 82, color: "#06b6d4" },
        { name: "Chemistry", score: 75, color: "#a855f7" },
        { name: "English", score: 90, color: "#ec4899" },
        { name: "Computer Science", score: 85, color: "#10b981" }
      ],
      history: [
        { month: "Jan", score: 70 },
        { month: "Feb", score: 74 },
        { month: "Mar", score: 73 },
        { month: "Apr", score: 80 },
        { month: "May", score: 82 },
        { month: "Jun", score: 85 }
      ]
    },
    attendance: {
      rate: 86,
      present: 122,
      absent: 14,
      late: 6,
      calendar: {
        "1": "present", "2": "absent", "3": "present", "4": "present", "5": "present",
        "8": "present", "9": "late", "10": "present", "11": "absent", "12": "present",
        "15": "present", "16": "present", "17": "absent", "18": "present", "19": "late",
        "22": "present", "23": "present", "24": "present", "25": "present", "26": "present",
        "29": "absent", "30": "present"
      }
    },
    fees: {
      total: 2500,
      paid: 1200,
      pending: 1300,
      activeScheme: "installments",
      installments: [
        { id: 1, title: "1st Installment (Enrollment)", amount: 800, dueDate: "2026-04-15", status: "paid" },
        { id: 2, title: "2nd Installment (Midterm)", amount: 900, dueDate: "2026-05-15", status: "partial", paidAmount: 400 },
        { id: 3, title: "3rd Installment (Final)", amount: 800, dueDate: "2026-06-30", status: "pending" }
      ],
      breakdown: [
        { item: "Tuition Fee (Q1 & Q2)", amount: 1500, status: "partial", paidAmount: 800 },
        { item: "Science Lab Fee", amount: 300, status: "paid" },
        { item: "Computer Lab & Tech Fee", amount: 300, status: "pending" },
        { item: "Library & Study Material", amount: 200, status: "pending" },
        { item: "Annual Examination Fee", amount: 200, status: "pending" }
      ],
      transactions: [
        { id: "TXN-97305", date: "2026-04-12", amount: 800, method: "Debit Card", status: "Completed" },
        { id: "TXN-98922", date: "2026-05-15", amount: 400, method: "Bank Transfer", status: "Completed" }
      ]
    }
  }
};

// Database Read/Write helpers
function getDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file, returning default schema", err);
    return initialDb;
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving database file", err);
    return false;
  }
}

// ---------------- STUDENT APIS ----------------

// Student Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const db = getDatabase();
  const student = db[username.toLowerCase().trim()];

  if (student && student.password === password) {
    res.json({
      success: true,
      username: student.username,
      name: student.profile.name
    });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// Get Student Info
app.get('/api/student/:username', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const db = getDatabase();
  const student = db[username];

  if (student) {
    // Return student copy (hide password for security, keep in backend)
    const clientData = { ...student };
    delete clientData.password;
    res.json(clientData);
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

// Pay Fees
app.post('/api/student/:username/pay', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const { amount, method, description, installmentId } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }

  const db = getDatabase();
  const student = db[username];

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Generate transaction ID
  const txnId = "TXN-" + Math.floor(10000 + Math.random() * 90000);
  const today = new Date().toISOString().split('T')[0];

  // Update student balances
  const payVal = parseFloat(amount);
  student.fees.paid += payVal;
  student.fees.pending = Math.max(0, student.fees.total - student.fees.paid);

  // Add transaction log
  student.fees.transactions.unshift({
    id: txnId,
    date: today,
    amount: payVal,
    method: method || "Card Payment",
    status: "Completed"
  });

  // Handle specific installment allocation if provided
  if (installmentId) {
    const inst = student.fees.installments.find(i => i.id === parseInt(installmentId));
    if (inst) {
      if (inst.status === 'pending' || inst.status === 'partial') {
        const currentPaid = inst.paidAmount || 0;
        const targetPaid = currentPaid + payVal;
        
        if (targetPaid >= inst.amount) {
          inst.status = 'paid';
          inst.paidAmount = inst.amount;
        } else {
          inst.status = 'partial';
          inst.paidAmount = targetPaid;
        }
      }
    }
  } else {
    // Fallback: Allocate payment automatically across pending installments
    let remainingPay = payVal;
    for (let inst of student.fees.installments) {
      if (remainingPay <= 0) break;
      
      const currentPaid = inst.status === 'paid' ? inst.amount : (inst.paidAmount || 0);
      const needed = inst.amount - currentPaid;
      
      if (needed > 0) {
        if (remainingPay >= needed) {
          inst.status = 'paid';
          inst.paidAmount = inst.amount;
          remainingPay -= needed;
        } else {
          inst.status = 'partial';
          inst.paidAmount = currentPaid + remainingPay;
          remainingPay = 0;
        }
      }
    }
  }

  // Allocate dynamically to breakdown items
  let breakdownRemaining = payVal;
  for (let item of student.fees.breakdown) {
    if (breakdownRemaining <= 0) break;

    const currentPaid = item.status === 'paid' ? item.amount : (item.paidAmount || 0);
    const needed = item.amount - currentPaid;

    if (needed > 0) {
      if (breakdownRemaining >= needed) {
        item.status = 'paid';
        item.paidAmount = item.amount;
        breakdownRemaining -= needed;
      } else {
        item.status = 'partial';
        item.paidAmount = currentPaid + breakdownRemaining;
        breakdownRemaining = 0;
      }
    }
  }

  saveDatabase(db);
  
  res.json({
    success: true,
    message: "Payment recorded successfully",
    transaction: student.fees.transactions[0],
    fees: student.fees
  });
});

// ---------------- ADMIN APIS ----------------

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  // Custom simple credentials for the school operator
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      token: "admin-jwt-token-simulated",
      name: "Trinity Registrar"
    });
  } else {
    res.status(401).json({ error: "Invalid administrator credentials" });
  }
});

// Get Student List (Summary details)
app.get('/api/admin/students', (req, res) => {
  const db = getDatabase();
  const summary = Object.keys(db)
    .filter(key => !key.startsWith('_'))
    .map(key => {
      const s = db[key];
      return {
        username: s.username,
        name: s.profile.name,
        id: s.profile.id,
        grade: s.profile.grade,
        email: s.profile.email,
        attendanceRate: s.attendance.rate,
        feesPending: s.fees.pending
      };
    });
  res.json(summary);
});

// Add New Student
app.post('/api/admin/student', (req, res) => {
  const { username, password, profile } = req.body;

  if (!username || !password || !profile || !profile.name) {
    return res.status(400).json({ error: "Missing required student details" });
  }

  const cleanUser = username.toLowerCase().trim();
  const db = getDatabase();

  if (db[cleanUser]) {
    return res.status(400).json({ error: "A student with this username already exists" });
  }

  // Create default student template
  const newStudent = {
    username: cleanUser,
    password: password,
    profile: {
      name: profile.name,
      id: profile.id || "TC-2026-" + Math.floor(100 + Math.random() * 900),
      grade: profile.grade || "Class XII - A",
      email: profile.email || `${cleanUser}@trinityclasses.edu`,
      phone: profile.phone || "+1 (555) 000-0000",
      avatar: profile.avatar || profile.name.split(' ').map(n=>n[0]).join('').toUpperCase(),
      joinedDate: profile.joinedDate || new Date().toLocaleString('default', { month: 'long', year: 'numeric' })
    },
    performance: {
      gpa: "0.00 / 4.0",
      totalTests: 0,
      subjects: [
        { name: "Mathematics", score: 0, color: "#6366f1" },
        { name: "Physics", score: 0, color: "#06b6d4" },
        { name: "Chemistry", score: 0, color: "#a855f7" },
        { name: "English", score: 0, color: "#ec4899" },
        { name: "Computer Science", score: 0, color: "#10b981" }
      ],
      history: []
    },
    attendance: {
      rate: 0,
      present: 0,
      absent: 0,
      late: 0,
      calendar: {}
    },
    fees: {
      total: 2500,
      paid: 0,
      pending: 2500,
      activeScheme: "installments",
      installments: [
        { id: 1, title: "1st Installment (Enrollment)", amount: 900, dueDate: "2026-04-15", status: "pending" },
        { id: 2, title: "2nd Installment (Midterm)", amount: 900, dueDate: "2026-05-15", status: "pending" },
        { id: 3, title: "3rd Installment (Final)", amount: 700, dueDate: "2026-06-30", status: "pending" }
      ],
      breakdown: [
        { item: "Tuition Fee (Q1 & Q2)", amount: 1500, status: "pending" },
        { item: "Science Lab Fee", amount: 300, status: "pending" },
        { item: "Computer Lab & Tech Fee", amount: 300, status: "pending" },
        { item: "Library & Study Material", amount: 200, status: "pending" },
        { item: "Annual Examination Fee", amount: 200, status: "pending" }
      ],
      transactions: []
    }
  };

  db[cleanUser] = newStudent;
  saveDatabase(db);

  res.status(201).json({ success: true, message: "Student record created successfully", username: cleanUser });
});

// Update Student Record (Dynamic Admin update)
app.put('/api/admin/student/:username', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const updatePayload = req.body;

  const db = getDatabase();
  const student = db[username];

  if (!student) {
    return res.status(404).json({ error: "Student not found" });
  }

  // Update profile
  if (updatePayload.profile) {
    student.profile = { ...student.profile, ...updatePayload.profile };
  }

  // Update password if provided
  if (updatePayload.password) {
    student.password = updatePayload.password;
  }

  // Update performance details
  if (updatePayload.performance) {
    student.performance = { ...student.performance, ...updatePayload.performance };
  }

  // Update attendance details
  if (updatePayload.attendance) {
    student.attendance = { ...student.attendance, ...updatePayload.attendance };
  }

  // Update fees details
  if (updatePayload.fees) {
    student.fees = { ...student.fees, ...updatePayload.fees };
  }

  saveDatabase(db);

  res.json({ success: true, message: "Student updated successfully", data: student });
});

// Delete Student Record
app.delete('/api/admin/student/:username', (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const db = getDatabase();

  if (db[username]) {
    delete db[username];
    saveDatabase(db);
    res.json({ success: true, message: "Student deleted successfully" });
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

// GET Global Announcements
app.get('/api/announcements', (req, res) => {
  const db = getDatabase();
  const announcements = db._announcements || [];
  res.json(announcements);
});

// PUT / UPDATE Global Announcements
app.post('/api/admin/announcements', (req, res) => {
  const { announcements } = req.body;
  if (!Array.isArray(announcements)) {
    return res.status(400).json({ error: "Invalid announcements payload" });
  }

  const db = getDatabase();
  db._announcements = announcements;
  saveDatabase(db);

  res.json({ success: true, message: "Announcements updated successfully" });
});

// POST Batch Attendance Mark
app.post('/api/admin/batch-attendance', (req, res) => {
  const { day, absentees } = req.body;

  if (day === undefined || !Array.isArray(absentees)) {
    return res.status(400).json({ error: "Missing required June day number or absentees array" });
  }

  const db = getDatabase();
  const cleanAbsentees = absentees.map(name => name.trim().toLowerCase());

  // Loop over all registry entries
  Object.keys(db).forEach(key => {
    if (key.startsWith('_')) return; // skip metadata

    const student = db[key];
    if (!student.attendance.calendar) {
      student.attendance.calendar = {};
    }

    const studentUsername = student.username.toLowerCase();
    const studentName = student.profile.name.toLowerCase();

    // Check if the student matches any of the absentees by username or full name
    const isAbsent = cleanAbsentees.some(abs => 
      studentUsername === abs || studentName === abs || studentName.includes(abs)
    );

    // Set day status
    student.attendance.calendar[day] = isAbsent ? "absent" : "present";

    // Recalculate attendance stats
    let present = 0;
    let absent = 0;
    let late = 0;

    Object.keys(student.attendance.calendar).forEach(d => {
      const status = student.attendance.calendar[d];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
    });

    const total = present + absent + late;
    const rate = total > 0 ? Math.round(((present + (late * 0.5)) / total) * 100) : 0;

    student.attendance.present = present;
    student.attendance.absent = absent;
    student.attendance.late = late;
    student.attendance.rate = rate;
  });

  saveDatabase(db);
  res.json({ success: true, message: "Batch attendance successfully updated" });
});

// Catch-all route to serve Student Portal
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  TRINITY CLASSES PORTAL SERVER IS ONLINE!`);
  console.log(`  Running at: http://localhost:${PORT}`);
  console.log(`  Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log(`==================================================`);
});
