// Global App State
let currentStudent = null;
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:')
    ? 'http://localhost:8000/api'
    : 'https://trinity-classes-portal-1.onrender.com/api';

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
async function checkActiveSession() {
    const savedUser = localStorage.getItem("trinity_student");
    if (savedUser) {
        const loaded = await loadStudentData(savedUser);
        if (loaded) {
            loginStudent(savedUser);
        } else {
            showLoginScreen();
        }
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

// Fetch dynamic student data from API
async function loadStudentData(username) {
    try {
        const res = await fetch(`${API_BASE}/student/${username}`);
        if (res.ok) {
            currentStudent = await res.json();
            return true;
        } else {
            console.error("Failed to load student data from API");
            return false;
        }
    } catch (err) {
        console.error("Connection error while loading student data", err);
        return false;
    }
}

// Authentication Listeners
function setupAuthListeners() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const usernameInput = document.getElementById("login-username").value.trim();
        const passwordInput = document.getElementById("login-password").value;
        const errorDiv = document.getElementById("login-error");

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: usernameInput, password: passwordInput })
            });

            const data = await res.json();
            if (res.ok) {
                errorDiv.innerText = "";
                // Load details and log in
                const loaded = await loadStudentData(usernameInput);
                if (loaded) {
                    loginStudent(usernameInput);
                } else {
                    errorDiv.innerText = "Error reading student database file.";
                }
            } else {
                errorDiv.innerText = data.error || "Invalid username or password.";
                // Trigger shake animation on form
                const formCard = document.querySelector(".login-card");
                formCard.classList.add("shake-animation");
                setTimeout(() => {
                    formCard.classList.remove("shake-animation");
                }, 500);
            }
        } catch (err) {
            errorDiv.innerText = "Connection error. Make sure server is running.";
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
        link.addEventListener("click", async (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            if (view === "logout") {
                logoutStudent();
            } else {
                // Fetch fresh updates on each view change
                if (currentStudent) {
                    await loadStudentData(currentStudent.username);
                }
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

// Theme Handling
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
    document.getElementById("dash-student-phone").innerText = currentStudent.profile.phone || "+1 (555) 000-0000";
    
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

    // Populate announcements
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

    // Subjects list with detailed metrics and dynamic grading
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
                    <span>Performance: ${sub.score >= 60 ? 'Satisfactory' : 'Needs Focus'}</span>
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

    // Render Performance Trend SVG Chart
    renderPerformanceChart(currentStudent.performance.history);
}

function renderPerformanceChart(history) {
    const svg = document.getElementById("perf-chart-svg");
    if (!svg) return;

    svg.innerHTML = "";

    if (!history || history.length === 0) {
        svg.innerHTML = `<text x="250" y="150" fill="var(--text-muted)" text-anchor="middle">No history data available.</text>`;
        return;
    }

    // Grid coordinates
    const width = 560;
    const height = 280;
    const padding = 45;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = 100;
    const minVal = 0;

    // Draw horizontal grid lines & labels
    for (let i = 0; i <= 4; i++) {
        const yVal = minVal + ((maxVal - minVal) * i) / 4;
        const yPos = padding + chartHeight - (chartHeight * i) / 4;

        // Line
        const gridLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        gridLine.setAttribute("x1", padding);
        gridLine.setAttribute("y1", yPos);
        gridLine.setAttribute("x2", width - padding);
        gridLine.setAttribute("y2", yPos);
        gridLine.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
        gridLine.setAttribute("stroke-width", "1");
        svg.appendChild(gridLine);

        // Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", padding - 12);
        text.setAttribute("y", yPos + 4);
        text.setAttribute("fill", "var(--text-muted)");
        text.setAttribute("font-size", "11px");
        text.setAttribute("text-anchor", "end");
        text.textContent = yVal + "%";
        svg.appendChild(text);
    }

    // Coordinates mapping helper
    const getCoords = (index, score) => {
        const x = padding + (chartWidth * index) / (history.length - 1);
        const y = padding + chartHeight - (chartHeight * (score - minVal)) / (maxVal - minVal);
        return { x, y };
    };

    let pathD = "";
    const points = [];

    // Map month tags and values
    history.forEach((data, index) => {
        const coords = getCoords(index, data.score);
        points.push(coords);

        if (index === 0) {
            pathD += `M ${coords.x} ${coords.y}`;
        } else {
            pathD += ` L ${coords.x} ${coords.y}`;
        }

        // Draw x-axis tags
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", coords.x);
        label.setAttribute("y", height - padding + 22);
        label.setAttribute("fill", "var(--text-muted)");
        label.setAttribute("font-size", "11px");
        label.setAttribute("text-anchor", "middle");
        label.textContent = data.month;
        svg.appendChild(label);
    });

    // Render area path
    if (points.length > 0) {
        const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
        const areaPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        areaPath.setAttribute("d", areaD);
        areaPath.setAttribute("fill", "url(#chart-glow-gradient)");
        areaPath.setAttribute("style", "opacity: 0.15;");
        svg.appendChild(areaPath);
    }

    // Render line path
    const linePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    linePath.setAttribute("d", pathD);
    linePath.setAttribute("fill", "none");
    linePath.setAttribute("stroke", "var(--color-primary)");
    linePath.setAttribute("stroke-width", "3");
    linePath.setAttribute("stroke-linecap", "round");
    linePath.setAttribute("stroke-linejoin", "round");
    svg.appendChild(linePath);

    // Draw circular node points
    points.forEach((pt, index) => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", pt.x);
        circle.setAttribute("cy", pt.y);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "var(--color-primary)");
        circle.setAttribute("stroke", "var(--bg-base)");
        circle.setAttribute("stroke-width", "2");

        // Tooltip hover effect
        circle.addEventListener("mouseenter", () => {
            circle.setAttribute("r", "7");
            showChartTooltip(svg, pt.x, pt.y, history[index].score + "%");
        });
        circle.addEventListener("mouseleave", () => {
            circle.setAttribute("r", "5");
            removeChartTooltip();
        });

        svg.appendChild(circle);
    });
}

function showChartTooltip(svg, x, y, value) {
    removeChartTooltip();
    
    const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.setAttribute("id", "chart-tooltip");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x - 28);
    rect.setAttribute("y", y - 32);
    rect.setAttribute("width", "56");
    rect.setAttribute("height", "22");
    rect.setAttribute("rx", "4");
    rect.setAttribute("fill", "#111827");
    rect.setAttribute("stroke", "var(--border-color-glow)");
    rect.setAttribute("stroke-width", "1");
    container.appendChild(rect);

    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", x);
    txt.setAttribute("y", y - 17);
    txt.setAttribute("fill", "var(--text-bright)");
    txt.setAttribute("font-size", "10px");
    txt.setAttribute("font-weight", "bold");
    txt.setAttribute("text-anchor", "middle");
    txt.textContent = value;
    container.appendChild(txt);

    svg.appendChild(container);
}

