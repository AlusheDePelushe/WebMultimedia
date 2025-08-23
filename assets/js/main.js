const addButton = document.querySelector('.add_button');
let tarjeta = 0;

addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP del dispositivo:");
  if (ip) {
    // 1️⃣ Insertar la tarjeta
    const response = await fetch("partials/card.html");
    const template = await response.text();
    document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

    // 2️⃣ Actualizar cabecera
    document.getElementsByClassName('chart_container_header')[tarjeta].innerHTML = `ping: ${ip}`;

    // 3️⃣ Seleccionar canvas
    const container = document.getElementsByClassName('chart_container_body')[tarjeta];
    const canvas = container.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    // 4️⃣ Crear gráfico
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
        animation: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { title: { display: true, text: "Tiempo (s)" } },
          y: { title: { display: true, text: "ms" }, min: 0, max: 200 }
        }
      }
    });

    // 5️⃣ Simular datos en vivo
    let time = 0;
    const interval = setInterval(() => {
      const latency = Math.floor(Math.random() * (150 - 10 + 1)) + 10; // 10–150 ms
      time++;
      chart.data.labels.push(`${time}s`);
      chart.data.datasets[0].data.push(latency);

      if (chart.data.labels.length > 20) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      chart.update();


      const values = chart.data.datasets[0].data;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;

      const semaforo = container.querySelector(".semaforo");

      //configurar los valores del semáforo
      if (avg <= 75) {
      semaforo.style.backgroundColor = "green";
      } else if (avg > 75 && avg <= 125) {
      semaforo.style.backgroundColor = "yellow";
      } else {
      semaforo.style.backgroundColor = "red";
      }

    }, 1000);

    // 6️⃣ Botón eliminar
    const removeBtn = document.getElementsByClassName('remove_button')[tarjeta];
    removeBtn.addEventListener('click', () => {
      clearInterval(interval);
      removeBtn.closest('.chart_container').remove();
    });

    tarjeta++;
  } else {
    alert("No se ingresó ninguna dirección IP.");
  }
});
