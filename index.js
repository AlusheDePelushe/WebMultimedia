import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import ping from 'ping';
import axios from 'axios';   // 👈 Import correcto para Telegram

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = dirname(fileURLToPath(import.meta.url));

// Servir archivos estáticos desde public
app.use(express.static(__dirname + '/public'));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// --- Configuración de Telegram ---
const TELEGRAM_TOKEN = "8370192775:AAHyWl5YRfP_g1LhOGUeY0GvPyKSYo2CYSM";
const CHAT_ID = "5650732945";

// Función para enviar mensaje
/*async function sendTelegramMessage(message) {
  try {
    if (!message || message.trim() === "") {
      message = "⚠️ Alerta: mensaje vacío recibido";
    }

    const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });

    console.log("✅ Mensaje enviado:", response.data);
  } catch (err) {
    console.error("❌ Error enviando mensaje a Telegram:");
    console.error(err.response?.data || err.message);
  }
}*/

// --- Endpoint de ping ---
app.post('/ping', async (req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: 'No IP provided' });

  try {
    const result = await ping.promise.probe(ip);
    const latency = result.time === 'unknown' ? null : parseFloat(result.time);

    // 🚨 Aviso en Telegram si la IP no responde
    if (!result.alive) {
      await sendTelegramMessage(`⚠️ La IP ${ip} no responde. Posible caída de red.`);
    }

    res.json({ alive: result.alive, time: latency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Iniciar servidor ---
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor ping corriendo en http://localhost:${port}`);
  //sendTelegramMessage("🚀 Servidor iniciado correctamente");
});

// Opción si quieres exponer en toda la red
// app.listen(port, '0.0.0.0', () => console.log(`Servidor corriendo en http://<IP>:${port}`));
