var tasks = [
  { id: 1, text: "Welcome — tap the check to complete a task", completed: false },
  { id: 2, text: "Tap the × to delete a task", completed: false },
  { id: 3, text: "This one's already done", completed: true }
];

var nextId = 4;
var currentFilter = "pending";

var addForm = document.getElementById("addForm");
var taskInput = document.getElementById("taskInput");
var taskList = document.getElementById("taskList");
var emptyState = document.getElementById("emptyState");
var filtersNav = document.getElementById("filters");
var clockEl = document.getElementById("clock");
var pendingNextCountEl = document.getElementById("pendingNextCount");
var resetBtn = document.getElementById("resetBtn");

var countAllEl = document.getElementById("countAll");
var countPendingEl = document.getElementById("countPending");
var countCompletedEl = document.getElementById("countCompleted");

function loadTasks() {
  var raw = localStorage.getItem("todoTasks");
  if (!raw) {
    return;
  }

  try {
    var parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return;
    }

    tasks = [];
    for (var i = 0; i < parsed.length; i += 1) {
      var item = parsed[i];
      var id = Number(item.id) || nextId;
      var text = String(item.text || "").trim();
      var completed = item.completed === true;

      tasks.push({ id: id, text: text, completed: completed });
      if (id >= nextId) {
        nextId = id + 1;
      }
    }
  } catch (e) {
    console.log("Could not load tasks", e);
  }
}

function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function getFilteredTasks() {
  var list = [];
  for (var i = 0; i < tasks.length; i += 1) {
    if (currentFilter === "all") {
      list.push(tasks[i]);
    } else if (currentFilter === "pending" && !tasks[i].completed) {
      list.push(tasks[i]);
    } else if (currentFilter === "completed" && tasks[i].completed) {
      list.push(tasks[i]);
    }
  }
  return list;
}

function updateCounts() {
  var pending = 0;
  var completed = 0;
  for (var i = 0; i < tasks.length; i += 1) {
    if (tasks[i].completed) {
      completed += 1;
    } else {
      pending += 1;
    }
  }
  countAllEl.textContent = tasks.length;
  countPendingEl.textContent = pending;
  countCompletedEl.textContent = completed;
  pendingNextCountEl.textContent = pending;
}

function render() {
  var visible = getFilteredTasks();
  taskList.innerHTML = "";

  if (visible.length === 0) {
    emptyState.hidden = false;
    if (currentFilter === "completed") {
      emptyState.textContent = "No completed tasks yet.";
    } else if (currentFilter === "pending") {
      emptyState.textContent = "Nothing pending — nice work.";
    } else {
      emptyState.textContent = "Nothing here yet.";
    }
    return;
  }

  emptyState.hidden = true;
  var html = "";
  for (var i = 0; i < visible.length; i += 1) {
    var task = visible[i];
    var doneClass = task.completed ? " is-done" : "";
    html += '<li class="task' + doneClass + '" data-id="' + task.id + '">';
    html += '<span class="task__text">' + task.text + '</span>';
    html += '<div class="task__actions">';
    html += '<button type="button" class="icon-btn icon-btn--check" data-action="toggle">✓</button>';
    html += '<button type="button" class="icon-btn icon-btn--edit" data-action="edit">✎</button>';
    html += '<button type="button" class="icon-btn icon-btn--delete" data-action="delete">✕</button>';
    html += '</div>';
    html += '</li>';
  }
  taskList.innerHTML = html;
  updateCounts();
}

function addTask(value) {
  var text = value.trim();
  if (!text) {
    return;
  }
  tasks.unshift({ id: nextId, text: text, completed: false });
  nextId += 1;
  saveTasks();
  render();
}

function getTaskById(id) {
  for (var i = 0; i < tasks.length; i += 1) {
    if (tasks[i].id === id) {
      return tasks[i];
    }
  }
  return null;
}

function toggleTask(id) {
  var task = getTaskById(id);
  if (!task) {
    return;
  }
  task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  var newTasks = [];
  for (var i = 0; i < tasks.length; i += 1) {
    if (tasks[i].id !== id) {
      newTasks.push(tasks[i]);
    }
  }
  tasks = newTasks;
  saveTasks();
  render();
}

function editTask(id) {
  var task = getTaskById(id);
  if (!task) {
    return;
  }
  var updated = prompt("Edit task:", task.text);
  if (updated === null) {
    return;
  }
  var text = updated.trim();
  if (!text) {
    return;
  }
  task.text = text;
  saveTasks();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  var buttons = document.getElementsByClassName("filter-btn");
  for (var i = 0; i < buttons.length; i += 1) {
    var btn = buttons[i];
    if (btn.getAttribute("data-filter") === filter) {
      btn.className = "filter-btn is-active";
    } else {
      btn.className = "filter-btn";
    }
  }
  render();
}

function updateClock() {
  var now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var amPm = hours >= 12 ? "pm" : "am";
  var hour12 = hours % 12;
  if (hour12 === 0) {
    hour12 = 12;
  }
  var minuteText = minutes < 10 ? "0" + minutes : String(minutes);
  clockEl.textContent = hour12 + ":" + minuteText + " " + amPm;
}

addForm.addEventListener("submit", function (e) {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

taskList.addEventListener("click", function (e) {
  var clicked = e.target;
  var action = clicked.getAttribute("data-action");
  if (!action) {
    return;
  }
  var li = clicked;
  while (li && !li.classList.contains("task")) {
    li = li.parentNode;
  }
  if (!li) {
    return;
  }
  var id = Number(li.getAttribute("data-id"));
  if (action === "toggle") {
    toggleTask(id);
  } else if (action === "edit") {
    editTask(id);
  } else if (action === "delete") {
    deleteTask(id);
  }
});

filtersNav.addEventListener("click", function (e) {
  var btn = e.target;
  while (btn && !btn.getAttribute("data-filter")) {
    btn = btn.parentNode;
  }
  if (!btn) {
    return;
  }
  setFilter(btn.getAttribute("data-filter"));
});

resetBtn.addEventListener("click", function () {
  if (confirm("Clear all tasks? This cannot be undone.")) {
    tasks = [];
    nextId = 1;
    saveTasks();
    render();
  }
});

loadTasks();
render();
updateClock();
setInterval(updateClock, 60000);
