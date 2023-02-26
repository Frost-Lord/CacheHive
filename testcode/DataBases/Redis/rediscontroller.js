const logger = require("../../logger");
const { createClient } = require("redis");

async function redisConnect(redisOptions) {
  try {
    const client = createClient({
      url: redisOptions
    });

    await client.connect().catch((error) => {
      logger.error("Redis", "Error connecting to Redis: " + error);
    });

    client.on("connect", () => {
      logger.success("Redis", "The server connected.");
    });
    client.on("error", (error) => {
      logger.error("Redis", "Error connecting to Redis: " + error);
    });
    client.on("ready", () => {
      logger.success("Redis", "Redis is connected");
    });
    client.on("reconnecting", () => {
      logger.debug("Redis", "Connection lost, trying to reconnect...");
    });
    client.on("end", () => {
      logger.error("Redis", "The redis server disconnected.");
    });
  
    return client;
    
  } catch (error) {
    console.error(error);
    throw new Error("Invalid Redis options: " + redisOptions);
  }
}

module.exports = {
  redisConnect,
};
