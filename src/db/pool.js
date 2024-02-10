import pg from "pg";

const { DB_PORT, DB_USER, DB_HOST, DB_NAME, DB_KEY } = process.env;
const pool = new pg.Pool({
	user: DB_USER,
	host: DB_HOST,
	database: DB_NAME,
	password: DB_KEY,
	port: DB_PORT,
});

export { pool };
