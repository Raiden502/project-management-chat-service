import express from "express";
import http from "http";
import cors from "cors";
import { initializeSockets } from "./socket/socket.js";

const app = express();
app.use(cors());
app.use(express.json());
// app.use("/api", router);
const server = http.createServer(app);
initializeSockets(server);

const { PORT, HOST } = process.env;

server.listen(PORT, HOST, () => {
	console.log("Server listening on port", PORT);
});
