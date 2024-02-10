import { queryDatabase } from "../db/queryDb.js";
import { socketIO } from "./socket.js";

const GroupMessage = async ({
	recipientID,
	userId,
	message,
	username,
	avatar,
}) => {
	const query = {
		name: "set-group-message",
		text: "insert into messages(message_id, sender_id, group_id, message) VALUES($1, $2, $3, $4)",
		values: [
			`${Date.now()}${Math.floor(Math.random() * 1000)}`,
			userId,
			recipientID,
			message,
		],
	};

	const groupquery = {
		name: "send-group-message",
		text: "select u.socket_id from users_info u join group_members m on m.user_id=u.user_id where m.group_id=$1 and u.socket_id!='' and u.user_id!=$2 ",
		values: [recipientID, userId],
	};

	try {
		const messageInsert = await queryDatabase(query);
		const data = await queryDatabase(groupquery);
		data.forEach((item) =>
			socketIO.to(item.socket_id).emit("private message", {
				userId: recipientID,
				message: message,
				recipientID: userId,
				date: new Date().toLocaleString(),
				username: username,
				avatar,
			})
		);
	} catch (error) {
		console.error("error unable to insert");
	}
};

const PrivateMessage = async ({ recipientID, message, userId }) => {
	const query = {
		name: "set-message",
		text: "insert into messages(message_id, sender_id, receiver_id, message) VALUES($1, $2, $3, $4)",
		values: [
			`${Date.now()}${Math.floor(Math.random() * 1000)}`,
			userId,
			recipientID,
			message,
		],
	};

	const userquery = {
		name: "send-message",
		text: "select socket_id from users_info where user_id = $1 and socket_id notnull ",
		values: [recipientID],
	};

	try {
		const messageInsert = await queryDatabase(query);
		const data = await queryDatabase(userquery);
		data.forEach((item) =>
			socketIO.to(item.socket_id).emit("private message", {
				userId,
				recipientID,
				message,
				date: new Date().toLocaleString(),
			})
		);
	} catch (error) {
		console.error("error unable to insert");
	}
};

const DisconnectSocket = async (clientID) => {
	const query = {
		name: "set-socket-null",
		text: "update users_info set socket_id = null, onlinestatus=false where user_id = $1",
		values: [clientID],
	};
	const query2 = {
		name: "notify-online-false",
		text: " select user_id, onlinestatus, socket_id from users_info where user_id != $1 and socket_id notnull",
		values: [clientID],
	};
	try {
		const data = await queryDatabase(query);
		const data2 = await queryDatabase(query2);
		data2.forEach((item) =>
			socketIO.to(item.socket_id).emit("online-status", {
				recipientID: clientID,
				onlinestatus: false,
			})
		);
	} catch (error) {
		console.error("error unable to discoonect");
	}
};
export { GroupMessage, PrivateMessage, DisconnectSocket };
