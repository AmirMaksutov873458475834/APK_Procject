<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Todo App Dark</title>
  <style>
    :root {
      --bg: #0f1115;
      --card: #171a21;
      --text: #e6e6e6;
      --muted: #9aa4b2;
      --accent: #6c5ce7;
      --danger: #ff4d4d;
    }

    * {
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 16px;
    }

    .app {
      width: 100%;
      max-width: 520px;
      background: var(--card);
      padding: 20px;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }

    h1 {
      margin: 0 0 16px;
      font-size: 24px;
      text-align: center;
    }

    .input-row {
      display: flex;
      gap: 10px;
    }

    input {
      flex: 1;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid #2a2f3a;
      background: #0d0f14;
      color: var(--text);
      outline: none;
      font-size: 14px;
    }

    button {
      padding: 12px 16px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      background: var(--accent);
      color: white;
      font-weight: bold;
      transition: 0.2s;
      white-space: nowrap;
    }

    button:hover {
      opacity: 0.9;
    }

    ul {
      list-style: none;
      padding: 0;
      margin-top: 20px;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: #11131a;
      margin-bottom: 10px;
      border-radius: 10px;
      gap: 10px;
    }

    .task-text {
      flex: 1;
      cursor: pointer;
      word-break: break-word;
    }

    .done {
      text-decoration: line-through;
      color: var(--muted);
    }

    .delete {
      background: var(--danger);
      border: none;
      padding: 6px 10px;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      flex-shrink: 0;
    }

    .footer {
      margin-top: 10px;
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }

    /* 📱 АДАПТИВНОСТЬ */
    @media (max-width: 600px) {
      body {
        padding: 20px 10px;
      }

      .app {
        padding: 15px;
        border-radius: 12px;
      }

      h1 {
        font-size: 20px;
      }

      .input-row {
        flex-direction: column;
      }

      button {
        width: 100%;
      }

      li {
        flex-direction: column;
        align-items: flex-start;
      }

      .delete {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <h1>📝 Todo App</h1>

    <div class="input-row">
      <input id="taskInput" placeholder="Введите задачу..." />
      <button onclick="addTask()">Добавить</button>
    </div>

    <ul id="taskList"></ul>

    <div class="footer">Хранение: localStorage (мини-база данных)</div>
  </div>

  <script>
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function save() {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function render() {
      const list = document.getElementById('taskList');
      list.innerHTML = '';

      tasks.forEach((task, index) => {
        const li = document.createElement('li');

        const span = document.createElement('span');
        span.className = 'task-text ' + (task.done ? 'done' : '');
        span.textContent = task.text;
        span.onclick = () => toggleTask(index);

        const btn = document.createElement('button');
        btn.textContent = 'Удалить';
        btn.className = 'delete';
        btn.onclick = () => deleteTask(index);

        li.appendChild(span);
        li.appendChild(btn);
        list.appendChild(li);
      });
    }

    function addTask() {
      const input = document.getElementById('taskInput');
      const text = input.value.trim();

      if (!text) return;

      tasks.push({ text, done: false });
      input.value = '';

      save();
      render();
    }

    function toggleTask(index) {
      tasks[index].done = !tasks[index].done;
      save();
      render();
    }

    function deleteTask(index) {
      tasks.splice(index, 1);
      save();
      render();
    }

    render();
  </script>
</body>
</html>
