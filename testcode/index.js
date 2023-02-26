const logger = require("./logger");
global.redisClient = false;

///////////////////////////
// MongoDB
const MongoDBController = require("./DataBases/MongoDB/mongodbcontroller.js");
///////////////////////////
// Redis
const RedisController = require("./DataBases/Redis/rediscontroller.js");
///////////////////////////

async function connect(options = {}, mongooseOptions) {
  const {
    database: { type: databasetype, url: dbUrl } = {},
    cache: { toggle = true, cacheOnly = false } = {},
    redis: { url: redisOptions } = {},
  } = options;

  if (databasetype == 'mongodb' && dbUrl) {
    await MongoDBController.connect(dbUrl, mongooseOptions);
  }

  if (databasetype == 'redis' && redisOptions) {
    await RedisController.connect(redisOptions);
  }

  if (toggle && redisOptions) {
    global.redisClient = await RedisController.createRedisClient(redisOptions);
  }

  return Promise.resolve();
}

async function set(key, value, data, Schema) {
  return MongoDBController.set(key, value, data, Schema, global.redisClient);
}

async function findOne(key, value, Schema) {
  return MongoDBController.findOne(key, value, Schema, global.redisClient);
}

module.exports = {
  connect,
  set,
  findOne,
};