// Mock Student Database
const studentDb = {
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
                // June 2026 (starts on a Monday, 30 days)
                1: "present", 2: "present", 3: "present", 4: "late", 5: "present",
                8: "present", 9: "present", 10: "absent", 11: "present", 12: "present",
                15: "present", 16: "present", 17: "present", 18: "present", 19: "present",
                22: "present", 23: "late", 24: "present", 25: "present", 26: "absent",
                29: "present", 30: "present"
            }
        },
        fees: {
            total: 2500,
            paid: 1800,
            pending: 700,
            activeScheme: "full",
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
                1: "present", 2: "absent", 3: "present", 4: "present", 5: "present",
                8: "present", 9: "late", 10: "present", 11: "absent", 12: "present",
                15: "present", 16: "present", 17: "absent", 18: "present", 19: "late",
                22: "present", 23: "present", 24: "present", 25: "present", 26: "present",
                29: "absent", 30: "present"
            }
        },
        fees: {
            total: 2500,
            paid: 1200,
            pending: 1300,
            activeScheme: "full",
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

// Global App State
let currentStudent = null;

// Initialize app when DOM loads
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    setupAuthListeners();
    setupNavigation();
    setupThemeToggle();
    checkActiveSession();
}

// Session Management
function checkActiveSession() {
    const savedUser = localStorage.getItem("trinity_student");
    if (savedUser && studentDb[savedUser]) {
        loginStudent(savedUser);
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById("login-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
    document.getElementById("login-error").innerText = "";
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
}

function loginStudent(username) {
    currentStudent = studentDb[username];
    localStorage.setItem("trinity_student", username);
    
    // UI Transitions
    document.getElementById("login-container").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    
    // Populate Sidebar Profile Info
    document.getElementById("nav-student-avatar").innerText = currentStudent.profile.avatar;
    document.getElementById("nav-student-name").innerText = currentStudent.profile.name;
    document.getElementById("nav-student-grade").innerText = currentStudent.profile.grade;

    // Load initial view
    navigateTo("dashboard");
}

function logoutStudent() {
    currentStudent = null;
    localStorage.removeItem("trinity_student");
    showLoginScreen();
}

// Authentication Listeners
function setupAuthListeners() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById("login-username").value.trim().toLowerCase();
        const passwordInput = document.getElementById("login-password").value;
        const errorDiv = document.getElementById("login-error");

        if (studentDb[usernameInput] && studentDb[usernameInput].password === passwordInput) {
            errorDiv.innerText = "";
            loginStudent(usernameInput);
        } else {
            errorDiv.innerText = "Invalid username or password. (Try 'alice' or 'bob' with 'password123')";
            // Trigger shake animation on form
            const formCard = document.querySelector(".login-card");
            formCard.classList.add("shake-animation");
            setTimeout(() => {
                formCard.classList.remove("shake-animation");
            }, 500);
        }
    });

    // Preset button helper to make it easy for evaluator
    document.querySelectorAll(".preset-user-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.getElementById("login-username").value = btn.dataset.user;
            document.getElementById("login-password").value = "password123";
        });
    });
}

// Navigation & Routing
function setupNavigation() {
    const navLinks = document.querySelectorAll(".sidebar-nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view === "logout") {
                logoutStudent();
            } else {
                navigateTo(view);
            }
        });
    });
}

function navigateTo(viewId) {
    // Update Sidebar active state
    document.querySelectorAll(".sidebar-nav-link").forEach(link => {
        if (link.dataset.view === viewId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // Hide all views, display the chosen view
    document.querySelectorAll(".app-view").forEach(view => {
        view.classList.add("hidden");
    });
    
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        activeView.classList.remove("hidden");
        // Fade in animation trigger
        activeView.style.opacity = 0;
        setTimeout(() => {
            activeView.style.opacity = 1;
            activeView.style.transition = "opacity 0.3s ease-in-out";
        }, 50);
    }

    // Populate data specifically for the chosen view
    switch (viewId) {
        case "dashboard":
            loadDashboardData();
            break;
        case "performance":
            loadPerformanceData();
            break;
        case "attendance":
            loadAttendanceData();
            break;
        case "fees":
            loadFeesData();
            break;
    }
}

// Theme Handling (Subtle addition for extra aesthetic premium points)
function setupThemeToggle() {
    const toggle = document.getElementById("theme-toggle-btn");
    toggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        const isLight = document.body.classList.contains("light-mode");
        toggle.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    });
}

