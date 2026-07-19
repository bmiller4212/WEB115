document.addEventListener("DOMContentLoaded", function () {
    // Variables and constants

    let taskList = [];
    let sortState = {};
    let nextId = 0;

    const priorityRank = { low: 1, medium: 2, high: 3 };
    const ARROWS = {
        neutral: "⮁",
        asc: "⮝",
        desc: "⮟"
    };

    // Event Listeners
    document.getElementById("add-task-btn").addEventListener("click", addTask);

    window.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    });

    // Event delegation for dynamically created delete buttons
    document.getElementById("taskmanager").addEventListener("click", function (event) {
        if (event.target.classList.contains("delete-task-btn")) {
            const id = Number(event.target.dataset.id);
            deleteTask(id);
        }
    });

    // Event delegation for dynamically created completed checkboxes
    document.getElementById("taskmanager").addEventListener("change", function (event) {
        if (event.target.classList.contains("complete-toggle")) {
            const row = event.target.closest(".task-row");
            const id = Number(row.dataset.id);
            toggleCompleted(id);
        }
    });

    // Column sort buttons exist on page load, so no delegation needed here
    document.querySelectorAll(".filter-btns").forEach(function (btn) {
        btn.addEventListener("click", function () {
            const colName = this.id.replace("-filter-btn", "");
            sortBy(colName);
        });
    });

    // Capitalizes first char of a string.
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    // Adds the task to the task list
    function addTask() {
        const name = document.getElementById("task-name-input").value;
        const priority = document.getElementById("task-priority-input").value;
        const isImportant = document.getElementById("task-important-toggle").checked;

        // Empty field alert
        if (name.trim() === "") {
            alert("Task name cannot be empty");
            return;
        }

        const newTask = {
            id: nextId++,
            name: name,
            priority: priority,
            isImportant: isImportant,
            isCompleted: false,
            date: new Date().toLocaleDateString()
        };
        // Add object to list and output to console
        taskList.push(newTask);
        console.log(JSON.stringify(taskList, null, 2));
        createRow(newTask);

        document.getElementById("input-form").reset();
    }

    // Removes a task from list
    function deleteTask(id) {
        taskList = taskList.filter(task => task.id !== id);
        console.log(JSON.stringify(taskList, null, 2));

        const row = document.querySelector(`.task-row[data-id="${id}"]`);
        const divider = document.querySelector(`.task-dvdr[data-id="${id}"]`);
        if (row) row.remove();
        if (divider) divider.remove();
    }

    // Toggles completion state for targeted row
    function toggleCompleted(id) {
        const task = taskList.find(task => task.id === id);
        if (task) {
            task.isCompleted = !task.isCompleted;
            console.log(JSON.stringify(taskList, null, 2));

            const row = document.querySelector(`.task-row[data-id="${id}"]`);
            const targets = row.querySelectorAll(".task-name, .task-priority, .task-date");
            targets.forEach(el => {
                el.style.textDecoration = task.isCompleted ? "line-through" : "none";
            });
        }
    }

    // Creates a new HTML row and divider and attackes to the doc
    function createRow(task) {
        const rowHtml = `
            <div class="task-row" data-id="${task.id}">
                <div class="task-col task-name">${capitalize(task.name)}</div>
                <div class="task-col task-priority">Priority: ${capitalize(task.priority)}</div>
                <div class="task-col task-date">${task.date}</div>
                <div class="task-col task-actions">
                    <input type="checkbox" class="complete-toggle" ${task.isCompleted ? "checked" : ""}> Done
                    <button class="delete-task-btn" data-id="${task.id}">Delete</button>
                </div>
            </div>
            <hr class="task-dvdr" data-id="${task.id}">
        `;

        document.getElementById("taskmanager").insertAdjacentHTML("beforeend", rowHtml);

        const row = document.querySelector(`.task-row[data-id="${task.id}"]`);

        // Highlighting for important tasks
        if (task.isImportant) {
            row.style.backgroundColor = "red";
        }
 
        // Strikethrough completed tasks
        if (task.isCompleted) {
            row.querySelectorAll(".task-name, .task-priority, .task-date").forEach(el => {
                el.style.textDecoration = "line-through";
            });
        }
    }

    // Empties and refills the task manager with the new order
    function reorderRows() {
        document.getElementById("taskmanager").innerHTML = "";
        taskList.forEach(task => createRow(task));
    }

    // Matches the sorting arrow to the sorting direction for each field
    function updateArrow(colName, direction) {
        const btn = document.getElementById(`${colName}-filter-btn`);
        if (!btn) return;
        const h5 = btn.querySelector("h5");
        const target = h5 || btn;
        const baseText = target.textContent.replace(/\s*[⮁⮟⮝]\s*$/, "").trim();
        target.textContent = `${baseText} ${ARROWS[direction]}`;
    }

    // Sorting function to reorder list based on columns
    function sortBy(colName) {
        sortState[colName] = sortState[colName] === "asc" ? "desc" : "asc";
        const direction = sortState[colName];

        taskList.sort((a, b) => {
            let valA, valB;

            // Filter for each column's name and directionality
            if (colName === "options") {
                valA = a.isCompleted;
                valB = b.isCompleted;
            } else if (colName === "importance" || colName === "important") {
                valA = a.isImportant;
                valB = b.isImportant;
            } else if (colName === "priority") {
                valA = priorityRank[a.priority];
                valB = priorityRank[b.priority];
            } else {
                valA = a[colName];
                valB = b[colName];
            }

            if (typeof valA === "string") {
                valA = valA.toLowerCase();
                valB = valB.toLowerCase();
            }

            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        });

        // reorganize the list according to the new sort order
        reorderRows();
        // log the current task list
        console.log(JSON.stringify(taskList, null, 2));

        // reset every column header back to neutral arrow
        document.querySelectorAll(".filter-btns").forEach(function (btn) {
            const id = btn.id.replace("-filter-btn", "");
            updateArrow(id, "neutral");
        });

        // then set the arrow for just the column that was clicked
        updateArrow(colName, direction);
    }
});