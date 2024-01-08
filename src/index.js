const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = require("http").createServer(app);
// const singleIo = new Server(server, {
// 	cors: {
// 		origin: true,
// 		credentials: true,
// 	},
// });

const groupIo = new Server(server, {
	cors: {
		origin: true,
		credentials: true,
	},
})


const clients = {};

const groupClients = {};

// singleIo.use((socket, next) => {
// 	const clientID = socket.handshake.auth.clientID;
// 	if (clientID) {
// 		console.log(socket.id);
// 		clients[clientID] = socket.id;
// 		next();
// 	} else {
// 		next(new Error("Invalid client ID"));
// 	}
// });

// singleIo.on("connection", (socket) => {
// 	socket.on("private message", ({ recipientID, message }) => {
// 		const recipientSocketId = clients[recipientID];
// 		if (recipientSocketId) {
// 			singleIo.to(recipientSocketId).emit("private message", message);
// 		} else {
// 			console.error("Recipient not found:", recipientID);
// 		}
// 	});
// 	socket.on("disconnect", () => {
// 		// Remove socket from the clients map upon disconnection
// 		const clientID = socket.handshake.auth.clientID;
// 		delete clients[clientID];
// 	});
// });


groupIo.use((socket, next) => {
	const clientID = socket.handshake.auth.clientID;
	if (clientID) {
		console.log(socket.id);
		clients[clientID] =socket.id
		next();
	} else {
		next(new Error("Invalid client ID"));
	}
});

groupIo.on("connection", (socket) => {
    // console.log(socket)
	socket.on("group message", ({ groupID, userId, message }) => {
		const recipientSocketId = groupClients[groupID];
		if (recipientSocketId) {
            recipientSocketId.forEach((id)=> groupIo.to(clients[id]).emit("group message",{userId:userId, message:message}))
		} else {
			console.error("Recipient not found:", groupID);
		}
	});
    socket.on("join", ({groupID, userId})=>{
        if(groupID in groupClients){
            groupClients[groupID] = [...groupClients[groupID], userId]
        }
        else{
            groupClients[groupID]  = [userId]
        }
    })
	socket.on("disconnect", () => {
		const groupID = socket.handshake.auth.groupID;
		// delete clients[groupID];
	});
});

server.listen(3000, () => {
	console.log("Server listening on port 3000");
});
