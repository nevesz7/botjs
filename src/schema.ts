export const typeDefs = `
input UserInput {
	name: String,
	email: String,
	password: String,
	age: Int,
	profession: String
}
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
		newUser: UserInput
	): User
}
`;
