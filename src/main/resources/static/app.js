
const API = "/api/tasks";

const statuses = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];

const labels = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  REVIEW: "Review",
  DONE: "Done"
};

let tasks = [];
let editingId = null;
let focusOnly = false;
let selectedProject = "Product launch";

const $ = id => document.getElementById(id);

const esc = value =>
  String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));

function toast(message) {
  const el = $("toast");
  if (!el) return;

  el.textContent = message;
  el.classList.add("show");

  setTimeout(() => el.classList.remove("show"), 2400);
}

/* =====================================
   DARK / LIGHT THEME
   Saves the user's preference
   ===================================== */

function initTheme() {
  const toggle = $("themeToggle");
  const icon = $("themeIcon");
  const label = $("themeLabel");

  if (!toggle || !icon || !label) {
    console.warn("Theme toggle elements not found in index.html");
    return;
  }

  function applyTheme(theme) {
    const selectedTheme = theme === "dark" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", selectedTheme);

    const isDark = selectedTheme === "dark";

    icon.textContent = isDark ? "☀️" : "🌙";
    label.textContent = isDark ? "Light mode" : "Dark mode";

    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("taskbloom-theme") || "light";
  } catch (error) {
    console.warn("Could not load saved theme preference.");
  }

  applyTheme(savedTheme);

  toggle.addEventListener("click", () => {
    const currentTheme =
      document.documentElement.getAttribute("data-theme");

    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem("taskbloom-theme", nextTheme);
    } catch (error) {
      console.warn("Could not save theme preference.");
    }
  });
}

/* =====================================
   PROJECT MANAGEMENT
   ===================================== */

function loadProjects() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("taskbloom.projects") || "[]"
    );

    return [
      ...new Set([
        "Product launch",
        "Website refresh",
        "Brand strategy",
        ...saved
      ])
    ];
  } catch {
    return [
      "Product launch",
      "Website refresh",
      "Brand strategy"
    ];
  }
}

let projects = loadProjects();

function saveProjects() {
  try {
    localStorage.setItem(
      "taskbloom.projects",
      JSON.stringify(projects)
    );
  } catch {
    toast("Could not save projects in this browser.");
  }
}

function renderProjects() {
  const list = $("projectList");

  if (list) {
    list.innerHTML = "";

    projects.forEach(name => {
      const item = document.createElement("button");

      item.type = "button";
      item.className =
        "project-name" +
        (name === selectedProject ? " selected" : "");

      const dot = document.createElement("i");
      item.append(dot, document.createTextNode(" " + name));

      item.addEventListener("click", () => {
        selectedProject = name;
        renderProjects();
        render();
        toast("Showing " + name);
      });

      list.appendChild(item);
    });
  }

  const select = $("taskProject");

  if (select) {
    const current = select.value;

    select.innerHTML = projects
      .map(project =>
        `<option value="${esc(project)}">${esc(project)}</option>`
      )
      .join("");

    select.value = projects.includes(current)
      ? current
      : selectedProject;
  }
}

/* =====================================
   DATE HELPERS
   ===================================== */

