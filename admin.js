// Global Admin Application State
let adminToken = null;
let studentsList = [];
let filteredStudents = [];
let selectedStudent = null;
let activeTab = 'profile';

const API_BASE = window.location.protocol === 'file:' ? 'http://localhost:8000/api' : '/api';

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    initAdminApp();
});

function initAdminApp() {
    setupAuthListeners();
    setupTabListeners();
    setupSearchListener();
    setupStudentModal();
    checkActiveSession();
}

// Session Checks
function checkActiveSession() {
    const savedToken = localStorage.getItem("trinity_admin_token");
    if (savedToken) {
        adminToken = savedToken;
        document.getElementById("admin-login-container").classList.add("hidden");
        document.getElementById("admin-app-container").classList.remove("hidden");
        loadStudentsRegistry();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById("admin-login-container").classList.remove("hidden");
    document.getElementById("admin-app-container").classList.add("hidden");
}

function logoutAdmin() {
    adminToken = null;
    localStorage.removeItem("trinity_admin_token");
    location.reload();
}

// Setup Event Listeners
function setupAuthListeners() {
    // Admin Login Form
    const loginForm = document.getElementById("admin-login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("admin-username").value.trim();
        const password = document.getElementById("admin-password").value;
        const errorDiv = document.getElementById("admin-login-error");

        try {
            const res = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                errorDiv.innerText = "";
                adminToken = data.token;
                localStorage.setItem("trinity_admin_token", data.token);
                showToast("Login Successful", "Welcome to Trinity Classes Registrar Portal.", "success");
                
                document.getElementById("admin-login-container").classList.add("hidden");
                document.getElementById("admin-app-container").classList.remove("hidden");
                loadStudentsRegistry();
            } else {
                errorDiv.innerText = data.error || "Authentication failed.";
                triggerShake();
            }
        } catch (err) {
            errorDiv.innerText = "Connection error. Make sure server is running.";
            triggerShake();
        }
    });

    // Exit Console Button
    document.getElementById("admin-logout-btn").addEventListener("click", logoutAdmin);
}

function triggerShake() {
    const card = document.querySelector(".login-card");
    card.classList.add("shake-animation");
    setTimeout(() => card.classList.remove("shake-animation"), 500);
}

// Sidebar Student List Loading & Filtering
async function loadStudentsRegistry() {
    const listContainer = document.getElementById("admin-student-list");
    try {
        const res = await fetch(`${API_BASE}/admin/students`);
        if (res.ok) {
            studentsList = await res.json();
            filteredStudents = [...studentsList];
            renderStudentList();
        } else {
            listContainer.innerHTML = `<div class="error-msg-block">Failed to load registry</div>`;
        }
    } catch (err) {
        listContainer.innerHTML = `<div class="error-msg-block">Server connection error</div>`;
    }
}

function renderStudentList() {
    const listContainer = document.getElementById("admin-student-list");
    listContainer.innerHTML = "";

    if (filteredStudents.length === 0) {
        listContainer.innerHTML = `<div class="list-placeholder">No students found</div>`;
        return;
    }

    filteredStudents.forEach(student => {
        const item = document.createElement("div");
        item.className = "student-list-item";
        if (selectedStudent && selectedStudent.username === student.username) {
            item.classList.add("active");
        }

        const initials = student.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2);

        item.innerHTML = `
            <div class="student-avatar-sm">${initials}</div>
            <div class="student-item-details">
                <div class="student-item-name">${student.name}</div>
                <div class="student-item-meta">${student.grade} • ID: ${student.id}</div>
            </div>
            <div class="student-item-badge ${student.feesPending > 0 ? 'fees-pending' : 'fees-paid'}">
                ${student.feesPending > 0 ? `$${student.feesPending}` : 'Paid'}
            </div>
        `;

        item.addEventListener("click", () => selectStudent(student.username));
        listContainer.appendChild(item);
    });
}

function setupSearchListener() {
    const searchInput = document.getElementById("student-search");
    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
            filteredStudents = [...studentsList];
        } else {
            filteredStudents = studentsList.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.id.toLowerCase().includes(query) ||
                s.username.toLowerCase().includes(query)
            );
        }
        renderStudentList();
    });
}

