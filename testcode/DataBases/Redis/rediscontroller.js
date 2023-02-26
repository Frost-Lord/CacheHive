const logger = require("../../logger");

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
    global.redisClient = false;
    throw error;
  });
  client.on("ready", () => {
    global.redisClient = true;
    logger.success("Redis", "Redis is connected");
  });
  client.on("reconnecting", () => {
    logger.debug("Redis", "Connection lost, trying to reconnect...");
  });
  client.on("end", () => {
    global.redisClient = false;
    logger.error("Redis", "The redis server disconnected.");
  });
  return client;
}

async function set() {
}

async function findOne() {
}

module.exports = {
  createRedisClient,
  set,
  findOne,
};
