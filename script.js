const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-completed");

let todos = loadTodos();

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  list.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = todo.done ? "done" : "";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todo.done = checkbox.checked;
      saveTodos();
      render();
    });

    const text = document.createElement("span");
    text.textContent = todo.text;
    text.addEventListener("click", () => {
      todo.done = !todo.done;
      saveTodos();
      render();
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "✕";
    remove.setAttribute("aria-label", `Delete ${todo.text}`);
    remove.addEventListener("click", () => {
      todos = todos.filter((t) => t.id !== todo.id);
      saveTodos();
      render();
    });

    li.append(checkbox, text, remove);
    list.appendChild(li);
  });

  const left = todos.filter((t) => !t.done).length;
  countEl.textContent = `${left} item${left === 1 ? "" : "s"} left`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  render();

  input.value = "";
  input.focus();
});

clearBtn.addEventListener("click", () => {
  todos = todos.filter((t) => !t.done);
  saveTodos();
  render();
});

render();
