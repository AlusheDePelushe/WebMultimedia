import express from 'express';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors';
import ping from 'ping';

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

// Endpoint para ping
app.post('/ping', async (req, res) => {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ error: 'No IP provided' });

    try {
        const result = await ping.promise.probe(ip);
        const latency = result.time === 'unknown' ? null : parseFloat(result.time);
        res.json({ alive: result.alive, time: latency });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


const port = 3000;
app.listen(port, () => console.log(`Servidor ping corriendo en http://localhost:${port}`));

//app.listen(port, '0.0.0.0', () => console.log(`Servidor corriendo en http://<IP>:${port}`));
