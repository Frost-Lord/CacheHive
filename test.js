const CacheHive = require("./testcode");

async function test() {
  await CacheHive.connect(
    {
      database: {
        type: "postgresql",
        url: "postgresql://proxy:Fighting35a@166.0.134.132:5432/test",
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
  
  //const userdata = await CacheHive.Mongoset({ key: "1", data: data, Schema: UserSchema});
  
  //console.log(userdata ? "Data saved to MongoDB" : "Data not saved to MongoDB");

  //const logdata = await CacheHive.MongofindOne({ key: 'name', value: "jeff", Schema: UserSchema });
  //console.log(logdata);

  const postgresqldata = await CacheHive.PostgresSet({tableName: "test", key: "id", value: "1", data: data});
  console.log(postgresqldata ? "Data saved to PostgreSQL" : "Data not saved to PostgreSQL");

}

test().catch((err) => console.log(err));