// Student Selection
async function selectStudent(username) {
    try {
        const res = await fetch(`${API_BASE}/student/${username}`);
        if (res.ok) {
            selectedStudent = await res.json();
            
            // Highlight selected student in list
            document.querySelectorAll(".student-list-item").forEach(item => {
                const name = item.querySelector(".student-item-name").innerText;
                if (name === selectedStudent.profile.name) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            // Display Workspace Editor
            document.getElementById("workspace-placeholder").classList.add("hidden");
            document.getElementById("workspace-editor").classList.remove("hidden");

            // Render details
            renderStudentEditor();
            showToast("Record Loaded", `Loaded data for ${selectedStudent.profile.name}.`, "info");
        } else {
            showToast("Load Error", "Unable to load student details.", "error");
        }
    } catch (err) {
        showToast("Error", "Server connection timed out.", "error");
    }
}

// Tabs Management
function setupTabListeners() {
    const tabs = document.querySelectorAll(".editor-tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            const targetTab = e.currentTarget.dataset.tab;
            tabs.forEach(t => t.classList.remove("active"));
            e.currentTarget.classList.add("active");

            document.querySelectorAll(".tab-panel").forEach(panel => {
                panel.classList.remove("active");
            });
            document.getElementById(`tab-${targetTab}`).classList.add("active");
            activeTab = targetTab;
        });
    });
}

// Populate Editor Views
function renderStudentEditor() {
    if (!selectedStudent) return;

    // Header Profile
    document.getElementById("editor-student-avatar").innerText = selectedStudent.profile.avatar;
    document.getElementById("editor-student-name").innerText = selectedStudent.profile.name;
    document.getElementById("editor-student-meta").innerText = `${selectedStudent.profile.grade} • ID: ${selectedStudent.profile.id}`;

    // Profile Tab Inputs
    document.getElementById("edit-profile-username").value = selectedStudent.username;
    document.getElementById("edit-profile-password").value = selectedStudent.password;
    document.getElementById("edit-profile-name").value = selectedStudent.profile.name;
    document.getElementById("edit-profile-id").value = selectedStudent.profile.id;
    document.getElementById("edit-profile-grade").value = selectedStudent.profile.grade;
    document.getElementById("edit-profile-email").value = selectedStudent.profile.email;
    document.getElementById("edit-profile-phone").value = selectedStudent.profile.phone || "";
    document.getElementById("edit-profile-joined").value = selectedStudent.profile.joinedDate || "";
    document.getElementById("edit-profile-avatar").value = selectedStudent.profile.avatar || "";

    // Performance Tab Inputs
    document.getElementById("edit-perf-gpa").value = selectedStudent.performance.gpa || "0.00 / 4.0";
    document.getElementById("edit-perf-tests").value = selectedStudent.performance.totalTests || 0;
    renderSubjectsList();

    // Attendance Tab
    document.getElementById("edit-attend-present").value = selectedStudent.attendance.present || 0;
    document.getElementById("edit-attend-absent").value = selectedStudent.attendance.absent || 0;
    document.getElementById("edit-attend-late").value = selectedStudent.attendance.late || 0;
    document.getElementById("edit-attend-rate-lbl").innerText = `${selectedStudent.attendance.rate || 0}%`;
    renderAttendanceCalendar();

    // Fees Tab
    document.getElementById("edit-fee-total").value = selectedStudent.fees.total || 0;
    document.getElementById("edit-fee-paid").value = selectedStudent.fees.paid || 0;
    document.getElementById("edit-fee-pending").value = selectedStudent.fees.pending || 0;
    document.getElementById("edit-fee-scheme").value = selectedStudent.fees.activeScheme || "installments";
    renderInstallmentsList();
    renderBreakdownList();
    renderTransactionsTable();

    // Automatically recalculate pending fee when total/paid change
    const updatePendingVal = () => {
        const tot = parseFloat(document.getElementById("edit-fee-total").value) || 0;
        const pd = parseFloat(document.getElementById("edit-fee-paid").value) || 0;
        document.getElementById("edit-fee-pending").value = Math.max(0, tot - pd);
    };
    document.getElementById("edit-fee-total").oninput = updatePendingVal;
    document.getElementById("edit-fee-paid").oninput = updatePendingVal;
}

