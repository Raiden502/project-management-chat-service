import { queryDatabase } from "../db/queryDb.js";
import { DisconnectSocket, GroupMessage, PrivateMessage } from "./handler.js";
import { socketIO } from "./socket.js";

const SocketMiddleware = async (socket, next) => {
	const clientID = socket.handshake.auth.clientID;
	if (clientID) {
		const query = {
			name: "set-socket",
			text: "update users_info set socket_id = $1, onlinestatus=true where user_id = $2",
			values: [socket.id, clientID],
		};
		const query2 = {
			name: "notify-online",
			text: " select user_id, onlinestatus, socket_id from users_info where user_id != $1 and socket_id notnull",
			values: [clientID],
		};
		try {
			const data = await queryDatabase(query);
			const data2 = await queryDatabase(query2);
			data2.forEach((item) =>
				socketIO.to(item.socket_id).emit("online-status", {
					recipientID: clientID,
					onlinestatus: true,
				})
			);
			next();
		} catch (error) {
			next(new Error(error));
		}
	} else {
		next(new Error("Invalid client ID"));
	}
};

const SocketConnection = (socket) => {
	socket.on(
		"private message",
		({ recipientID, message, userId, type, username, avatar }) => {
			if (type == "normal") {
				console.log("emits");
				PrivateMessage({ recipientID, message, userId });
			} else {
				GroupMessage({
					recipientID,
					userId,
					message,
					username,
					avatar,
				});
			}
		}
	);
	socket.on("join", ({ groupID, userId }) => {
		console.log("temperary checking");
	});
	socket.on("disconnect", () => {
		const clientID = socket.handshake.auth.clientID;
		if (clientID) {
			DisconnectSocket(clientID);
		} else {
			console.log("invalid id");
		}
	});
};

export { SocketMiddleware, SocketConnection };
