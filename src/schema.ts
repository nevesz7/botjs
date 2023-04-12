import { User } from "./entities/user";

export const typeDefs = `
type User {
	name: String,
	email: String,
	password: String,
	age: Int,
	profession: String,
	id: Int
}
type Query {
	users: [User]
}
type Mutation {
	insertUser( 
	  name: String,
	  email: String,
	  password: String,
	  age: Int,
	  profession: String
	): User
}
`;
