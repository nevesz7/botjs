"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const user_1 = require("./entities/user");
const typeDefs = `
	type Query {
		hello: String
	}
`;
const resolvers = {
  Query: { hello: () => "Hello Taqos!" },
};
const server = new server_1.ApolloServer({
  typeDefs,
  resolvers,
});
const start = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield (0, standalone_1.startStandaloneServer)(server, {
      listen: { port: 4000 },
    });
    console.log("Server ready at http://localhost:4000/");
  });
exports.AppDataSource = new typeorm_1.DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "neves7",
  password: "arara123",
  database: "nevesl-db",
  entities: [user_1.User],
  synchronize: true,
  logging: false,
});
const initializeData = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield exports.AppDataSource.initialize();
  });
const UserRepository = exports.AppDataSource.getRepository(user_1.User);
const createUser = () =>
  __awaiter(void 0, void 0, void 0, function* () {
    yield initializeData();
    const newUser = new user_1.User();
    newUser.name = "Joe Goldberg";
    newUser.age = 30;
    newUser.profession = "Librarian";
    yield UserRepository.save(newUser);
    console.log(
      `User: ${newUser.name} has been succesfully created! User id is`,
      newUser.id
    );
  });
start();
createUser();
//# sourceMappingURL=index.js.map