function removeChartTooltip() {
    const tooltip = document.getElementById("chart-tooltip");
    if (tooltip) tooltip.remove();
}

// 3. Attendance View
function loadAttendanceData() {
    if (!currentStudent) return;

    // Header stats info
    document.getElementById("attend-present-count").innerText = currentStudent.attendance.present;
    document.getElementById("attend-absent-count").innerText = currentStudent.attendance.absent;
    document.getElementById("attend-late-count").innerText = currentStudent.attendance.late;
    document.getElementById("attend-percentage-rate").innerText = currentStudent.attendance.rate + "%";

    // Progress circle
    const circle = document.getElementById("attend-percentage-circle");
    if (circle) {
        const offset = 251.2 - (251.2 * currentStudent.attendance.rate) / 100;
        circle.style.strokeDashoffset = offset;
    }

    // Generate Calendar Days (June 2026 starts on Monday (1st), 30 days)
    const grid = document.getElementById("calendar-days-grid");
    grid.innerHTML = "";

    const totalDays = 30;
    const history = currentStudent.attendance.calendar || {};

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day-cell";
        
        const status = history[day] || "";
        if (status) {
            cell.classList.add(status);
        }

        cell.innerHTML = `
            <span class="day-number">${day}</span>
            <div class="day-status-indicator"></div>
        `;
        grid.appendChild(cell);
    }
}

// 4. Fees View & Payment Flow
let paymentContext = { amount: 0, type: "full", installmentId: null };

