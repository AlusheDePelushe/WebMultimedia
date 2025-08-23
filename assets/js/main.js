import Chart from 'chart.js/auto';

const addButton = document.querySelector('.add_button');
let tarjeta = 0;

addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP del dispositivo:");
  if (ip) {
    // 1️⃣ Insertar la tarjeta
    const response = await fetch("main/partials/card.html");
    const template = await response.text();
    document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

    // 2️⃣ Actualizar cabecera
    document.getElementsByClassName('chart_container_header')[tarjeta].innerHTML = `ping: ${ip}`;

    // 3️⃣ Crear gráfica en el canvas de la tarjeta recién creada
    const container = document.getElementsByClassName('chart_container_body')[tarjeta];
    const canvas = container.querySelector("canvas");

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ["1s", "2s", "3s", "4s", "5s"],
        datasets: [{
          label: `Latencia ${ip}`,
          data: [20, 40, 35, 50, 30], // valores de ejemplo
          borderColor: "blue",
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        }
      }
    });

    tarjeta++;
  } else {
    alert("No se ingresó ninguna dirección IP.");
  }
});