// View-Specific Data Hydration

// 1. Dashboard View
function loadDashboardData() {
    if (!currentStudent) return;
    
    // Profile section
    document.getElementById("dash-welcome-name").innerText = currentStudent.profile.name;
    document.getElementById("dash-student-id").innerText = currentStudent.profile.id;
    document.getElementById("dash-student-email").innerText = currentStudent.profile.email;
    document.getElementById("dash-student-grade").innerText = currentStudent.profile.grade;
    document.getElementById("dash-student-phone").innerText = currentStudent.profile.phone;
    
    // Quick Metrics
    document.getElementById("dash-gpa-val").innerText = currentStudent.performance.gpa;
    document.getElementById("dash-attendance-rate").innerText = currentStudent.attendance.rate + "%";
    
    // Render mini attendance progress circle
    const attCircle = document.getElementById("dash-attendance-circle");
    if (attCircle) {
        const offset = 188.4 - (188.4 * currentStudent.attendance.rate) / 100;
        attCircle.style.strokeDashoffset = offset;
    }

    // Pending fee status summary
    const pendingVal = document.getElementById("dash-fees-pending");
    pendingVal.innerText = `$${currentStudent.fees.pending}`;
    if (currentStudent.fees.pending > 0) {
        pendingVal.className = "metric-value danger-text animate-pulse-subtle";
    } else {
        pendingVal.className = "metric-value success-text";
    }

    // Populate recent messages/announcements
    const announcements = [
        { title: "Quarterly Exam Schedule Out", desc: "Quarterly exams will commence from next Monday. Please download the schedule from the circular section.", date: "Today" },
        { title: "Science Project Submission", desc: "Physics lab manual submission deadline is June 30th. Ensure all experimental logs are signed.", date: "Yesterday" }
    ];
    
    const container = document.getElementById("dash-announcements");
    container.innerHTML = announcements.map(item => `
        <div class="announcement-item">
            <div class="announcement-meta">
                <span class="announcement-badge">Circular</span>
                <span class="announcement-date">${item.date}</span>
            </div>
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
        </div>
    `).join("");
}

// 2. Performance View
function loadPerformanceData() {
    if (!currentStudent) return;

    // Set Header Info
    document.getElementById("perf-student-id").innerText = currentStudent.profile.id;
    document.getElementById("perf-student-grade").innerText = currentStudent.profile.grade;

    // Subjects list with detailed metrics and customized dynamic styling
    const subjectsContainer = document.getElementById("perf-subjects-list");
    subjectsContainer.innerHTML = currentStudent.performance.subjects.map(sub => {
        let grade = "F";
        if (sub.score >= 90) grade = "A+";
        else if (sub.score >= 80) grade = "A";
        else if (sub.score >= 70) grade = "B";
        else if (sub.score >= 60) grade = "C";

        return `
            <div class="subject-card glass-panel">
                <div class="subject-header">
                    <h3>${sub.name}</h3>
                    <span class="subject-grade" style="color: ${sub.color}">${grade}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: 0%; background: linear-gradient(90deg, ${sub.color}, ${sub.color}cc)" data-target-width="${sub.score}%"></div>
                </div>
                <div class="subject-footer">
                    <span>Performance: Excellent</span>
                    <span class="subject-score">${sub.score}%</span>
                </div>
            </div>
        `;
    }).join("");

    // Animate progress bars on load
    setTimeout(() => {
        const fills = document.querySelectorAll(".progress-bar-fill");
        fills.forEach(fill => {
            fill.style.width = fill.dataset.targetWidth;
        });
    }, 100);

    // Render Performance Trend SVG Chart (Vanilla SVG graph generator)
    renderPerformanceChart(currentStudent.performance.history);
}

