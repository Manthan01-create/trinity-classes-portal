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
                const loaded = await loadStudentData(usernameInput);
                if (loaded) {
                    loginStudent(usernameInput);
                } else {
                    errorDiv.innerText = "Error reading student database file.";
                }
            } else {
                errorDiv.innerText = data.error || "Invalid username or password.";
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
                if (currentStudent) {
                    await loadStudentData(currentStudent.username);
                }
                navigateTo(view);
            }
        });
    });
}

function navigateTo(viewId) {
    document.querySelectorAll(".sidebar-nav-link").forEach(link => {
        if (link.dataset.view === viewId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    document.querySelectorAll(".app-view").forEach(view => {
        view.classList.add("hidden");
    });
    
    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
        activeView.classList.remove("hidden");
        activeView.style.opacity = 0;
        setTimeout(() => {
            activeView.style.opacity = 1;
            activeView.style.transition = "opacity 0.3s ease-in-out";
        }, 50);
    }

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

// 1. Dashboard View
function loadDashboardData() {
    if (!currentStudent) return;
    
    document.getElementById("dash-welcome-name").innerText = currentStudent.profile.name;
    document.getElementById("dash-student-id").innerText = currentStudent.profile.id;
    document.getElementById("dash-student-email").innerText = currentStudent.profile.email;
    document.getElementById("dash-student-grade").innerText = currentStudent.profile.grade;
    document.getElementById("dash-student-phone").innerText = currentStudent.profile.phone || "+1 (555) 000-0000";
    
    document.getElementById("dash-gpa-val").innerText = currentStudent.performance.gpa;
    document.getElementById("dash-attendance-rate").innerText = currentStudent.attendance.rate + "%";
    
    const attCircle = document.getElementById("dash-attendance-circle");
    if (attCircle) {
        const offset = 188.4 - (188.4 * currentStudent.attendance.rate) / 100;
        attCircle.style.strokeDashoffset = offset;
    }

    const pendingVal = document.getElementById("dash-fees-pending");
    pendingVal.innerText = `$${currentStudent.fees.pending}`;
    if (currentStudent.fees.pending > 0) {
        pendingVal.className = "metric-value danger-text animate-pulse-subtle";
    } else {
        pendingVal.className = "metric-value success-text";
    }

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

    setTimeout(() => {
        const fills = document.querySelectorAll(".progress-bar-fill");
        fills.forEach(fill => {
            fill.style.width = fill.dataset.targetWidth;
        });
    }, 100);

    renderPieChart(currentStudent.performance.subjects);
}

function renderPieChart(subjects) {
    const svg = document.getElementById("perf-chart-svg");
    if (!svg) return;
    svg.innerHTML = "";

    if (!subjects || subjects.length === 0) {
        svg.innerHTML = `<text x="300" y="125" fill="var(--text-muted)" text-anchor="middle">No performance data available.</text>`;
        return;
    }

    const totalScore = subjects.reduce((sum, sub) => sum + sub.score, 0);

    // Center coordinates and radius
    const cx = 160;
    const cy = 125;
    const r = 90;

    let startAngle = 0;
    const legendItems = [];

    subjects.forEach((sub) => {
        const sliceShare = sub.score / totalScore;
        const angleDegrees = sliceShare * 360;
        const endAngle = startAngle + angleDegrees;

        // Radians math
        const radStart = (startAngle - 90) * Math.PI / 180;
        const radEnd = (endAngle - 90) * Math.PI / 180;

        const x1 = cx + r * Math.cos(radStart);
        const y1 = cy + r * Math.sin(radStart);
        const x2 = cx + r * Math.cos(radEnd);
        const y2 = cy + r * Math.sin(radEnd);

        const largeArcFlag = angleDegrees > 180 ? 1 : 0;
        const pathData = `
            M ${cx} ${cy}
            L ${x1} ${y1}
            A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}
            Z
        `;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData.trim());
        path.setAttribute("fill", sub.color);
        path.setAttribute("stroke", "var(--bg-base)");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("style", "transition: transform 0.2s ease; cursor: pointer;");

        // Hover offset translation towards the arc center
        const middleAngle = startAngle + angleDegrees / 2 - 90;
        const radMiddle = middleAngle * Math.PI / 180;
        const offsetX = Math.cos(radMiddle) * 6;
        const offsetY = Math.sin(radMiddle) * 6;

        path.addEventListener("mouseenter", () => {
            path.setAttribute("transform", `translate(${offsetX}, ${offsetY})`);
            showPieTooltip(svg, cx, cy, sub.name, sub.score);
        });
        path.addEventListener("mouseleave", () => {
            path.removeAttribute("transform");
            removePieTooltip(svg, cx, cy);
        });

        svg.appendChild(path);
        
        legendItems.push({
            name: sub.name,
            score: sub.score,
            color: sub.color
        });

        startAngle = endAngle;
    });

    // Donut center cover
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerCircle.setAttribute("cx", cx);
    innerCircle.setAttribute("cy", cy);
    innerCircle.setAttribute("r", "50");
    innerCircle.setAttribute("fill", "var(--bg-base)");
    innerCircle.setAttribute("stroke", "rgba(255, 255, 255, 0.05)");
    innerCircle.setAttribute("stroke-width", "1");
    svg.appendChild(innerCircle);

    // Initial label in center
    showPieTooltip(svg, cx, cy, "Average", Math.round(totalScore / subjects.length));

    // Legend on the Right
    const legendStartX = 310;
    const legendStartY = 45;
    const rowHeight = 32;

    legendItems.forEach((item, idx) => {
        const yPos = legendStartY + idx * rowHeight;

        // Bullet Dot
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", legendStartX);
        dot.setAttribute("cy", yPos);
        dot.setAttribute("r", "6");
        dot.setAttribute("fill", item.color);
        svg.appendChild(dot);

        // Name
        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("x", legendStartX + 18);
        nameText.setAttribute("y", yPos + 4);
        nameText.setAttribute("fill", "var(--text-bright)");
        nameText.setAttribute("font-size", "11px");
        nameText.setAttribute("font-weight", "500");
        nameText.textContent = item.name;
        svg.appendChild(nameText);

        // Score percentage
        const scoreText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        scoreText.setAttribute("x", legendStartX + 210);
        scoreText.setAttribute("y", yPos + 4);
        scoreText.setAttribute("fill", "var(--text-muted)");
        scoreText.setAttribute("font-size", "11px");
        scoreText.setAttribute("font-weight", "bold");
        scoreText.setAttribute("text-anchor", "end");
        scoreText.textContent = `${item.score}%`;
        svg.appendChild(scoreText);
    });
}

function showPieTooltip(svg, cx, cy, name, score) {
    const existing = document.getElementById("pie-tooltip");
    if (existing) existing.remove();
    
    const container = document.createElementNS("http://www.w3.org/2000/svg", "g");
    container.setAttribute("id", "pie-tooltip");
    
    const textName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textName.setAttribute("x", cx);
    textName.setAttribute("y", cy - 5);
    textName.setAttribute("fill", "var(--text-muted)");
    textName.setAttribute("font-size", "10px");
    textName.setAttribute("text-anchor", "middle");
    textName.textContent = name;
    container.appendChild(textName);

    const textScore = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textScore.setAttribute("x", cx);
    textScore.setAttribute("y", cy + 15);
    textScore.setAttribute("fill", "var(--text-bright)");
    textScore.setAttribute("font-size", "16px");
    textScore.setAttribute("font-weight", "bold");
    textScore.setAttribute("text-anchor", "middle");
    textScore.textContent = `${score}%`;
    container.appendChild(textScore);

    svg.appendChild(container);
}

function removePieTooltip(svg, cx, cy) {
    const tooltip = document.getElementById("pie-tooltip");
    if (tooltip) tooltip.remove();
    
    if (cx && cy && currentStudent && currentStudent.performance.subjects.length > 0) {
        const total = currentStudent.performance.subjects.reduce((sum, sub) => sum + sub.score, 0);
        const avg = Math.round(total / currentStudent.performance.subjects.length);
        showPieTooltip(svg, cx, cy, "Average", avg);
    }
}

// 3. Attendance View
function loadAttendanceData() {
    if (!currentStudent) return;

    // Header stats info matching index.html IDs
    document.getElementById("att-present-count").innerText = currentStudent.attendance.present;
    document.getElementById("att-absent-count").innerText = currentStudent.attendance.absent;
    document.getElementById("att-late-count").innerText = currentStudent.attendance.late;
    document.getElementById("att-percentage-val").innerText = currentStudent.attendance.rate + "%";

    // Progress bar gauge width matching index.html ID
    const gauge = document.getElementById("att-progress-bar-gauge");
    if (gauge) {
        gauge.style.width = currentStudent.attendance.rate + "%";
    }

    // Generate Calendar Days (June 2026 starts on Monday (1st), 30 days)
    const grid = document.getElementById("calendar-days");
    grid.innerHTML = "";

    const totalDays = 30;
    const history = currentStudent.attendance.calendar || {};

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        
        const status = history[day] || "";
        if (status) {
            cell.classList.add(status);
        }

        const isWeekend = (day % 7 === 6 || day % 7 === 0);
        if (isWeekend) {
            cell.classList.add("weekend");
        }

        let badgeHtml = "";
        if (status === "present") badgeHtml = '<span class="day-badge present-badge">Present</span>';
        else if (status === "absent") badgeHtml = '<span class="day-badge absent-badge">Absent</span>';
        else if (status === "late") badgeHtml = '<span class="day-badge late-badge">Late</span>';
        else if (isWeekend) badgeHtml = '<span class="day-badge weekend-badge">Weekend</span>';

        cell.innerHTML = `
            <span class="date-number">${day}</span>
            ${badgeHtml}
        `;
        grid.appendChild(cell);
    }
}

// 4. Fees View & Payment Flow
let paymentContext = { amount: 0, type: "full", installmentId: null };

function loadFeesData() {
    if (!currentStudent) return;

    // Header metrics matching index.html IDs
    document.getElementById("fee-total-bill").innerText = `$${currentStudent.fees.total}`;
    document.getElementById("fee-total-paid").innerText = `$${currentStudent.fees.paid}`;
    document.getElementById("fee-total-pending").innerText = `$${currentStudent.fees.pending}`;

    // Scheme Selection Tab Styling & Pane Display
    const fullTabBtn = document.getElementById("scheme-tab-full");
    const instTabBtn = document.getElementById("scheme-tab-installments");
    const fullPane = document.getElementById("scheme-content-full");
    const instPane = document.getElementById("scheme-content-installments");

    const activeScheme = currentStudent.fees.activeScheme || "full";

    const setSchemeView = (scheme) => {
        if (scheme === "full") {
            fullTabBtn.classList.add("active");
            instTabBtn.classList.remove("active");
            fullPane.classList.remove("hidden");
            instPane.classList.add("hidden");
            
            // Populate full pay amount
            document.getElementById("full-pay-amount-label").innerText = `$${currentStudent.fees.pending.toFixed(2)}`;
            
            const fullPayBtn = document.getElementById("full-pay-btn");
            if (currentStudent.fees.pending <= 0) {
                fullPayBtn.disabled = true;
                fullPayBtn.innerText = "Dues Fully Cleared";
                fullPayBtn.style.opacity = 0.5;
                fullPayBtn.style.cursor = "not-allowed";
            } else {
                fullPayBtn.disabled = false;
                fullPayBtn.innerHTML = '<i class="fas fa-shield-alt"></i> Pay Full Balance';
                fullPayBtn.style.opacity = 1;
                fullPayBtn.style.cursor = "pointer";
                fullPayBtn.onclick = () => {
                    openPaymentCheckout(currentStudent.fees.pending, "full");
                };
            }
        } else {
            fullTabBtn.classList.remove("active");
            instTabBtn.classList.add("active");
            fullPane.classList.add("hidden");
            instPane.classList.remove("hidden");
            
            renderInstallmentTimeline();
        }
    };

    // Initialize Scheme Selection View
    setSchemeView(activeScheme);

    // Bind Scheme selection tabs click events
    fullTabBtn.onclick = () => setSchemeView("full");
    instTabBtn.onclick = () => setSchemeView("installments");

    // breakdown table removed

    // Hydrate transaction logs matching index.html tbody
    const transTbody = document.getElementById("transactions-tbody");
    if (currentStudent.fees.transactions && currentStudent.fees.transactions.length > 0) {
        transTbody.innerHTML = currentStudent.fees.transactions.map(txn => `
            <tr>
                <td><code>${txn.id}</code></td>
                <td>${txn.date}</td>
                <td>$${txn.amount}</td>
                <td>${txn.method}</td>
                <td><span class="status-badge paid">${txn.status}</span></td>
            </tr>
        `).join("");
    } else {
        transTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 15px;">No transactions logged</td></tr>`;
    }

    setupCheckoutPortal();
}

function renderInstallmentTimeline() {
    const timelineContainer = document.getElementById("installments-timeline-list");
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
            statusText = '<span class="timeline-step-badge paid">Paid</span>';
            detailsText = `Fully settled on schedule • $${inst.amount}`;
        } else if (inst.status === "partial") {
            stepDiv.classList.add("active");
            markerContent = '<i class="fas fa-adjust"></i>';
            const remaining = inst.amount - (inst.paidAmount || 0);
            statusText = `<span class="timeline-step-badge partial">Partial (Paid $${inst.paidAmount})</span>`;
            detailsText = `Paid $${inst.paidAmount} of $${inst.amount} • Due ${inst.dueDate}`;
            
            actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${remaining}" style="padding: 6px 12px; font-size: 0.8rem; width: auto;">Pay Due</button>`;
            firstUnpaidFound = true;
        } else {
            if (!firstUnpaidFound) {
                stepDiv.classList.add("active");
                markerContent = '<i class="fas fa-clock"></i>';
                statusText = `<span class="timeline-step-badge locked" style="background: var(--color-primary-glow); color: var(--color-primary);">Active Due: $${inst.amount}</span>`;
                detailsText = `Due date: ${inst.dueDate}`;
                
                actionHtml = `<button class="action-btn pay-inst-btn" data-id="${inst.id}" data-due="${inst.amount}" style="padding: 6px 12px; font-size: 0.8rem; width: auto;">Pay Now</button>`;
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

    document.querySelectorAll(".pay-inst-btn").forEach(btn => {
        btn.onclick = () => {
            const instId = parseInt(btn.dataset.id);
            const dueVal = parseFloat(btn.dataset.due);
            openPaymentCheckout(dueVal, "installment", instId);
        };
    });
}

function openPaymentCheckout(amount, type = "full", installmentId = null) {
    paymentContext = { amount, type, installmentId };
    
    const modal = document.getElementById("checkout-modal");
    modal.classList.add("active");
    
    const amountInput = document.getElementById("pay-amount");
    amountInput.value = amount;
    amountInput.max = amount;
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
                currentStudent.fees = data.fees;
                modal.classList.remove("active");
                payBtn.disabled = false;
                payBtn.innerHTML = origText;

                loadFeesData();

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
