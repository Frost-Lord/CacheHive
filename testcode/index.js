const logger = require("./logger.js");
///////////////////////////
// MongoDB
const MongoDBController = require("./DataBases/MongoDB/mongodbcontroller.js");
///////////////////////////
// Redis
const RedisController = require("./DataBases/Redis/rediscontroller.js");
///////////////////////////
// PostgresQL
const PostgresQLController = require("./DataBases/PostgresQL/PostgresQLcontroller.js");
///////////////////////////

let redisClient = null;

async function connect(options = {}, dboptions = {}) {
  const {
    database: { type: databaseType, url: dbUrl } = {},
    cache: { toggle = true, cacheOnly = false } = {},
    redis: { url: redisUrl } = {},
  } = options;

  if (databaseType == "mongodb" && dbUrl) {
    await MongoDBController.mongoConnect(dbUrl, dboptions);
  }

  if (databaseType == "postgresql" && dbUrl) {
    await PostgresQLController.pgConnect(dbUrl);
  }

  if (redisUrl && toggle) {
    redisClient = await RedisController.redisConnect(redisUrl);
  }

  return Promise.resolve();
}

async function set({key, value, data, Schema}) {
  return MongoDBController.mongoSet(key, value, data, Schema, redisClient);
}

async function findOne({key, value, Schema}) {
  return MongoDBController.mongoFindOne(key, value, Schema, redisClient);
}

logger.success("CACHEHIVE", "CacheHive is ready!");
module.exports = { connect, set, findOne };