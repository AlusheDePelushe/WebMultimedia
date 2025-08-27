// Función para obtener ping
async function getPing(ip) {
  try {
    const response = await fetch('http://localhost:3000/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });
    const data = await response.json();
    // Retornamos un objeto con alive y time
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

const addButton = document.querySelector('.add_button');
let tarjeta = 0;

addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP o hostname del servidor:");
  if (!ip) return alert("No se ingresó ninguna IP.");

  if (!isValidIP(ip)) {
    alert("Dirección IP inválida. Debe tener el formato XXX.XXX.XXX.XXX");
    return;
  }

  const ipNombre = prompt("Ingresa el nombre del servidor (opcional):");

  // 1️⃣ Insertar tarjeta
  const response = await fetch("partials/card.html");
  const template = await response.text();
  document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

  const header = document.getElementsByClassName('chart_container_header')[tarjeta];
  header.innerHTML = `ping: ${ip} | Estado: ...`;

  const container = document.getElementsByClassName('chart_container_body')[tarjeta];
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
    const result = await getPing(ip); // { alive, time }
    time++;

    chart.data.labels.push(`${result.time} ms`);
    chart.data.datasets[0].data.push(result.time);

    // Mantener últimos 20 puntos
    if (chart.data.labels.length > 15) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();

    // Semáforo según latencia
    if (!result.alive) {
        semaforo.style.backgroundColor = "red"; // no disponible = rojo
    } else if (result.time <= 350) {
        semaforo.style.backgroundColor = "green";
    } else if (result.time > 350 && result.time <= 800) {
        semaforo.style.backgroundColor = "yellow";
    } else {
        semaforo.style.backgroundColor = "orange"; // latencia alta
    }

    // Actualizar header con disponibilidad
    header.innerHTML = `ping: ${ip} | Estado: ${result.alive ? "Disponible" : "No disponible"} | ${ipNombre} `;

 if (!result.alive) {
    header.style.backgroundColor = "red"; // No disponible
} else {
    header.style.backgroundColor = "rgb(71, 38, 14)"; // color original si está disponible
}

  }, 1000);

  // Botón eliminar
  const removeBtn = document.getElementsByClassName('remove_button')[tarjeta];
  removeBtn.addEventListener('click', () => {
    clearInterval(interval);
    removeBtn.closest('.chart_container').remove();
  });

  tarjeta++;
});
