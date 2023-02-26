const { Client } = require('pg');
const logger = require("../../logger");

async function pgConnect(url) {
    let client;
    try {
        client = new Client({
            connectionString: url,
        });
        await client.connect();
    } catch (err) {
        throw new Error(err);
    }
    return client;
}

async function PostgresSet(key, value, data, Schema, redisClient) {
}

async function PostgresFindOne(key, value, Schema, redisClient) {
}

module.exports = {
    pgConnect,
    PostgresSet,
    PostgresFindOne
};