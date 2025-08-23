import express from "express";
const app = express();

// Serve funcionando desede el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log('Server running on http://localhost:{port}}');
});
