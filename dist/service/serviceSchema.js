"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
exports.ServiceTypeDefs = (0, apollo_server_express_1.gql) `
	type User {
		name: String
	}
	type Query {
		getAllUsers: [User]
	}
`;
