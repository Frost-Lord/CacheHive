const { mongoConnect, mongoSet, mongoFindOne } = require("./DataBases/MongoDB/mongodbcontroller");
const { redisConnect } = require("./DataBases/Redis/rediscontroller");

global.redisClient = false;

async function connect(options = {
  database: {
    type: "",
    url: ""
  },
  cache: {
    toggle: undefined,
    cacheOnly: undefined
  },
  redis: {
    url: undefined
  }
}, CacheOptions) {
  const {
    database: { type: databaseType, url: dbUrl } = {},
    cache: { toggle = true, cacheOnly = false } = {},
    redis: { url: redisUrl } = {},
  } = options;

  if (databaseType == "mongodb" && dbUrl) {
    await mongoConnect(dbUrl, CacheOptions);
  }

  if (databaseType == "redis" && redisUrl && toggle) {
    await redisConnect(redisUrl);
  }

  return Promise.resolve();
}

async function set(key, value, data, Schema) {
  return mongoSet(key, value, data, Schema);
}

async function findOne(key, value, Schema) {
  return mongoFindOne(key, value, Schema);
}

module.exports = { connect, set, findOne };
