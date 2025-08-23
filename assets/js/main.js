const addButton = document.querySelector('.add_button');
let tarjeta = 0;

addButton.addEventListener('click', async () => {
  const ip = prompt("Introduce la dirección IP del dispositivo:");
  if (ip) {
    // 1️⃣ Insertar primero la tarjeta desde el partial
    const response = await fetch("partials/card.html");
    const template = await response.text();
    document.querySelector(".body_container").insertAdjacentHTML("beforeend", template);

    // 2️⃣ Luego modificar la cabecera de la tarjeta recién insertada
    document.getElementsByClassName('chart_container_header')[tarjeta].innerHTML = `ping: ${ip}`;
    tarjeta++;

  } else {
    alert("No se ingresó ninguna dirección IP.");
  }
});