function dueLabel(date) {
  if (!date) return "No due date";

  const d = new Date(date + "T00:00:00");

  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function isTodayOrOverdue(date) {
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(date + "T00:00:00") <= today;
}

/* =====================================
   FILTER TASKS
   ===================================== */

function filteredTasks() {
  const q = $("search").value.trim().toLowerCase();
  const priority = $("priorityFilter").value;

  return tasks.filter(task => {
    const project = task.projectName || "Product launch";

    const matchesProject = project === selectedProject;

    const matchesSearch =
      !q ||
      [
        task.title,
        task.description,
        task.assignee,
        task.comments
      ].some(value =>
        (value || "").toLowerCase().includes(q)
      );

    const matchesPriority =
      priority === "ALL" || task.priority === priority;

    const matchesFocus =
      !focusOnly ||
      (
        task.status !== "DONE" &&
        (
          isTodayOrOverdue(task.dueDate) ||
          task.priority === "URGENT"
        )
      );

    return (
      matchesProject &&
      matchesSearch &&
      matchesPriority &&
      matchesFocus
    );
  });
}

/* =====================================
   RENDER DASHBOARD AND TASK BOARD
   ===================================== */

function render() {
  renderProjects();

  const shown = filteredTasks();

  // Dashboard totals across the workspace
  $("totalCount").textContent = tasks.length;

  $("progressCount").textContent =
    tasks.filter(task => task.status === "IN_PROGRESS").length;

  const done = tasks.filter(
    task => task.status === "DONE"
  ).length;

  $("doneCount").textContent = done;

  $("completionRate").textContent =
    (tasks.length
      ? Math.round((done / tasks.length) * 100)
      : 0) + "%";

  $("urgentCount").textContent =
    tasks.filter(task =>
      ["URGENT", "HIGH"].includes(task.priority) &&
      task.status !== "DONE"
    ).length;

  statuses.forEach(status => {
    const group = shown.filter(task => task.status === status);

    $("count-" + status).textContent = group.length;

    const taskList = $("list-" + status);

    taskList.innerHTML = group.length
      ? group.map(task => `
        <article class="task-card">
          <span class="priority priority-${esc(task.priority)}">
            ${esc(task.priority)}
          </span>

          <h3>${esc(task.title)}</h3>

          ${
            task.description
              ? `<p>${esc(task.description)}</p>`
              : ""
          }

          ${
            task.comments
              ? `<p>💬 ${esc(task.comments)}</p>`
              : ""
          }

          <div class="task-meta">
            <span class="assignee">
              <span class="mini-avatar">
                ${esc((task.assignee || "U").slice(0, 1).toUpperCase())}
              </span>
              ${esc(task.assignee || "Unassigned")}
            </span>

            <span>◷ ${esc(dueLabel(task.dueDate))}</span>
          </div>

          <div class="task-controls">
            <button data-edit="${task.id}">Edit</button>
            <button data-move="${task.id}">Move →</button>
            <button data-delete="${task.id}">Delete</button>
          </div>
        </article>
      `).join("")
      : `<div class="empty">${
          focusOnly
            ? "No focus tasks here"
            : "Your next great idea goes here ✦"
        }</div>`;
  });
}

/* =====================================
   BACKEND API
   ===================================== */

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed";

    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

async function load() {
  try {
    tasks = await request(API);

    tasks.forEach(task => {
      if (!task.projectName) {
        task.projectName = "Product launch";
      }
    });

    $("connection").textContent = "● Connected · MySQL";
    $("connection").style.color = "#479b7c";

    render();
  } catch (error) {
    $("connection").textContent = "Backend unavailable";
    $("connection").style.color = "#bd4779";

    toast("Could not connect. Check that the Java server is running.");
  }
}

/* =====================================
   CREATE AND EDIT TASK MODAL
   ===================================== */

function openModal(task = null, status = "TODO") {
  editingId = task ? task.id : null;

  $("modalTitle").textContent =
    task ? "Edit task" : "Create a task";

  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskAssignee").value = task?.assignee || "";
  $("taskDueDate").value = task?.dueDate || "";
  $("taskPriority").value = task?.priority || "MEDIUM";
  $("taskStatus").value = task?.status || status;
  $("taskComments").value = task?.comments || "";

  renderProjects();

  $("taskProject").value =
    task?.projectName || selectedProject;

  $("formMessage").textContent = "";

  $("modalBackdrop").classList.add("open");
  $("taskTitle").focus();
}

function closeModal() {
  $("modalBackdrop").classList.remove("open");
  editingId = null;
}

$("taskForm").addEventListener("submit", async event => {
  event.preventDefault();

  const data = {
    title: $("taskTitle").value.trim(),
    description: $("taskDescription").value.trim(),
    assignee: $("taskAssignee").value.trim(),
    dueDate: $("taskDueDate").value || null,
    priority: $("taskPriority").value,
    status: $("taskStatus").value,
    comments: $("taskComments").value.trim(),
    projectName: $("taskProject").value
  };

  const wasEditing = editingId !== null;

  try {
    if (wasEditing) {
      await request(`${API}/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    } else {
      await request(API, {
        method: "POST",
        body: JSON.stringify(data)
      });
    }

    selectedProject = data.projectName;

    closeModal();
    await load();

    toast(wasEditing ? "Task updated" : "Task saved to MySQL");
  } catch (error) {
    $("formMessage").textContent = error.message;
  }
});

/* =====================================
   TASK ACTIONS: EDIT, DELETE, MOVE
   ===================================== */

document.addEventListener("click", async event => {
  const edit = event.target.closest("[data-edit]");
  const del = event.target.closest("[data-delete]");
  const move = event.target.closest("[data-move]");
  const add = event.target.closest("[data-add]");

  try {
    if (edit) {
      const task = tasks.find(
        item => item.id === Number(edit.dataset.edit)
      );

      if (task) openModal(task);

      return;
    }

    if (del) {
      if (confirm("Delete this task permanently?")) {
        await request(`${API}/${del.dataset.delete}`, {
          method: "DELETE"
        });

        await load();
        toast("Task deleted");
      }

      return;
    }

    if (move) {
      const task = tasks.find(
        item => item.id === Number(move.dataset.move)
      );

      if (!task) return;

      const currentIndex = statuses.indexOf(task.status);
      const next = statuses[(currentIndex + 1) % statuses.length];

      await request(`${API}/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...task,
          status: next
        })
      });

      await load();
      toast(`Moved to ${labels[next]}`);

      return;
    }

    if (add) {
      openModal(null, add.dataset.add);
    }
  } catch (error) {
    toast(error.message);
  }
});

