const mongoredis = require("./testcode");

async function test() {
  await mongoredis.connect(
    "mongodb://127.0.0.1:27017/CacheHive",
    {
      cache: {
        toggle: true,
        cacheOnly: false,
      },
    },
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const data = {
    id: "1",
    name: "jack",
    lastname: "james",
    house: "Gryffindor",
    street: "79 George Street Macfarlane Queensland 4478",
  };
   
  const UserSchema = require("./database/userschema.js");

  const userdata = await mongoredis.set({
    key: "id",
    value: "2076",
    data: data,
    Schema: UserSchema,
  });
  //console.log(userdata ? "Data saved to MongoDB" : "Data not saved to MongoDB");

  const logdata = await mongoredis.findOne({ key: 'name', value: "jeff", Schema: UserSchema });
  //console.log("Retrieved data:", logdata);

}

test().catch((err) => console.log(err));