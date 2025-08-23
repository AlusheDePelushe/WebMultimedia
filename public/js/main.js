async function getPing(ip) {
  try {
    const response = await fetch('http://localhost:3000/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });
    const data = await response.json();
    // Si devuelve null o error, ponemos 999 para indicar fallo
    return data.time !== null ? data.time : 999;
  } catch (err) {
    console.error('Error ping:', err);
    return 999;
  }
}

const addButton = document.querySelector('.add_button');
let tarjeta = 0;

addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP o hostname del servidor:");
  if (!ip) return alert("No se ingresó ninguna IP.");

  // 1️⃣ Insertar tarjeta
  const response = await fetch("partials/card.html");
  const template = await response.text();
  document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

  document.getElementsByClassName('chart_container_header')[tarjeta].innerHTML = `ping: ${ip}`;

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
    const latency = await getPing(ip);
    time++;

    chart.data.labels.push(`${time}s`);
    chart.data.datasets[0].data.push(latency);

    // Mantener últimos 20 puntos
    if (chart.data.labels.length > 20) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }
    chart.update();

    // Semáforo según latencia
    if (latency <= 350) semaforo.style.backgroundColor = "green";
    else if (latency > 350 && latency <= 800) semaforo.style.backgroundColor = "yellow";
    else semaforo.style.backgroundColor = "red";

  }, 1000);

  // Botón eliminar
  const removeBtn = document.getElementsByClassName('remove_button')[tarjeta];
  removeBtn.addEventListener('click', () => {
    clearInterval(interval);
    removeBtn.closest('.chart_container').remove();
  });

  tarjeta++;
});
