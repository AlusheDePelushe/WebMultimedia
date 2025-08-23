import express from "express";
const app = express();

// Serve funcionando desede el puerto 3000
const port = 3000;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "public/index.html");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

