// ===============================
// LOGIN / REGISTER
// ===============================

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showRegister = document.getElementById("showRegister");
const showLogin = document.getElementById("showLogin");

if (showRegister) {

    showRegister.addEventListener("click", () => {

        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");

    });

}

if (showLogin) {

    showLogin.addEventListener("click", () => {

        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

    });

}


// ===============================
// REGISTER
// ===============================

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name =
            document.getElementById("registerName").value;

        const email =
            document.getElementById("registerEmail").value;

        const password =
            document.getElementById("registerPassword").value;

        const message =
            document.getElementById("registerMessage");

        try {

            const response = await fetch(
                "/api/auth/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            message.textContent = data.message;

            if (response.ok) {

                message.style.color = "#15803d";

                registerForm.reset();

                setTimeout(() => {

                    registerForm.classList.add("hidden");
                    loginForm.classList.remove("hidden");

                }, 1000);

            } else {

                message.style.color = "#dc2626";

            }

        } catch (error) {

            message.textContent =
                "Unable to connect to server.";

            message.style.color = "#dc2626";

        }

    });

}


// ===============================
// LOGIN
// ===============================

if (loginForm) {

    loginForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        // Clear old message
        message.textContent = "Logging in...";
        message.style.color = "#2563eb";


        try {

            const response = await fetch(
                "/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            console.log("Login response:", data);


            if (!response.ok) {

                message.textContent =
                    data.message || "Login failed.";

                message.style.color = "#dc2626";

                return;
            }


            // Login successful
            message.textContent =
                "Login successful! Opening dashboard...";

            message.style.color = "#15803d";


            // Save user name
            if (data.user && data.user.name) {

                localStorage.setItem(
                    "userName",
                    data.user.name
                );

            }


            // Redirect
            setTimeout(() => {

                window.location.href =
                    "/dashboard.html";

            }, 700);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";

            message.style.color = "#dc2626";

        }

    });

}

// ===============================
// DASHBOARD
// ===============================

const taskList =
    document.getElementById("taskList");

if (taskList) {

    const userName =
        localStorage.getItem("userName") || "User";

    document.getElementById("userName").textContent =
        userName;

    document.getElementById("welcomeName").textContent =
        userName;

    loadTasks();

}


// ===============================
// LOAD TASKS
// ===============================

async function loadTasks() {

    if (!taskList) return;

    try {

        const response = await fetch(
            "/api/tasks",
            {
                credentials: "include"
            }
        );

        if (response.status === 401) {

            window.location.href = "/";

            return;
        }

        const tasks = await response.json();

        displayTasks(tasks);

    } catch (error) {

        console.error(error);

        taskList.innerHTML = `
            <div class="empty-state">
                <div>⚠️</div>
                <h3>Unable to load tasks</h3>
                <p>Please try again.</p>
            </div>
        `;

    }

}


// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    const filter =
        document.getElementById("filterTasks").value;

    let filteredTasks = tasks;

    if (filter !== "All") {

        filteredTasks =
            tasks.filter(task =>
                task.status === filter
            );

    }


    // Statistics

    const total =
        tasks.length;

    const pending =
        tasks.filter(task =>
            task.status === "Pending"
        ).length;

    const completed =
        tasks.filter(task =>
            task.status === "Completed"
        ).length;

    document.getElementById("totalTasks").textContent =
        total;

    document.getElementById("pendingTasks").textContent =
        pending;

    document.getElementById("completedTasks").textContent =
        completed;


    // Empty

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <div>📋</div>
                <h3>No tasks found</h3>
                <p>Create a task to get started.</p>
            </div>
        `;

        return;
    }


    taskList.innerHTML = "";

    filteredTasks.forEach(task => {

        const card =
            document.createElement("div");

        card.className =
            "task-card" +
            (task.status === "Completed"
                ? " completed"
                : "");


        const priorityClass =
            task.priority.toLowerCase();


        card.innerHTML = `

            <div class="task-top">

                <div>

                    <div class="task-title">
                        ${escapeHTML(task.title)}
                    </div>

                    <div class="task-description">
                        ${escapeHTML(task.description || "No description")}
                    </div>

                </div>

            </div>


            <div class="task-meta">

                <span class="badge priority-${priorityClass}">
                    ${task.priority} Priority
                </span>

                <span class="badge ${
                    task.status === "Completed"
                        ? "status-completed"
                        : "status-pending"
                }">
                    ${task.status}
                </span>

                ${
                    task.due_date
                        ? `<span class="due-date">
                            📅 ${task.due_date}
                           </span>`
                        : ""
                }

            </div>


            <div class="task-actions">

                <button
                    class="complete-btn"
                    onclick="toggleTask(${task.id}, '${task.status}')"
                >
                    ${
                        task.status === "Completed"
                            ? "↩ Mark Pending"
                            : "✓ Complete"
                    }
                </button>

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})"
                >
                    ✎ Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    🗑 Delete
                </button>

            </div>
        `;

        taskList.appendChild(card);

    });

}


// ===============================
// FILTER
// ===============================

const filterTasks =
    document.getElementById("filterTasks");

if (filterTasks) {

    filterTasks.addEventListener(
        "change",
        loadTasks
    );

}


// ===============================
// MODAL
// ===============================

const modal =
    document.getElementById("taskModal");

const addTaskBtn =
    document.getElementById("addTaskBtn");

const closeModal =
    document.getElementById("closeModal");

const cancelTask =
    document.getElementById("cancelTask");


function openModal() {

    modal.classList.add("show");

}


function closeTaskModal() {

    modal.classList.remove("show");

    document.getElementById("taskForm").reset();

    document.getElementById("taskId").value = "";

    document.getElementById("modalTitle").textContent =
        "Add New Task";

}


if (addTaskBtn) {

    addTaskBtn.addEventListener(
        "click",
        openModal
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeTaskModal
    );

}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModal
    );

}


// ===============================
// CREATE / UPDATE TASK
// ===============================

const taskForm =
    document.getElementById("taskForm");

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const id =
                document.getElementById("taskId").value;

            const taskData = {

                title:
                    document.getElementById("taskTitle").value,

                description:
                    document.getElementById("taskDescription").value,

                priority:
                    document.getElementById("taskPriority").value,

                due_date:
                    document.getElementById("taskDueDate").value,

                status:
                    document.getElementById("taskStatus").value

            };


            const url =
                id
                    ? `/api/tasks/${id}`
                    : "/api/tasks";

            const method =
                id
                    ? "PUT"
                    : "POST";


            try {

                const response =
                    await fetch(
                        url,
                        {
                            method,

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body:
                                JSON.stringify(taskData)
                        }
                    );


                const data =
                    await response.json();


                if (response.ok) {

                    closeTaskModal();

                    loadTasks();

                } else {

                    document.getElementById(
                        "taskMessage"
                    ).textContent =
                        data.message;

                }

            } catch (error) {

                console.error(error);

            }

        }
    );

}


// ===============================
// EDIT TASK
// ===============================

async function editTask(id) {

    try {

        const response =
            await fetch(
                "/api/tasks",
                {
                    credentials: "include"
                }
            );

        const tasks =
            await response.json();

        const task =
            tasks.find(t => t.id === id);

        if (!task) return;


        document.getElementById("taskId").value =
            task.id;

        document.getElementById("taskTitle").value =
            task.title;

        document.getElementById("taskDescription").value =
            task.description || "";

        document.getElementById("taskPriority").value =
            task.priority;

        document.getElementById("taskDueDate").value =
            task.due_date || "";

        document.getElementById("taskStatus").value =
            task.status;

        document.getElementById("modalTitle").textContent =
            "Edit Task";

        openModal();

    } catch (error) {

        console.error(error);

    }

}


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;


    try {

        const response =
            await fetch(
                `/api/tasks/${id}`,
                {
                    method: "DELETE",

                    credentials: "include"
                }
            );

        if (response.ok) {

            loadTasks();

        }

    } catch (error) {

        console.error(error);

    }

}


// ===============================
// COMPLETE / PENDING
// ===============================

async function toggleTask(id, status) {

    try {

        const response =
            await fetch("/api/tasks", {
                credentials: "include"
            });

        const tasks =
            await response.json();

        const task =
            tasks.find(t => t.id === id);

        if (!task) return;


        const newStatus =
            status === "Completed"
                ? "Pending"
                : "Completed";


        await fetch(
            `/api/tasks/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                credentials: "include",

                body: JSON.stringify({
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    due_date: task.due_date,
                    status: newStatus
                })
            }
        );

        loadTasks();

    } catch (error) {

        console.error(error);

    }

}


// ===============================
// LOGOUT
// ===============================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async () => {

            try {

                await fetch(
                    "/api/auth/logout",
                    {
                        method: "POST",
                        credentials: "include"
                    }
                );

                localStorage.removeItem(
                    "userName"
                );

                window.location.href = "/";

            } catch (error) {

                console.error(error);

            }

        }
    );

}


// ===============================
// HTML ESCAPE
// ===============================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value;

    return div.innerHTML;

}