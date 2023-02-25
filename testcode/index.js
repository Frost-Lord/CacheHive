const mongoose = require("mongoose");
const redis = require("redis");
const logger = require("./logger");

///////////////////////////
// MongoDB
const MongoDBConroller = require("./DataBases/MongoDB/mongodbcontroller.js");
///////////////////////////
// Redis
const RedisController = require("./DataBases/Redis/rediscontroller.js");
///////////////////////////

let redisClient = false;

async function createRedisClient(redisOptions) {
  let client;
  try {
    client = redis.createClient({
      url: redisOptions
    });
  } catch (error) {
    console.log(error);
    throw new Error("Invalid Redis options:", redisOptions);
  }

  client.on("connect", () => {
    console.log("CONNECTING - The redis server connecting.");
  });
  client.on("error", (error) => {
    redisClient = false;
    throw error;
  });
  client.on("ready", () => {
    redisClient = true;
    logger.success("Redis", "Redis is connected");
  });
  client.on("reconnecting", () => {
    logger.debug("Redis", "Connection lost, trying to reconnect...");
  });
  client.on("end", () => {
    redisClient = false;
    logger.error("Redis", "The redis server disconnected.");
  });
  return client;
}


async function connect(mongoUrl, options = {}, mongooseOptions) {
  const {
    cache: { toggle = true, cacheOnly = false } = {},
    redis: { url: redisOptions } = {},
  } = options;

  if (toggle && redisOptions) {
    redisClient = await createRedisClient(redisOptions);
  }

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
    if (redisClient) {
      redisClient.quit();
      redisClient = null;
    }
    throw error && process.exit(1);
  }
}

async function set({ key, value, data, Schema }) {
  let result;
  const cacheOnly = false;
  if (redisClient && !cacheOnly && redisClient == true) {
    result = await new Promise((resolve, reject) => {
      redisClient.set(value, JSON.stringify(data), "EX", 60, (error, response) => {
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
  if (redisClient && redisClient == true) {
    const cachedData = await new Promise((resolve, reject) => {
      redisClient.get(value, (error, response) => {
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
          redisClient.del(value, (error, response) => {
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
      if (redisClient && redisClient == true) {
        await new Promise((resolve, reject) => {
          redisClient.set(value, JSON.stringify(data), "EX", 60, (error, response) => {
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
