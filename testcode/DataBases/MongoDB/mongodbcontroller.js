const mongoose = require("mongoose");
const logger = require("../../logger");

async function connect(mongoUrl, options = {}, mongooseOptions) {
    try {
        mongoose.connect(mongoUrl, mongooseOptions || {
            keepAlive: true,
            minPoolSize: 3,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 60000
        });

        mongoose.connection.on("error", (err) => {
            logger.debug("MONGODB", "The database refused the connection.");
        });

        mongoose.connection.on("disconnected", () => {
            logger.error("MONGODB", "The database disconnected.");
        });

        mongoose.connection.on("connected", () => {
            logger.success("MONGODB", "MongoDB is connected");
        });

        mongoose.connection.on("reconnected", () => {
            logger.debug("MONGODB", "The database reconnected.");
        });

        mongoose.connection.on("reconnectFailed", () => {
            logger.error("MONGODB", "The database reconnect failed.");
        });

    } catch (error) {
        throw error;
    }
}

async function set({ key, value, data, Schema }) {
    let result;
    const cacheOnly = false;
    if (global.redisClient && !cacheOnly && global.redisClient == true) {
        result = await new Promise((resolve, reject) => {
            global.redisClient.set(value, JSON.stringify(data), "EX", 60, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }
    if (!cacheOnly) {
        const document = await Schema.findOne({ key: value });
        if (document) {
            const updatedDoc = await Schema.findOneAndUpdate({ key: value }, data, { new: true });
            if (updatedDoc) {
                result = updatedDoc;
            } else {
                logger.error("MONGODB", "Update operation failed");
            }
        } else {
            const newDoc = new Schema({ key: value, ...data });
            result = await newDoc.save();
        }
    }
    return result;
}



async function findOne({ key, value, Schema }) {
    let data;
    if (global.redisClient && global.redisClient == true) {
        const cachedData = await new Promise((resolve, reject) => {
            global.redisClient.get(value, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
        if (cachedData) {
            try {
                data = JSON.parse(cachedData);
                console.log("Retrieved data from Redis cache:", data);
            } catch (error) {
                console.error("Failed to parse Redis cache data:", error);
                await new Promise((resolve, reject) => {
                    global.redisClient.del(value, (error, response) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(response);
                        }
                    });
                });
            }
        }
    }
    if (!data) {
        const document = await Schema.findOne({ key: value });
        data = document;
        if (data) {
            if (global.redisClient && global.redisClient == true) {
                await new Promise((resolve, reject) => {
                    global.redisClient.set(value, JSON.stringify(data), "EX", 60, (error, response) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(response);
                        }
                    });
                });
                console.log("Stored data in Redis cache:", data);
            }
        }
    }
    return data;
}

module.exports = {
    connect,
    set,
    findOne,
};
