const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-completed");
const filtersEl = document.getElementById("filters");
const emptyEl = document.getElementById("empty-message");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return stored.map((t) => ({
      id: t.id,
      text: t.text,
      done: Boolean(t.done),
      due: t.due || "",
    }));
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function formatDue(due) {
  const today = todayIso();
  if (due === today) return "Due today";
  if (due < today) return `Overdue — ${due}`;
  return `Due ${due}`;
}

function visibleTodos() {
  if (currentFilter === "active") return todos.filter((t) => !t.done);
  if (currentFilter === "completed") return todos.filter((t) => t.done);
  return todos;
}

function startEditing(todo, textEl) {
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;

  const commit = () => {
    const value = editInput.value.trim();
    if (value) todo.text = value;
    saveTodos();
    render();
  };

  editInput.addEventListener("blur", commit);
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      render();
    }
  });

  textEl.replaceWith(editInput);
  editInput.focus();
  editInput.select();
}

function render() {
  list.innerHTML = "";

  visibleTodos().forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", `Toggle ${todo.text}`);
    checkbox.addEventListener("change", () => {
      todo.done = checkbox.checked;
      saveTodos();
      render();
    });

    const body = document.createElement("div");
    body.className = "body";

    const text = document.createElement("button");
    text.type = "button";
    text.className = "text";
    text.textContent = todo.text;
    text.title = "Click to edit";
    text.setAttribute("aria-label", `Edit ${todo.text}`);
    text.addEventListener("click", () => startEditing(todo, text));

    body.appendChild(text);

    if (todo.due) {
      const meta = document.createElement("span");
      meta.className = "meta";
      meta.textContent = formatDue(todo.due);
      if (!todo.done && todo.due < todayIso()) {
        meta.classList.add("overdue");
      }
      body.appendChild(meta);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", `Delete ${todo.text}`);
    remove.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveTodos();
      render();
    });

    li.append(checkbox, body, remove);
    list.appendChild(li);
  });

  const shown = visibleTodos().length;
  emptyEl.hidden = shown !== 0;
  emptyEl.textContent =
    todos.length === 0
      ? "No tasks yet — add one above."
      : "No tasks match this filter.";

  const left = todos.filter((t) => !t.done).length;
  countEl.textContent = `${left} item${left === 1 ? "" : "s"} left`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({
    id: Date.now(),
    text,
    done: false,
    due: dateInput.value || "",
  });
  saveTodos();
  render();

  input.value = "";
  dateInput.value = "";
  input.focus();
});

filtersEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) return;

  currentFilter = btn.dataset.filter;
  filtersEl
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.toggle("active", b === btn));
  render();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
});

render();
