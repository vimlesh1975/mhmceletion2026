// server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIO = require('socket.io');

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();
require('dotenv').config({ path: './.env.local' });

app.prepare().then(async () => {
    const server = express();
    const httpServer = http.createServer(server);
    const io = socketIO(httpServer, {
        cors: {
            origin: "*", // Allow this origin
            methods: ["GET", "POST"], // Allow these methods
            allowedHeaders: ["my-custom-header"], // If needed, add custom headers
            credentials: true // Allow cookies if necessary
        },
    });


    const axios = require("axios");

    async function getSheetFromAPI() {
        const res = await axios.get("http://localhost:3000/api/google-sheet");
        return res.data;
    }

    io.on("connection", (socket) => {

        socket.on("getSheetData", async () => {
            try {
                const data = await getSheetFromAPI();
                socket.emit("sheetData", data);
            } catch (err) {
                socket.emit("sheetError", "API error");
            }
        });

    });


    // server.all('*', (req, res) => handle(req, res));
    server.use((req, res) => { handle(req, res); });
    const PORT = 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});