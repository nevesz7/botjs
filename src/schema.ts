export const typeDefs = `
input UserInput {
	name: String!
	email: String!
	password: String!
	age: Int!
	profession: String!
}

type User {
	name: String
	email: String
	password: String
	age: Int
	profession: String
	id: Int
}

type Query {
	users: String
}

type Mutation {
	insertUser( 
		myUser: UserInput
	): User
}
`;
