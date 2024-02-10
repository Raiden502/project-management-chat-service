import { pool } from "./pool.js";

const queryDatabase = (query) => {
	return new Promise((resolve, reject) => {
		pool.connect((connectError, client, done) => {
			if (connectError) {
				console.error(
					"Error connecting to the database:",
					connectError
				);
				done();
				reject("Unable to connect to the database");
			} else {
				client.query(query, (queryError, result) => {
					done();
					if (queryError) {
						console.error("Error executing query:", queryError);
						reject("Error executing the query");
					} else {
						resolve(result.rows);
					}
				});
			}
		});
	});
};
export { queryDatabase };
