const webhookURL = "https://hook.eu1.make.com/kopbxnxuou21fq5jbiweywp32wj8eqk8";

// ===== Загрузка барберов =====
function loadBarbers() {
  const barberSelect = document.getElementById("barber");
  const barbers = JSON.parse(localStorage.getItem("barbers")) || [];

  barberSelect.innerHTML = '<option value="">Выберите барбера</option>';

  const normal = barbers.filter(b => b.category === "normal");
  const vip = barbers.filter(b => b.category === "vip");

  if (normal.length > 0) {
    const group = document.createElement("optgroup");
    group.label = "Обычные барберы";
    normal.forEach(b => {
      const option = document.createElement("option");
      option.value = b.name;
      option.textContent = b.name;
      group.appendChild(option);
    });
    barberSelect.appendChild(group);
  }

  if (vip.length > 0) {
    const group = document.createElement("optgroup");
    group.label = "VIP барберы (3+ года)";
    vip.forEach(b => {
      const option = document.createElement("option");
      option.value = b.name;
      option.textContent = "⭐ " + b.name;
      group.appendChild(option);
    });
    barberSelect.appendChild(group);
  }
}

// ===== Ограничение выбора даты (только сегодня и дальше) =====
const dateInput = document.getElementById("date");
const today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

// ===== Показ только свободных слотов =====
function updateAvailableTimes() {
  const barber = document.getElementById("barber").value;
  const date = document.getElementById("date").value;
  const timeSelect = document.getElementById("time");

  const allTimes = ["12:00", "13:00", "14:00", "15:00", "16:00"];

  if (!barber || !date) {
    timeSelect.innerHTML = '<option value="">Выберите время</option>';
    return;
  }

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const takenTimes = bookings
    .filter(b => b.Barber === barber && b.Date === date)
    .map(b => b.Time);

  timeSelect.innerHTML = '<option value="">Выберите время</option>';
  allTimes.forEach(t => {
    if (!takenTimes.includes(t)) {
      const option = document.createElement("option");
      option.value = t;
      option.textContent = t;
      timeSelect.appendChild(option);
    }
  });
}

document.getElementById("barber").addEventListener("change", updateAvailableTimes);
document.getElementById("date").addEventListener("change", updateAvailableTimes);

// ===== Сохранение имени и телефона для автозаполнения =====
window.addEventListener("load", function() {
  if (localStorage.getItem("userName")) {
    document.getElementById("name").value = localStorage.getItem("userName");
  }
  if (localStorage.getItem("userPhone")) {
    document.getElementById("phone").value = localStorage.getItem("userPhone");
  }
});

// ===== Отправка формы =====
document.getElementById("bookingForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    Name: document.getElementById("name").value,
    Phone: document.getElementById("phone").value,
    Barber: document.getElementById("barber").value,
    Date: document.getElementById("date").value,
    Time: document.getElementById("time").value
  };

  // ===== Сохраняем данные локально =====
  localStorage.setItem("userName", data.Name);
  localStorage.setItem("userPhone", data.Phone);

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(data);
  localStorage.setItem("bookings", JSON.stringify(bookings));

  // ===== Отправка в Make =====
  try {
    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    console.log("Отправлено в Make:", data);

    // ===== Показ сообщения об успехе =====
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "block";
    successMessage.classList.add("fadeIn");
    setTimeout(() => {
      successMessage.style.display = "none";
      successMessage.classList.remove("fadeIn");
    }, 4000);

    document.getElementById("bookingForm").reset();
    updateAvailableTimes(); // обновляем доступные слоты после записи

  } catch (error) {
    console.error("Ошибка отправки:", error);
    alert("Ошибка отправки заявки!");
  }
});

// ===== Запуск загрузки барберов =====
loadBarbers();