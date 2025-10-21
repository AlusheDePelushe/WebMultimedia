// ------------------------
// script.js (versión demo)
// ------------------------

// Función para generar "ping" aleatorio
function getPing(ip) {
  const alive = Math.random() > 0.1; // 90% chance de estar vivo
  const time = alive ? Math.floor(Math.random() * 500) : 999; // Latencia 0-500ms
  return { alive, time };
}

// Validación IPv4
function isValidIP(ip) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return ipv4Regex.test(ip);
}

// Lista de servidores iniciales para demo
const ipsIniciales = {
  "Google DNS": "8.8.8.8",
  "Cloudflare DNS": "1.1.1.1",
  "OpenDNS": "208.67.222.222"
};

// Función para crear tarjeta de monitoreo
async function crearTarjeta(ip, ipNombre = "") {
  const response = await fetch("partials/card.html");
  const template = await response.text();
  document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

  const containerEl = document.querySelector(".body_container").lastElementChild;
  const header = containerEl.querySelector('.chart_container_header');
  const container = containerEl.querySelector('.chart_container_body');
  const canvas = container.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: `Latencia ${ip}`,
        data: [],
        borderColor: "blue",
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false
    }
  });

  const semaforo = container.querySelector(".semaforo");

  // Intervalo de actualización simulado
  const interval = setInterval(() => {
    const result = getPing(ip);

    chart.data.labels.push(`${result.time} ms`);
    chart.data.datasets[0].data.push(result.time);

    if (chart.data.labels.length > 15) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update('none');

    // Semáforo según latencia
    if (!result.alive) semaforo.style.backgroundColor = "red";
    else if (result.time <= 350) semaforo.style.backgroundColor = "green";
    else if (result.time <= 800) semaforo.style.backgroundColor = "yellow";
    else semaforo.style.backgroundColor = "orange";

    header.innerHTML = `${ip} | ${ipNombre}`;
    header.style.backgroundColor = result.alive ? "rgb(71, 38, 14)" : "red";
  }, 1500); // cada 1.5 segundos

  // Botón eliminar
  const removeBtn = containerEl.querySelector('.remove_button');
  removeBtn.addEventListener('click', () => {
    clearInterval(interval);
    containerEl.remove();
  });
}

// Inicializar tarjetas al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  for (const [nombre, ip] of Object.entries(ipsIniciales)) {
    crearTarjeta(ip, nombre);
  }
});

// Botón para añadir servidores manualmente
const addButton = document.querySelector('.add_button');
addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP del servidor:");
  if (!ip) return alert("No se ingresó ninguna IP.");

  if (!isValidIP(ip)) {
    alert("Dirección IP inválida. Debe tener el formato XXX.XXX.XXX.XXX");
    return;
  }

  const ipNombre = prompt("Ingresa el nombre del servidor (opcional):");
  crearTarjeta(ip, ipNombre);
});
