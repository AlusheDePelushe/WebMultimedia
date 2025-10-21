// Función para obtener ping
async function getPing(ip) {
  try {
    //const baseUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
    const baseUrl = window.location.origin; //Variable para render.com

    const response = await fetch(`${baseUrl}/ping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });
    const data = await response.json();
    return {
      alive: data.alive,
      time: data.time !== null ? data.time : 999
    };
  } catch (err) {
    console.error('Error ping:', err);
    return { alive: false, time: 999 };
  }
}

// Validación IPv4
function isValidIP(ip) {
  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  return ipv4Regex.test(ip);
}

// Lista de servidores iniciales
const ipsIniciales = {
  "salida internet": "8.8.8.8",
  "Megacable": "177.231.5.169",
  "Alestra": "192.18.4.32",
  "Contpaq 1": "192.168.0.3",
  "Contpaq 2": "192.168.0.11"
};

// Función para crear tarjeta de monitoreo
async function crearTarjeta(ip, ipNombre = "") {
  // 1️⃣ Insertar tarjeta desde plantilla
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

  // 2️⃣ Ping en vivo
  let time = 0;
  const interval = setInterval(async () => {
    const result = await getPing(ip);
    time++;

    chart.data.labels.push(`${result.time} ms`);
    chart.data.datasets[0].data.push(result.time);

    if (chart.data.labels.length > 15) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    //chart.update();
    chart.update('none'); //cambio para render.com


    // Semáforo según latencia
    if (!result.alive) {
      semaforo.style.backgroundColor = "red";       // no disponible
    } else if (result.time <= 350) {
      semaforo.style.backgroundColor = "green";     // bueno
    } else if (result.time <= 800) {
      semaforo.style.backgroundColor = "yellow";    // medio
    } else {
      semaforo.style.backgroundColor = "orange";    // alto
    }

    // Header con disponibilidad
    header.innerHTML = `${ip}  ${result.alive ? "" : ""} | ${ipNombre}`;
    header.style.backgroundColor = result.alive ? "rgb(71, 38, 14)" : "red";
  //}, 1000);
  }, 3000); // parqa correr cada 3 segundos

  // 3️⃣ Botón eliminar
  const removeBtn = containerEl.querySelector('.remove_button');
  removeBtn.addEventListener('click', () => {
    clearInterval(interval);
    containerEl.remove();
  });
}

// 4️⃣ Cargar servidores iniciales al iniciar
window.addEventListener("DOMContentLoaded", () => {
  for (const [nombre, ip] of Object.entries(ipsIniciales)) {
    crearTarjeta(ip, nombre);
  }
});

// 5️⃣ Botón para añadir servidores manualmente
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
