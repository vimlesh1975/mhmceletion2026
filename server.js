// server.js
const express = require('express');
const next = require('next');
const http = require('http');
const socketIO = require('socket.io');

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();
require('dotenv').config({ path: './.env.local' });

let onlineCount = 0;
let connectedClients = []; // store all sockets

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


    io.on('connection', (socket) => {

        io.emit('test', "hello");


        const specialId = socket.handshake.query.specialId;
        if (specialId === "browser-abc-123") {
            connectedClients.push(socket.id);
            onlineCount++;
            io.emit('userCount', onlineCount);
        }

        socket.on('disconnectOthers', () => {
            connectedClients.forEach(id => {
                if (specialId === "browser-abc-123") {
                    if (id !== socket.id) {
                        io.sockets.sockets.get(id)?.disconnect(true);
                    }
                }

            });
            connectedClients = [socket.id]; // keep only this one
        });

        socket.on('ServerConnectionStatus', (data) => {
            io.emit('ServerConnectionStatus2', data);
        });



        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);

            if (specialId === "browser-abc-123") {
                setTimeout(() => {
                    if (!socket.connected) {
                        onlineCount--;
                        io.emit('userCount', onlineCount);
                    }
                }, 3000); // waits 3 seconds before reducing
            }

            socket.removeAllListeners();
            socket.removeAllListeners('ServerConnectionStatus');

        });

    });

    // server.all('*', (req, res) => handle(req, res));
    server.use((req, res) => { handle(req, res); });
    const PORT = 3000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
});