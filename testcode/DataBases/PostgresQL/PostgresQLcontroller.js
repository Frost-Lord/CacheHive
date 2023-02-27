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

async function PostgresSet(PGClient, tableName, key, value, data, redisClient) {
    try {
        const query = {
            text: `UPDATE ${tableName} SET ${Object.keys(data).map((k, i) => `"${k}"=$${i + 1}`).join(", ")} WHERE "${key}"=$${Object.keys(data).length + 1} RETURNING *`,
            values: [...Object.values(data), value],
        };
        const result = await PGClient.query(query).catch(e => logger.error(e));

        await PGClient.query('COMMIT');

        if (redisClient && result) {
            await redisClient.set(tableName, JSON.stringify(result.rows), 'EX', 60 * 60 * 24);
        }
        return true;
    } catch (error) {
        if (error.code === '3D000') {
            await PGClient.query(`CREATE DATABASE ${PGClient.database}`);
            return await PostgresSet(PGClient, tableName, key, value, data, redisClient);
        }
        console.error(error);
        return false;
    }
}


async function PostgresFindOne(PGClient, tableName, key, value, redisClient) {

    try {
        let result;
        if (redisClient) {
            result = await redisClient.get(tableName);
            if (result) {
                return JSON.parse(result);
            }
        }

        const query = {
            text: `SELECT * FROM ${tableName} WHERE ${key} = $1`,
            values: [value],
        };
        result = await PGClient.query(query).catch(e => logger.error(e));

        if (result.rowCount > 0) {
            if (redisClient) {
                await redisClient.set(tableName, JSON.stringify(result.rows[0]), "EX", 60 * 60 * 24);
            }
            return result.rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    } finally {
        PGClient.release();
    }
}

module.exports = {
    pgConnect,
    PostgresSet,
    PostgresFindOne
};