const mongoose = require("mongoose");
const logger = require("../../logger");

async function mongoConnect(mongoUrl, options = {}, mongooseOptions) {
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
            //logger.success("MONGODB", "MongoDB is connected");
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

async function mongoSet(key, value, data, Schema, redisClient) {
    let result;
    if (redisClient) {
        try {
            await redisClient.set(String(value), JSON.stringify(data), "EX", 60 * 60 * 24);
        } catch (error) {
            console.error(error);
            throw new Error("Error setting value in Redis: " + error);
        }
    }
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
    return result;
}


async function mongoFindOne(key, value, Schema, redisClient) {
    async function mongodbdata() {
        let document = await Schema.findOne({ key: value });
        if (document) {
            return document;
        } else {
            return null;
        }
    }

    if (redisClient) {
        try {
            const redisdata = await redisClient.get(String(value));
            if (redisdata) {
                return JSON.parse(redisdata);
            } else {
                const document = await mongodbdata();
                if (document) {
                    await redisClient.set(String(value), JSON.stringify(document), "EX", 60 * 60 * 24);
                }
                return document;
            }
        } catch (error) {
            console.error(error);
            throw new Error("Error setting value in Redis: " + error);
        }
    } else {
        const document = await mongodbdata();
        return document;
    }
}

module.exports = {
    mongoConnect,
    mongoSet,
    mongoFindOne,
};
