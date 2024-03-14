import { queryDatabase } from "../db/queryDb.js";
import { socketIO } from "./socket.js";

const GroupMessage = async ({
	recipientID,
	userId,
	message,
	username,
	avatar,
	orgId
}) => {
	const query = {
		name: "set-group-message",
		text: "insert into messages(message_id, organization_id, sender_id, group_id, message, message_type) VALUES($1, $2, $3, $4, $5, $6)",
		values: [
			`M_${Date.now()}${Math.floor(Math.random() * 1000)}`,
			orgId,
			userId,
			recipientID,
			message,
			'info'
		],
	};

	const groupquery = {
		name: "send-group-message",
		text: "select u.chat_socket_id from user_info u join user_group_associaton m on m.user_id=u.user_id where m.group_id=$1 and u.chat_socket_id!='' and u.user_id!=$2 ",
		values: [recipientID, userId],
	};

	try {
		const messageInsert = await queryDatabase(query);
		const data = await queryDatabase(groupquery);
		data.forEach((item) =>
			socketIO.to(item.chat_socket_id).emit("private message", {
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

const PrivateMessage = async ({ recipientID, message, userId , username, avatar, orgId}) => {
	const query = {
		name: "set-message",
		text: "insert into messages(message_id, organization_id, sender_id, reciever_id, message, message_type) VALUES($1, $2, $3, $4, $5, $6)",
		values: [
			`M_${Date.now()}${Math.floor(Math.random() * 1000)}`,
			orgId,
			userId,
			recipientID,
			message,
			'info',
		],
	};

	const userquery = {
		name: "send-message",
		text: "select chat_socket_id , user_name, avatar from user_info where user_id = $1 and chat_socket_id notnull ",
		values: [recipientID],
	};

	try {
		const messageInsert = await queryDatabase(query);
		const data = await queryDatabase(userquery);
		data.forEach((item) =>
			socketIO.to(item.chat_socket_id).emit("private message", {
				userId,
				recipientID,
				message,
				username,
				avatar,
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
		text: "update user_info set chat_socket_id = null, active_status=false where user_id = $1",
		values: [clientID],
	};
	const query2 = {
		name: "notify-online-false",
		text: " select user_id, active_status, chat_socket_id from user_info where user_id != $1 and chat_socket_id notnull",
		values: [clientID],
	};
	try {
		const data = await queryDatabase(query);
		const data2 = await queryDatabase(query2);
		data2.forEach((item) =>
			socketIO.to(item.chat_socket_id).emit("online-status", {
				recipientID: clientID,
				onlinestatus: false,
			})
		);
	} catch (error) {
		console.error("error unable to discoonect");
	}
};
export { GroupMessage, PrivateMessage, DisconnectSocket };
