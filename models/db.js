const __dotenv = require("dotenv");
if(__dotenv) __dotenv.config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.SHARED_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    get_client: () => pool.connect(),
    release_client: (client) => client.release(),
};