function loadFeesData() {
    if (!currentStudent) return;

    // Header cards
    document.getElementById("fees-due-amount").innerText = `$${currentStudent.fees.pending}`;
    document.getElementById("fees-paid-amount").innerText = `$${currentStudent.fees.paid}`;
    
    // Quick overall status layout
    const feeStatusDiv = document.getElementById("fees-status-summary");
    if (currentStudent.fees.pending === 0) {
        feeStatusDiv.innerHTML = '<span class="status-badge paid"><i class="fas fa-check-circle"></i> Account Clear</span>';
    } else {
        feeStatusDiv.innerHTML = '<span class="status-badge unpaid"><i class="fas fa-exclamation-circle"></i> Pending Dues</span>';
    }

    // Hydrate Installment Timeline Step UI
    const timelineContainer = document.getElementById("fees-timeline-container");
    timelineContainer.innerHTML = "";

    const installments = currentStudent.fees.installments || [];
    let firstUnpaidFound = false;

    installments.forEach(inst => {
        const stepDiv = document.createElement("div");
        stepDiv.className = "timeline-step";

        let markerContent = '<i class="fas fa-circle"></i>';
        let statusText = "";
        let detailsText = "";
        let actionHtml = "";

        if (inst.status === "paid") {
            stepDiv.classList.add("completed");
            markerContent = '<i class="fas fa-check"></i>';
            statusText = '<span class="timeline-step-badge completed">Paid</span>';
            detailsText = `Fully settled on schedule • $${inst.amount}`;
        } else if (inst.status === "partial") {
            stepDiv.classList.add("active");
            markerContent = '<i class="fas fa-adjust"></i>';
            const remaining = inst.amount - (inst.paidAmount || 0);
            statusText = `<span class="timeline-step-badge partial">Partial (Paid $${inst.paidAmount})</span>`;
            detailsText = `Paid $${inst.paidAmount} of $${inst.amount} • Due ${inst.dueDate}`;
            
            actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${remaining}">Pay Due</button>`;
            firstUnpaidFound = true;
        } else {
            // Status is pending
            if (!firstUnpaidFound) {
                stepDiv.classList.add("active");
                markerContent = '<i class="fas fa-clock"></i>';
                statusText = `<span class="timeline-step-badge locked" style="background: var(--color-primary-glow); color: var(--color-primary);">Active Due: $${inst.amount}</span>`;
                detailsText = `Due date: ${inst.dueDate}`;
                
                actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${inst.amount}">Pay Now</button>`;
                firstUnpaidFound = true;
            } else {
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

    // Wire up pay installment buttons
    document.querySelectorAll(".pay-inst-btn").forEach(btn => {
        btn.onclick = () => {
            const instId = parseInt(btn.dataset.id);
            const dueVal = parseFloat(btn.dataset.due);
            openPaymentCheckout(dueVal, "installment", instId);
        };
    });

    // Hydrate detailed breakdown invoice items
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

    // Setup checkout modal events
    setupCheckoutPortal();
}

function openPaymentCheckout(amount, type = "full", installmentId = null) {
    paymentContext = { amount, type, installmentId };
    
    // Display modal
    const modal = document.getElementById("checkout-modal");
    modal.classList.add("active");
    
    document.getElementById("checkout-due-amount").innerText = `$${amount.toFixed(2)}`;
    document.getElementById("pay-amount").value = amount;
    document.getElementById("pay-amount").max = amount;
}

function setupCheckoutPortal() {
    const modal = document.getElementById("checkout-modal");
    const closeBtn = document.getElementById("checkout-close-btn");
    const form = document.getElementById("checkout-form");
    
    closeBtn.onclick = () => {
        modal.classList.remove("active");
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.classList.remove("active");
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const payVal = parseFloat(document.getElementById("pay-amount").value);
        if (isNaN(payVal) || payVal <= 0 || payVal > paymentContext.amount) {
            alert("Please enter a valid payment amount.");
            return;
        }

        // Processing payment button spinner
        const payBtn = form.querySelector('button[type="submit"]');
        const origText = payBtn.innerHTML;
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Securely...';

        try {
            const res = await fetch(`${API_BASE}/student/${currentStudent.username}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: payVal,
                    method: document.getElementById("pay-method").value,
                    installmentId: paymentContext.installmentId
                })
            });

            const data = await res.json();
            
            if (res.ok) {
                // Update local storage record
                currentStudent.fees = data.fees;
                
                // Hide payment modal
                modal.classList.remove("active");

                // Reset submit button state
                payBtn.disabled = false;
                payBtn.innerHTML = origText;

                // Refresh fee content views
                loadFeesData();

                // Display success receipt modal
                triggerReceiptReceiptPopup({
                    txnId: data.transaction.id,
                    date: data.transaction.date,
                    amount: payVal,
                    method: data.transaction.method,
                    student: currentStudent.profile.name,
                    pending: currentStudent.fees.pending
                });
            } else {
                alert(data.error || "Payment processing failed. Server rejected request.");
                payBtn.disabled = false;
                payBtn.innerHTML = origText;
            }
        } catch (err) {
            alert("Connection error. Payment sync failed.");
            payBtn.disabled = false;
            payBtn.innerHTML = origText;
        }
    };
}

function triggerReceiptReceiptPopup(receipt) {
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