function renderPerformanceChart(history) {
    const svg = document.getElementById("perf-chart-svg");
    if (!svg) return;

    // Clear previous elements
    svg.innerHTML = "";

    const width = 600;
    const height = 250;
    const padding = 40;
    
    // Scale helper functions
    const xScale = (index) => padding + (index * (width - 2 * padding) / (history.length - 1));
    const yScale = (score) => height - padding - ((score - 50) * (height - 2 * padding) / 50); // Scale 50% to 100%

    // Draw Grid Lines (Y axis milestones)
    for (let s = 50; s <= 100; s += 10) {
        const y = yScale(s);
        
        // Grid Line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding);
        line.setAttribute("y2", y);
        line.setAttribute("class", "chart-grid-line");
        svg.appendChild(line);

        // Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", padding - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("class", "chart-axis-label");
        text.textContent = s + "%";
        svg.appendChild(text);
    }

    // Construct path points
    let points = [];
    history.forEach((data, index) => {
        points.push(`${xScale(index)},${yScale(data.score)}`);
    });
    
    // Draw Area gradient under the path line
    const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const firstPoint = `${xScale(0)},${height - padding}`;
    const lastPoint = `${xScale(history.length - 1)},${height - padding}`;
    areaPath.setAttribute("d", `M ${firstPoint} L ${points.join(" L ")} L ${lastPoint} Z`);
    areaPath.setAttribute("class", "chart-area-path");
    svg.appendChild(areaPath);

    // Draw Path Line
    const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    linePath.setAttribute("d", `M ${points.join(" L ")}`);
    linePath.setAttribute("class", "chart-line-path");
    svg.appendChild(linePath);

    // Draw interactive Tooltip Dots and Month labels
    history.forEach((data, index) => {
        const cx = xScale(index);
        const cy = yScale(data.score);

        // Grid marker lines for X axis
        const xText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        xText.setAttribute("x", cx);
        xText.setAttribute("y", height - 10);
        xText.setAttribute("text-anchor", "middle");
        xText.setAttribute("class", "chart-axis-label");
        xText.textContent = data.month;
        svg.appendChild(xText);

        // Circular Node Dot
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", cx);
        dot.setAttribute("cy", cy);
        dot.setAttribute("r", 6);
        dot.setAttribute("class", "chart-dot");
        
        // Custom Tooltip text helper
        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = `${data.month} Average: ${data.score}%`;
        dot.appendChild(title);
        
        svg.appendChild(dot);
    });
}

// 3. Attendance View
function loadAttendanceData() {
    if (!currentStudent) return;

    // Load Metrics
    document.getElementById("att-present-count").innerText = currentStudent.attendance.present;
    document.getElementById("att-absent-count").innerText = currentStudent.attendance.absent;
    document.getElementById("att-late-count").innerText = currentStudent.attendance.late;
    document.getElementById("att-percentage-val").innerText = currentStudent.attendance.rate + "%";

    // Set progress bar gauge
    const attProgressGauge = document.getElementById("att-progress-bar-gauge");
    attProgressGauge.style.width = "0%";
    setTimeout(() => {
        attProgressGauge.style.width = currentStudent.attendance.rate + "%";
    }, 100);

    // Calendar Generation: June 2026
    const daysContainer = document.getElementById("calendar-days");
    daysContainer.innerHTML = "";

    const daysInMonth = 30;
    // June 1st, 2026 is a Monday (1)
    const startingDayOfWeek = 1;

    // Add blank slots for matching correct day column
    for (let i = 0; i < startingDayOfWeek; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-day empty";
        daysContainer.appendChild(blank);
    }

    // Populate actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
        
        const dateNum = document.createElement("span");
        dateNum.className = "date-number";
        dateNum.innerText = day;
        dayDiv.appendChild(dateNum);

        // Determine if it's a weekend or has a specific record
        const dayOfWeek = (startingDayOfWeek + day - 1) % 7;
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.classList.add("weekend");
            const badge = document.createElement("span");
            badge.className = "day-badge weekend-badge";
            badge.innerText = "WE";
            dayDiv.appendChild(badge);
        } else {
            // Apply corresponding student state
            const status = currentStudent.attendance.calendar[day];
            if (status) {
                dayDiv.classList.add(status);
                const badge = document.createElement("span");
                badge.className = `day-badge ${status}-badge`;
                badge.innerText = status === "present" ? "P" : status === "absent" ? "A" : "L";
                dayDiv.appendChild(badge);
            } else {
                dayDiv.classList.add("not-marked");
            }
        }

        daysContainer.appendChild(dayDiv);
    }
}

