document.addEventListener("DOMContentLoaded", () => {
  const taskForm = document.getElementById("taskForm");
  const taskName = document.getElementById("taskName");
  const taskDate = document.getElementById("taskDate");
  const taskPriority = document.getElementById("taskPriority");
  const searchInput = document.getElementById("search");

  const taskSections = {
    faible: document.querySelector("#faible .task-list"),
    moyenne: document.querySelector("#moyenne .task-list"),
    élevée: document.querySelector("#élevée .task-list"),
    archive: document.querySelector("#archive .task-list")
  };

  // Sauvegarde dans localStorage
  function saveTasks() {
    const tasks = [];
    document.querySelectorAll(".task-item").forEach(task => {
      tasks.push({
        name: task.querySelector(".name").innerText,
        date: task.querySelector(".date").innerText,
        priority: task.dataset.priority,
        done: task.querySelector(".done-checkbox").checked,
        archived: task.closest("section").id === "archive"
      });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function loadTasks() {
    const saved = JSON.parse(localStorage.getItem("tasks")) || [];
    saved.forEach(task =>
      createTask(task.name, task.date, task.priority, task.done, task.archived)
    );
  }

  // Crée une tâche DOM
  function createTask(name, date, priority, done = false, archived = false) {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.priority = priority;

    li.innerHTML = `
      <label class="task-label">
        <input type="checkbox" class="done-checkbox" ${done ? "checked" : ""} />
        <span class="name">${name}</span>
        <span class="date">${date}</span>
      </label>
      <input type="checkbox" class="select-checkbox" title="Sélectionner pour action" />
    `;

    if (done) {
  li.classList.add("done");
  li.querySelector(".done-checkbox").checked = true;
}

    const section = archived ? taskSections.archive : taskSections[priority];
    section.appendChild(li);
    li.querySelector('.done-checkbox').addEventListener('change', e => updateTaskStyle(e.target));
    saveTasks();
    updateVisibility();
  }

  // Barre ou débarrer une tâche selon l'état "accompli"
  function updateTaskStyle(checkbox) {
    const task = checkbox.closest(".task-item");
    if (checkbox.checked) {
      task.classList.add("done");
    } else {
      task.classList.remove("done");
    }
    saveTasks();
  }

  // Sélection personnalisée (utilise les .select-checkbox maintenant)
  const getSelected = () =>
    [...document.querySelectorAll(".task-item .select-checkbox:checked")].map(cb =>
      cb.closest(".task-item")
    );

  // Gérer l'affichage des tâches visibles
  function updateVisibility() {
    document.querySelectorAll(".task-list").forEach(list => {
      const items = list.querySelectorAll("li");
      items.forEach((el, i) => {
        el.style.display = list.classList.contains("show-all") || i === 0 ? "flex" : "none";
      });
    });
  }

  // Ajouter une tâche
  taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = taskName.value.trim();
    const date = taskDate.value;
    const priority = taskPriority.value;

    if (!name || !date || !priority) return;

    createTask(name, date, priority);
    taskName.value = "";
    taskDate.value = "";
    taskPriority.value = "";
  });

  // Voir tout / Voir moins
  document.querySelectorAll(".toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const list = btn.previousElementSibling;
      list.classList.toggle("show-all");
      btn.textContent = list.classList.contains("show-all") ? "Voir moins" : "Voir tout";
      updateVisibility();
    });
  });

  // Recherche
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll(".task-item").forEach(item => {
      const name = item.querySelector(".name").innerText.toLowerCase();
      item.style.display = name.includes(query) ? "flex" : "none";
    });
  });

  // Actions groupées
  document.getElementById("deleteSelected").addEventListener("click", () => {
    const toDelete = getSelected();
    if (toDelete.length === 0) return;
    if (confirm("Voulez-vous vraiment supprimer les tâches sélectionnées ?")) {
      toDelete.forEach(task => {
        task.classList.add("fade-out");
        setTimeout(() => task.remove(), 300);
      });
      setTimeout(saveTasks, 350);
    }
  });

  document.getElementById("archiveSelected").addEventListener("click", () => {
    const selected = getSelected();
    if (selected.length === 0) return;
    if (confirm("Voulez-vous archiver les tâches sélectionnées ?")) {
      selected.forEach(task => taskSections.archive.appendChild(task));
      updateVisibility();
      saveTasks();
    }
  });

  document.getElementById("restoreSelected").addEventListener("click", () => {
    getSelected().forEach(task => {
      const p = task.dataset.priority;
      taskSections[p].appendChild(task);
    });
    updateVisibility();
    saveTasks();
  });

  document.getElementById("unarchiveSelected").addEventListener("click", () => {
    getSelected().forEach(task => {
      const p = task.dataset.priority;
      taskSections[p].appendChild(task);
    });
    updateVisibility();
    saveTasks();
  });

  // Gestion du changement de case à cocher
  document.addEventListener("change", e => {
    if (e.target.matches(".done-checkbox")) {
      updateTaskStyle(e.target);
    }
  });

  // Initialiser
  loadTasks();
  updateVisibility();
});