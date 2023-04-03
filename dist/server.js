"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const http_1 = require("http");
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const schema_1 = require("./schema");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use("*", (0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
const server = new apollo_server_express_1.ApolloServer({
    schema: schema_1.schema,
});
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = (0, http_1.createServer)(app);
httpServer.listen({ port: PORT }, () => console.log(`GraphQL-Server is running on http://localhost:3000/graphql`));
console.log("Free taqos!");