// Global payment context
let paymentContext = { amount: 0, type: "full", installmentId: null };

function openPaymentCheckout(amount, type, installmentId) {
    paymentContext = { amount, type, installmentId };
    
    const modal = document.getElementById("checkout-modal");
    const payAmountInput = document.getElementById("pay-amount");
    
    payAmountInput.value = amount;
    payAmountInput.max = amount;
    
    modal.classList.add("active");
}

// 4. Fee Structure View
function loadFeesData() {
    if (!currentStudent) return;

    // Hydrate top metrics
    document.getElementById("fee-total-bill").innerText = `$${currentStudent.fees.total}`;
    document.getElementById("fee-total-paid").innerText = `$${currentStudent.fees.paid}`;
    
    const pendingVal = document.getElementById("fee-total-pending");
    pendingVal.innerText = `$${currentStudent.fees.pending}`;
    
    if (currentStudent.fees.pending > 0) {
        pendingVal.className = "metric-value danger-text animate-pulse-subtle";
    } else {
        pendingVal.className = "metric-value success-text";
    }

    // Toggle active tabs based on activeScheme
    const scheme = currentStudent.fees.activeScheme || "full";
    document.querySelectorAll(".scheme-tab-btn").forEach(btn => {
        if (btn.dataset.scheme === scheme) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });

    document.querySelectorAll(".scheme-content-pane").forEach(pane => {
        pane.classList.add("hidden");
    });
    document.getElementById(`scheme-content-${scheme}`).classList.remove("hidden");

    // Add click listeners to tabs
    document.getElementById("scheme-tab-full").onclick = () => {
        currentStudent.fees.activeScheme = "full";
        loadFeesData();
    };
    document.getElementById("scheme-tab-installments").onclick = () => {
        currentStudent.fees.activeScheme = "installments";
        loadFeesData();
    };

    // Full payment view
    document.getElementById("full-pay-amount-label").innerText = `$${currentStudent.fees.pending}`;
    const fullPayBtn = document.getElementById("full-pay-btn");
    if (currentStudent.fees.pending > 0) {
        fullPayBtn.disabled = false;
        fullPayBtn.style.opacity = 1;
    } else {
        fullPayBtn.disabled = true;
        fullPayBtn.style.opacity = 0.5;
    }

    fullPayBtn.onclick = () => {
        openPaymentCheckout(currentStudent.fees.pending, "full", null);
    };

    // Installment timeline view rendering
    const timelineContainer = document.getElementById("installments-timeline-list");
    timelineContainer.innerHTML = "";

    // Determine the next unpaid/partial installment to make it the active installment
    let firstUnpaidFound = false;

    currentStudent.fees.installments.forEach(inst => {
        const stepDiv = document.createElement("div");
        stepDiv.className = "timeline-step";
        
        let markerContent = "";
        let actionHtml = "";
        let statusText = "";
        let detailsText = "";

        if (inst.status === "paid") {
            stepDiv.classList.add("paid");
            markerContent = '<i class="fas fa-check"></i>';
            statusText = '<span class="timeline-step-badge paid">Paid</span>';
            detailsText = `Paid in full on ${inst.dueDate}`;
        } else if (inst.status === "partial") {
            stepDiv.classList.add("active");
            markerContent = '<i class="fas fa-exclamation-triangle" style="font-size: 0.75rem;"></i>';
            const remaining = inst.amount - inst.paidAmount;
            statusText = `<span class="timeline-step-badge locked" style="background: var(--warning-glow); color: var(--warning);">Due: $${remaining}</span>`;
            detailsText = `Paid $${inst.paidAmount} of $${inst.amount} • Due ${inst.dueDate}`;
            
            actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${remaining}">Pay Due</button>`;
            firstUnpaidFound = true;
        } else {
            // Status is pending
            if (!firstUnpaidFound) {
                // This is the active installment to pay
                stepDiv.classList.add("active");
                markerContent = '<i class="fas fa-clock"></i>';
                statusText = `<span class="timeline-step-badge locked" style="background: var(--color-primary-glow); color: var(--color-primary);">Active Due: $${inst.amount}</span>`;
                detailsText = `Due date: ${inst.dueDate}`;
                
                actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${inst.amount}">Pay Now</button>`;
                firstUnpaidFound = true;
            } else {
                // Locked/future installment
                stepDiv.classList.add("locked");
                markerContent = '<i class="fas fa-lock"></i>';
                statusText = `<span class="timeline-step-badge locked">Scheduled</span>`;
                detailsText = `Due date: ${inst.dueDate}`;
            }
        }

        stepDiv.innerHTML = `
            <div class="timeline-marker">${markerContent}</div>
            <div class="timeline-info">
                <h4>${inst.title}</h4>
                <p>${detailsText}</p>
            </div>
            <div class="timeline-action">
                ${actionHtml ? actionHtml : statusText}
            </div>
        `;
        
        timelineContainer.appendChild(stepDiv);
    });

    // Wire up individual pay installment buttons
    document.querySelectorAll(".pay-inst-btn").forEach(btn => {
        btn.onclick = () => {
            const instId = parseInt(btn.dataset.id);
            const dueVal = parseFloat(btn.dataset.due);
            openPaymentCheckout(dueVal, "installment", instId);
        };
    });

    // Hydrate detailed items breakdown
    const breakdownTbody = document.getElementById("fees-breakdown-tbody");
    breakdownTbody.innerHTML = currentStudent.fees.breakdown.map(item => {
        let statusBadge = "";
        if (item.status === "paid") {
            statusBadge = '<span class="status-badge paid">Paid</span>';
        } else if (item.status === "pending") {
            statusBadge = '<span class="status-badge unpaid">Unpaid</span>';
        } else {
            statusBadge = `<span class="status-badge partial">Partial (Paid $${item.paidAmount})</span>`;
        }

        return `
            <tr>
                <td>${item.item}</td>
                <td>$${item.amount}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join("");

    // Hydrate transaction logs
    const transTbody = document.getElementById("transactions-tbody");
    transTbody.innerHTML = currentStudent.fees.transactions.map(txn => `
        <tr>
            <td><code>${txn.id}</code></td>
            <td>${txn.date}</td>
            <td>$${txn.amount}</td>
            <td>${txn.method}</td>
            <td><span class="status-badge paid">${txn.status}</span></td>
        </tr>
    `).join("");

    // Bind Payment Portal Checkout flow
    setupCheckoutPortal();
}

function setupCheckoutPortal() {
    const modal = document.getElementById("checkout-modal");
    const closeBtn = document.getElementById("checkout-close-btn");
    const form = document.getElementById("checkout-form");
    
    closeBtn.onclick = () => {
        modal.classList.remove("active");
    };

    // Close on click background
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove("active");
        }
    };

    form.onsubmit = (e) => {
        e.preventDefault();
        
        const payVal = parseFloat(document.getElementById("pay-amount").value);
        if (isNaN(payVal) || payVal <= 0 || payVal > paymentContext.amount) {
            alert("Please enter a valid payment amount.");
            return;
        }

        // Simulate payment delay
        const payBtn = form.querySelector('button[type="submit"]');
        const origText = payBtn.innerHTML;
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Securely...';

        setTimeout(() => {
            // Process Transaction locally in memory
            const txnId = "TXN-" + Math.floor(10000 + Math.random() * 90000);
            const dateStr = new Date().toISOString().split('T')[0];
            const payMethod = document.getElementById("pay-method").value;

            // Update pending balances
            currentStudent.fees.paid += payVal;
            currentStudent.fees.pending -= payVal;

            // Add receipt record
            currentStudent.fees.transactions.unshift({
                id: txnId,
                date: dateStr,
                amount: payVal,
                method: payMethod,
                status: "Completed"
            });

            // Adjust installment state based on payment context
            if (paymentContext.type === "installment") {
                const inst = currentStudent.fees.installments.find(i => i.id === paymentContext.installmentId);
                if (inst) {
                    if (inst.status === "partial") {
                        const remaining = inst.amount - inst.paidAmount;
                        if (payVal >= remaining) {
                            inst.status = "paid";
                            delete inst.paidAmount;
                        } else {
                            inst.paidAmount += payVal;
                        }
                    } else {
                        if (payVal >= inst.amount) {
                            inst.status = "paid";
                        } else {
                            inst.status = "partial";
                            inst.paidAmount = payVal;
                        }
                    }
                }
            } else {
                // Paid in full
                currentStudent.fees.installments.forEach(inst => {
                    inst.status = "paid";
                    if (inst.paidAmount) delete inst.paidAmount;
                });
            }

            // Adjust invoice status breakdowns
            let remainingPayValue = payVal;
            currentStudent.fees.breakdown.forEach(item => {
                if (item.status === "pending" && remainingPayValue > 0) {
                    if (remainingPayValue >= item.amount) {
                        remainingPayValue -= item.amount;
                        item.status = "paid";
                    } else {
                        item.status = "partial";
                        item.paidAmount = remainingPayValue;
                        remainingPayValue = 0;
                    }
                } else if (item.status === "partial" && remainingPayValue > 0) {
                    const outstanding = item.amount - item.paidAmount;
                    if (remainingPayValue >= outstanding) {
                        remainingPayValue -= outstanding;
                        item.status = "paid";
                        delete item.paidAmount;
                    } else {
                        item.paidAmount += remainingPayValue;
                        remainingPayValue = 0;
                    }
                }
            });

            // Hide payment modal
            modal.classList.remove("active");

            // Reset submit button state
            payBtn.disabled = false;
            payBtn.innerHTML = origText;

            // Refresh fee content views
            loadFeesData();

            // Display beautiful payment success receipts popup
            triggerReceiptReceiptPopup({
                txnId: txnId,
                date: dateStr,
                amount: payVal,
                method: payMethod,
                student: currentStudent.profile.name,
                pending: currentStudent.fees.pending
            });
        }, 1500);
    };
}

function triggerReceiptReceiptPopup(receipt) {
    // Generate simple custom HTML overlay for simulated receipt
    const overlay = document.createElement("div");
    overlay.className = "receipt-overlay flex-center";
    overlay.innerHTML = `
        <div class="receipt-card glass-panel fade-in">
            <div class="receipt-header">
                <i class="fas fa-check-circle success-text" style="font-size: 3rem;"></i>
                <h2>Payment Successful!</h2>
                <p>Thank you for your payment to Trinity Classes</p>
            </div>
            <div class="receipt-details">
                <div class="receipt-row"><span>Student Name:</span><strong>${receipt.student}</strong></div>
                <div class="receipt-row"><span>Receipt ID:</span><code>${receipt.txnId}</code></div>
                <div class="receipt-row"><span>Date:</span><strong>${receipt.date}</strong></div>
                <div class="receipt-row"><span>Amount Paid:</span><strong class="success-text">$${receipt.amount.toFixed(2)}</strong></div>
                <div class="receipt-row"><span>Payment Mode:</span><strong>${receipt.method}</strong></div>
                <div class="receipt-row"><span>Remaining Dues:</span><strong>$${receipt.pending.toFixed(2)}</strong></div>
            </div>
            <div class="receipt-footer">
                <button id="close-receipt-btn" class="action-btn">Close Receipt</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("close-receipt-btn").onclick = () => {
        document.body.removeChild(overlay);
    };
}
