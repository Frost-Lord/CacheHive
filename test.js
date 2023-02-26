const CacheHive = require("./testcode");

async function test() {
  await CacheHive.connect(
    {
      database: {
        type: "mongodb",
        url: "mongodb://127.0.0.1:27017/CacheHive",
      },
      cache: {
        toggle: true,
        cacheOnly: false,
      },
      redis: {
        url: "redis://default:BrYfjHY94Ld39DD4rZVeUiYPnW5IOiQB@redis-10009.c16.us-east-1-3.ec2.cloud.redislabs.com:10009",
      }
    },
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  
  const data = {
    id: "1",
    name: "bob",
    lastname: "james",
    house: "Gryffindor",
    street: "79 George Street Macfarlane Queensland 4478",
  };
  
  const UserSchema = require("./database/userschema.js");
  
  const userdata = await CacheHive.set({
    key: "1",
    data: data,
    Schema: UserSchema,
  });
  
  console.log(userdata ? "Data saved to MongoDB" : "Data not saved to MongoDB");

  const logdata = await CacheHive.findOne({ key: 'name', value: "jeff", Schema: UserSchema });
  console.log(logdata);

}

test().catch((err) => console.log(err));