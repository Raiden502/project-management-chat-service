import { queryDatabase } from "../db/queryDb.js";

const GetUsers = async (req, res) => {
	const { sender_id } = req.body;
	const query = {
		name: "get-users",
		text: `
			SELECT u.avatar as avatar, u.user_name AS name, u.user_id AS id, 'normal' AS type, u.onlinestatus as onlinestatus,
				(
				SELECT message FROM messages m
				WHERE 
					(m.sender_id =$1 and m.receiver_id = u.user_id) 
					or (m.receiver_id =$1 and m.sender_id = u.user_id)
				ORDER BY m.sent_at DESC
				LIMIT 1
				) AS lastmsg
			FROM
				users_info u
			WHERE
				u.user_id != $1
			union
			SELECT g.avatar, g.group_name AS name, g.group_id AS id, 'group' AS type, false as onlinestatus,
				(
				SELECT message FROM messages m WHERE m.group_id = g.group_id
				ORDER BY m.sent_at DESC
				LIMIT 1
				) AS lastmsg
			FROM
				groups_info g
			JOIN group_members u ON g.group_id = u.group_id
			WHERE
				u.user_id = $1;
		`,
		values: [sender_id],
	};

	try {
		const data = await queryDatabase(query);
		res.json({
			message: "fetch successful",
			data: data,
			status: true,
		});
	} catch (error) {
		res.status(500).json({
			message: "failed",
			data: [],
			status: false,
			error: error.message || "Internal Server Error",
		});
	}
};

const GetLogin = async (req, res) => {
	const { user_mail, password } = req.body;
	const query = {
		name: "login user",
		text: `
			select user_id, user_name, avatar from users_info where user_mail =$1 and password_hash = $2
		`,
		values: [user_mail, password],
	};

	try {
		const data = await queryDatabase(query);
		if (data.length > 0) {
			res.json({
				message: "login successful",
				user: data[0],
				status: true,
				accessToken: data[0],
			});
		} else {
			res.json({
				message: "login failed",
				user: {},
				status: false,
				accessToken: {},
			});
		}
	} catch (error) {
		res.status(500).json({
			message: "failed",
			data: [],
			status: false,
			error: error.message || "Internal Server Error",
		});
	}
};

const GetChats = async (req, res) => {
	const { type, sender_id, receiver_id } = req.body;
	const query =
		type === "group"
			? {
					name: "get-group-chats",
					text: `
						SELECT m.message, CASE when u.user_id =$2 THEN 'you' ELSE u.user_name END as username, u.avatar, m.sent_at AS datetime, m.group_id AS receiverid, m.sender_id AS senderid from messages m
						join
						users_info u
						on u.user_id = m.sender_id
						WHERE
						group_id = $1
					`,
					values: [receiver_id, sender_id],
			  }
			: {
					name: "get-users-chats",
					text: `
						SELECT message, sent_at AS datetime, receiver_id AS receiverid, sender_id AS senderid from messages
						WHERE
						(sender_id = $1 AND receiver_id = $2) OR (receiver_id = $1 AND sender_id = $2)
					`,
					values: [sender_id, receiver_id],
			  };
	try {
		const data = await queryDatabase(query);
		res.json({
			message: "fetch successful",
			data: data,
			status: true,
		});
	} catch (error) {
		res.status(500).json({
			message: "failed",
			data: [],
			status: false,
			error: error.message || "Internal Server Error",
		});
	}
};

export { GetUsers, GetChats, GetLogin };
