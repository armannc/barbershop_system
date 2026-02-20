// ===== Загрузка и отображение барберов =====
function loadAdminBarbers() {
  const list = document.getElementById("barberList");
  const barbers = JSON.parse(localStorage.getItem("barbers")) || [];

  list.innerHTML = "";

  if (barbers.length === 0) {
    list.innerHTML = "<p>Барберлер жоқ</p>";
    return;
  }

  barbers.forEach((b, index) => {
    const div = document.createElement("div");
    div.className = "barber-item";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "8px 12px";
    div.style.background = "#2b2b2b";
    div.style.borderRadius = "8px";
    div.style.marginBottom = "8px";

    // Минималистичный delete + edit
    div.innerHTML = `
      <span>
        ${b.category === "vip" ? "⭐ " : ""}${b.name} — ${b.experience} ${b.experience == 1 ? "год" : "лет"}
      </span>
      <div>
        <button class="edit-btn" onclick="editBarber(${index})">✏️</button>
        <button class="delete-btn" onclick="deleteBarber(${index})">🗑️</button>
      </div>
    `;

    list.appendChild(div);
  });
}

// ===== Добавление нового барбера =====
function addBarber() {
  const name = document.getElementById("newBarberName").value.trim();
  const experience = parseInt(document.getElementById("barberExperience").value.trim());

  if (!name || isNaN(experience) || experience < 0) {
    return alert("Введите имя и корректный стаж (год)");
  }

  const category = experience >= 3 ? "vip" : "normal";

  const barbers = JSON.parse(localStorage.getItem("barbers")) || [];
  barbers.push({ name, experience, category });
  localStorage.setItem("barbers", JSON.stringify(barbers));

  document.getElementById("newBarberName").value = "";
  document.getElementById("barberExperience").value = "";

  loadAdminBarbers();
}

// ===== Удаление барбера =====
function deleteBarber(index) {
  const barbers = JSON.parse(localStorage.getItem("barbers")) || [];
  const removedBarber = barbers.splice(index, 1)[0]; // барберді өшіру
  localStorage.setItem("barbers", JSON.stringify(barbers));

  // ===== Сол барберге арналған клиент жазбаларын өшіру =====
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings = bookings.filter(b => b.Barber !== removedBarber.name);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // ===== Обновляем отображение =====
  loadAdminBarbers();   // барберлер тізімі
  loadBookings();       // клиент жазбалары
}
// ===== Редактирование барбера =====
function editBarber(index) {
  const barbers = JSON.parse(localStorage.getItem("barbers")) || [];
  const barber = barbers[index];

  const newName = prompt("Введите новое имя:", barber.name);
  if (!newName) return;

  const newExperience = parseInt(prompt("Введите стаж в годах:", barber.experience));
  if (isNaN(newExperience) || newExperience < 0) return alert("Неверный стаж!");

  barber.name = newName;
  barber.experience = newExperience;
  barber.category = newExperience >= 3 ? "vip" : "normal";

  localStorage.setItem("barbers", JSON.stringify(barbers));
  loadAdminBarbers();
}

// ===== Загрузка записей клиентов =====
function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  let container = document.getElementById("bookingList");

  if (bookings.length === 0) {
    container.innerHTML = "<p>Записей нет</p>";
    return;
  }

  // ===== Сортировка по полной дате и времени =====
  bookings.sort((a, b) => {
    // Создаем Date объекты для полной даты и времени
    const dateTimeA = new Date(`${a.Date}T${a.Time}:00`);
    const dateTimeB = new Date(`${b.Date}T${b.Time}:00`);
    return dateTimeA - dateTimeB; // ближайшие даты/время сверху
  });

  // ===== Создаем таблицу =====
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const header = document.createElement("tr");
  ["Имя", "Телефон", "Барбер", "Дата", "Время"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    th.style.border = "1px solid #ccc";
    th.style.padding = "5px";
    th.style.background = "#333";
    th.style.color = "#f39c12";
    header.appendChild(th);
  });
  table.appendChild(header);

  bookings.forEach(b => {
    const row = document.createElement("tr");
    [b.Name, b.Phone, b.Barber, b.Date, b.Time].forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      td.style.border = "1px solid #ccc";
      td.style.padding = "5px";
      td.style.textAlign = "center";
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  container.innerHTML = "";
  container.appendChild(table);
}

// ===== Инициализация =====
window.addEventListener("load", () => {
  loadAdminBarbers();
  loadBookings();
});