// ---------------- TAB-SPECIFIC EDITORS ----------------

// 1. Subjects Render
function renderSubjectsList() {
    const container = document.getElementById("edit-subjects-list");
    container.innerHTML = "";

    const subjects = selectedStudent.performance.subjects || [];

    if (subjects.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">No subjects registered.</div>`;
        return;
    }

    subjects.forEach((subj, idx) => {
        const item = document.createElement("div");
        item.className = "subject-editor-row";
        item.innerHTML = `
            <input type="text" class="form-input subj-name" value="${subj.name}" placeholder="Subject Name" style="flex: 2;">
            <input type="number" class="form-input subj-score" value="${subj.score}" placeholder="Score %" min="0" max="100" style="width: 100px;">
            <input type="color" class="form-input subj-color" value="${subj.color || '#6366f1'}" style="width: 50px; padding: 2px; cursor: pointer;">
            <button class="icon-btn-action delete-subj-row-btn" data-index="${idx}" title="Delete Subject" style="background: var(--danger-glow); color: var(--danger);">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(item);
    });

    // Subject Delete Handler
    container.querySelectorAll(".delete-subj-row-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(e.currentTarget.dataset.index);
            selectedStudent.performance.subjects.splice(idx, 1);
            renderSubjectsList();
        });
    });
}

// Add Subject button
document.getElementById("add-subject-btn").onclick = () => {
    if (!selectedStudent.performance.subjects) selectedStudent.performance.subjects = [];
    selectedStudent.performance.subjects.push({ name: "", score: 0, color: "#6366f1" });
    renderSubjectsList();
};

// 2. Attendance Calendar Render
function renderAttendanceCalendar() {
    const grid = document.getElementById("edit-calendar-grid");
    grid.innerHTML = "";

    // June 2026 starts on Monday (1st) and has 30 days. No padding days.
    const totalDays = 30;
    const calendar = selectedStudent.attendance.calendar || {};

    // Loop through days
    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell";
        
        const status = calendar[day] || "";
        if (status) {
            cell.classList.add(status);
        }

        cell.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="day-status-indicator"></div>
        `;

        // Click to cycle attendance status: empty -> present -> late -> absent -> empty
        cell.addEventListener("click", () => {
            const currentStatus = calendar[day] || "";
            let nextStatus = "";
            if (currentStatus === "") nextStatus = "present";
            else if (currentStatus === "present") nextStatus = "late";
            else if (currentStatus === "late") nextStatus = "absent";
            else nextStatus = "";

            if (nextStatus) {
                calendar[day] = nextStatus;
            } else {
                delete calendar[day];
            }

            // Recalculate counts
            recalculateAttendanceCounters();
            renderAttendanceCalendar();
        });

        grid.appendChild(cell);
    }
}

function recalculateAttendanceCounters() {
    const calendar = selectedStudent.attendance.calendar || {};
    let present = 0;
    let absent = 0;
    let late = 0;

    Object.keys(calendar).forEach(day => {
        if (calendar[day] === 'present') present++;
        else if (calendar[day] === 'absent') absent++;
        else if (calendar[day] === 'late') late++;
    });

    // Base math: rate = (present + late * 0.5) / (present + absent + late)
    const totalRecorded = present + absent + late;
    let rate = 0;
    if (totalRecorded > 0) {
        rate = Math.round(((present + (late * 0.5)) / totalRecorded) * 100);
    }

    // Adjust global student copy
    selectedStudent.attendance.present = present;
    selectedStudent.attendance.absent = absent;
    selectedStudent.attendance.late = late;
    selectedStudent.attendance.rate = rate;

    // Display counts in input boxes
    document.getElementById("edit-attend-present").value = present;
    document.getElementById("edit-attend-absent").value = absent;
    document.getElementById("edit-attend-late").value = late;
    document.getElementById("edit-attend-rate-lbl").innerText = `${rate}%`;
}

// Manual inputs handlers for attendance counters
document.querySelectorAll(".compact-input").forEach(input => {
    input.addEventListener("input", () => {
        const present = parseInt(document.getElementById("edit-attend-present").value) || 0;
        const absent = parseInt(document.getElementById("edit-attend-absent").value) || 0;
        const late = parseInt(document.getElementById("edit-attend-late").value) || 0;

        const total = present + absent + late;
        const rate = total > 0 ? Math.round(((present + (late * 0.5)) / total) * 100) : 0;
        
        document.getElementById("edit-attend-rate-lbl").innerText = `${rate}%`;
        selectedStudent.attendance.rate = rate;
    });
});

// 3. Fees Tab Tables & Dynamic Rows

// A. Installments Render
function renderInstallmentsList() {
    const container = document.getElementById("edit-installments-list");
    container.innerHTML = "";

    const insts = selectedStudent.fees.installments || [];

    if (insts.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">No installments configured.</div>`;
        return;
    }

    insts.forEach((inst, idx) => {
        const row = document.createElement("div");
        row.className = "installment-editor-row";
        row.innerHTML = `
            <input type="text" class="form-input inst-title" value="${inst.title}" placeholder="Label (e.g. 1st installment)" style="flex: 2;">
            <input type="number" class="form-input inst-amount" value="${inst.amount}" placeholder="Amount $" style="width: 100px;">
            <input type="text" class="form-input inst-date" value="${inst.dueDate || ''}" placeholder="Due Date (YYYY-MM-DD)" style="width: 140px;">
            <select class="form-input inst-status" style="width: 120px;">
                <option value="pending" ${inst.status === 'pending'?'selected':''}>Pending</option>
                <option value="partial" ${inst.status === 'partial'?'selected':''}>Partial</option>
                <option value="paid" ${inst.status === 'paid'?'selected':''}>Paid</option>
            </select>
            <button class="icon-btn-action delete-inst-row-btn" data-index="${idx}" title="Delete Installment" style="background: var(--danger-glow); color: var(--danger);">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    // Delete installment trigger
    container.querySelectorAll(".delete-inst-row-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(btn.dataset.index);
            selectedStudent.fees.installments.splice(idx, 1);
            renderInstallmentsList();
        });
    });
}

document.getElementById("add-installment-btn").onclick = () => {
    if (!selectedStudent.fees.installments) selectedStudent.fees.installments = [];
    const nextId = selectedStudent.fees.installments.length + 1;
    selectedStudent.fees.installments.push({
        id: nextId,
        title: `${nextId}th Installment`,
        amount: 0,
        dueDate: new Date().toISOString().split('T')[0],
        status: "pending"
    });
    renderInstallmentsList();
};

// B. Breakdown Items
function renderBreakdownList() {
    const container = document.getElementById("edit-breakdown-list");
    container.innerHTML = "";

    const items = selectedStudent.fees.breakdown || [];

    if (items.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); font-style: italic;">No invoice items configured.</div>`;
        return;
    }

    items.forEach((item, idx) => {
        const row = document.createElement("div");
        row.className = "installment-editor-row";
        row.innerHTML = `
            <input type="text" class="form-input bkd-item" value="${item.item}" placeholder="Fee Component (e.g Tuition)" style="flex: 2;">
            <input type="number" class="form-input bkd-amount" value="${item.amount}" placeholder="Amount $" style="width: 100px;">
            <select class="form-input bkd-status" style="width: 120px;">
                <option value="pending" ${item.status === 'pending'?'selected':''}>Pending</option>
                <option value="partial" ${item.status === 'partial'?'selected':''}>Partial</option>
                <option value="paid" ${item.status === 'paid'?'selected':''}>Paid</option>
            </select>
            <button class="icon-btn-action delete-bkd-row-btn" data-index="${idx}" title="Delete Item" style="background: var(--danger-glow); color: var(--danger);">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });

    container.querySelectorAll(".delete-bkd-row-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index);
            selectedStudent.fees.breakdown.splice(idx, 1);
            renderBreakdownList();
        });
    });
}

document.getElementById("add-breakdown-btn").onclick = () => {
    if (!selectedStudent.fees.breakdown) selectedStudent.fees.breakdown = [];
    selectedStudent.fees.breakdown.push({
        item: "Supplementary Fee",
        amount: 0,
        status: "pending"
    });
    renderBreakdownList();
};

// C. Transactions Log
function renderTransactionsTable() {
    const tbody = document.getElementById("edit-transactions-body");
    tbody.innerHTML = "";

    const txns = selectedStudent.fees.transactions || [];

    if (txns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color: var(--text-muted); padding: 20px;">No transactions logged</td></tr>`;
        return;
    }

    txns.forEach((txn, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${txn.id}</strong></td>
            <td>${txn.date}</td>
            <td><span class="text-success">$${txn.amount}</span></td>
            <td>${txn.method}</td>
            <td><span class="status-badge paid">${txn.status}</span></td>
            <td>
                <button class="icon-btn-action delete-txn-btn" data-index="${idx}" style="background: var(--danger-glow); color: var(--danger); padding: 4px 8px; font-size: 0.8rem;">
                    Delete Log
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Delete transaction log
    tbody.querySelectorAll(".delete-txn-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index);
            selectedStudent.fees.transactions.splice(idx, 1);
            renderTransactionsTable();
        });
    });
}

// ---------------- CREATE / DELETE STUDENT MODAL ----------------

function setupStudentModal() {
    const modal = document.getElementById("add-student-modal");
    const openBtn = document.getElementById("add-student-btn");
    const closeBtn = document.getElementById("close-modal-btn");
    const cancelBtn = document.getElementById("cancel-create-btn");
    const form = document.getElementById("create-student-form");

    const toggleModal = (show) => {
        if (show) modal.classList.remove("hidden");
        else modal.classList.add("hidden");
        form.reset();
    };

    openBtn.onclick = () => toggleModal(true);
    closeBtn.onclick = () => toggleModal(false);
    cancelBtn.onclick = () => toggleModal(false);

    form.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById("create-name").value.trim();
        const username = document.getElementById("create-username").value.trim().toLowerCase();
        const password = document.getElementById("create-password").value;
        const id = document.getElementById("create-id").value.trim() || null;
        const grade = document.getElementById("create-grade").value.trim() || null;

        const payload = {
            username,
            password,
            profile: { name, id, grade }
        };

        try {
            const res = await fetch(`${API_BASE}/admin/student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                showToast("Registration Completed", `Student ${name} was registered!`, "success");
                toggleModal(false);
                
                // Refresh registry and select the new user
                await loadStudentsRegistry();
                selectStudent(username);
            } else {
                alert(data.error || "Unable to create student.");
            }
        } catch (err) {
            alert("Network connection error. Database not synced.");
        }
    };
}

// Delete student action
document.getElementById("delete-student-btn").onclick = async () => {
    if (!selectedStudent) return;
    const name = selectedStudent.profile.name;
    const conf = confirm(`Are you sure you want to permanently delete the record for student: ${name}? All grades, attendance, and fee files will be erased.`);
    if (!conf) return;

    try {
        const res = await fetch(`${API_BASE}/admin/student/${selectedStudent.username}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showToast("Record Deleted", `Successfully removed ${name} from registry.`, "info");
            selectedStudent = null;
            document.getElementById("workspace-placeholder").classList.remove("hidden");
            document.getElementById("workspace-editor").classList.add("hidden");
            loadStudentsRegistry();
        } else {
            showToast("Erase Failed", "Could not delete student record.", "error");
        }
    } catch (err) {
        showToast("Error", "Network connection lost.", "error");
    }
};

// ---------------- SAVE STUDENT CHANGES ----------------

document.getElementById("save-student-btn").onclick = async () => {
    if (!selectedStudent) return;

    const saveButton = document.getElementById("save-student-btn");
    saveButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Saving...`;
    saveButton.disabled = true;

    // 1. Extract Profile Info inputs
    selectedStudent.profile.name = document.getElementById("edit-profile-name").value.trim();
    selectedStudent.profile.id = document.getElementById("edit-profile-id").value.trim();
    selectedStudent.profile.grade = document.getElementById("edit-profile-grade").value.trim();
    selectedStudent.profile.email = document.getElementById("edit-profile-email").value.trim();
    selectedStudent.profile.phone = document.getElementById("edit-profile-phone").value.trim();
    selectedStudent.profile.joinedDate = document.getElementById("edit-profile-joined").value.trim();
    selectedStudent.profile.avatar = document.getElementById("edit-profile-avatar").value.trim() || 
                                     selectedStudent.profile.name.split(' ').map(n=>n[0]).join('').toUpperCase();

    // Extract password directly from credentials card
    selectedStudent.password = document.getElementById("edit-profile-password").value.trim() || selectedStudent.password;

    // 2. Extract Performance inputs
    selectedStudent.performance.gpa = document.getElementById("edit-perf-gpa").value.trim();
    selectedStudent.performance.totalTests = parseInt(document.getElementById("edit-perf-tests").value) || 0;

    const subjectRows = document.querySelectorAll(".subject-editor-row");
    const subjects = [];
    subjectRows.forEach(row => {
        const name = row.querySelector(".subj-name").value.trim();
        const score = parseInt(row.querySelector(".subj-score").value) || 0;
        const color = row.querySelector(".subj-color").value;
        if (name) {
            subjects.push({ name, score, color });
        }
    });
    selectedStudent.performance.subjects = subjects;

    // 3. Extract Attendance counters (Calendar is already updated directly in state)
    selectedStudent.attendance.present = parseInt(document.getElementById("edit-attend-present").value) || 0;
    selectedStudent.attendance.absent = parseInt(document.getElementById("edit-attend-absent").value) || 0;
    selectedStudent.attendance.late = parseInt(document.getElementById("edit-attend-late").value) || 0;

    // 4. Extract Fees
    selectedStudent.fees.total = parseFloat(document.getElementById("edit-fee-total").value) || 0;
    selectedStudent.fees.paid = parseFloat(document.getElementById("edit-fee-paid").value) || 0;
    selectedStudent.fees.pending = parseFloat(document.getElementById("edit-fee-pending").value) || 0;
    selectedStudent.fees.activeScheme = document.getElementById("edit-fee-scheme").value;

    // Installments rows
    const instRows = document.querySelectorAll("#edit-installments-list .installment-editor-row");
    const installments = [];
    instRows.forEach((row, index) => {
        const title = row.querySelector(".inst-title").value.trim();
        const amount = parseFloat(row.querySelector(".inst-amount").value) || 0;
        const dueDate = row.querySelector(".inst-date").value.trim();
        const status = row.querySelector(".inst-status").value;
        installments.push({
            id: index + 1,
            title,
            amount,
            dueDate,
            status
        });
    });
    selectedStudent.fees.installments = installments;

    // Breakdown rows
    const bkdRows = document.querySelectorAll("#edit-breakdown-list .installment-editor-row");
    const breakdown = [];
    bkdRows.forEach(row => {
        const item = row.querySelector(".bkd-item").value.trim();
        const amount = parseFloat(row.querySelector(".bkd-amount").value) || 0;
        const status = row.querySelector(".bkd-status").value;
        if (item) {
            breakdown.push({ item, amount, status });
        }
    });
    selectedStudent.fees.breakdown = breakdown;

    // Send payload to API
    try {
        const res = await fetch(`${API_BASE}/admin/student/${selectedStudent.username}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(selectedStudent)
        });

        if (res.ok) {
            showToast("Database Synced", `Successfully updated ${selectedStudent.profile.name}'s records.`, "success");
            saveButton.innerHTML = `<i class="fas fa-save"></i> Save Changes`;
            saveButton.disabled = false;
            
            // Reload list and update UI
            loadStudentsRegistry();
            renderStudentEditor();
        } else {
            showToast("Sync Failure", "Failed to update record on backend database.", "error");
            saveButton.innerHTML = `<i class="fas fa-save"></i> Save Changes`;
            saveButton.disabled = false;
        }
    } catch (err) {
        showToast("Error", "Server offline. Save cancelled.", "error");
        saveButton.innerHTML = `<i class="fas fa-save"></i> Save Changes`;
        saveButton.disabled = false;
    }
};

// ---------------- SYSTEM UTILITIES ----------------

// Toaster Notification Helper
function showToast(title, message, type = 'info') {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;

    let icon = "info-circle";
    if (type === 'success') icon = "check-circle";
    else if (type === 'error') icon = "exclamation-triangle";

    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <div class="toast-content">
            <h4 class="toast-title">${title}</h4>
            <p class="toast-desc">${message}</p>
        </div>
    `;

    container.appendChild(toast);
    
    // Add entering animation class
    setTimeout(() => toast.style.transform = "translateX(0)", 10);

    // Self-destruct after 4 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