/* =====================================
   BUTTONS AND MODAL EVENTS
   ===================================== */

$("newTaskTop").onclick = () => openModal();
$("newTaskBoard").onclick = () => openModal();

$("closeModal").onclick = closeModal;
$("cancelModal").onclick = closeModal;

$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) {
    closeModal();
  }
});

/* =====================================
   SEARCH AND PRIORITY FILTER
   ===================================== */

$("search").addEventListener("input", render);
$("priorityFilter").addEventListener("change", render);

/* =====================================
   FOCUS MODE
   ===================================== */

$("focusBtn").onclick = () => {
  focusOnly = !focusOnly;

  $("focusBtn").classList.toggle("active", focusOnly);

  $("focusBtn").innerHTML = focusOnly
    ? "◷ &nbsp; Focus mode <span class='tiny'>ON</span>"
    : "◷ &nbsp; Focus mode <span class='tiny'>TODAY</span>";

  render();

  toast(
    focusOnly
      ? "Focus mode enabled"
      : "Showing all tasks"
  );
};

/* =====================================
   ADD PROJECT
   ===================================== */

$("addProjectBtn").onclick = () => {
  const name = prompt("Name your project:");

  if (!name?.trim()) return;

  const clean = name.trim();

  if (
    projects.some(
      project => project.toLowerCase() === clean.toLowerCase()
    )
  ) {
    toast("That project already exists");
    return;
  }

  projects.push(clean);
  saveProjects();

  selectedProject = clean;

  renderProjects();
  render();

  toast("Project created");
};

/* =====================================
   KEYBOARD SHORTCUTS
   ===================================== */

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }

  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    $("search").focus();
  }
});

/* =====================================
   INITIALIZE APPLICATION
   ===================================== */

$("today").textContent = new Date().toLocaleDateString(
  undefined,
  {
    weekday: "short",
    month: "short",
    day: "numeric"
  }
);

// Initialize the theme once; do not duplicate its handler.
initTheme();

// Load tasks from the Spring Boot / MySQL backend.
load();
