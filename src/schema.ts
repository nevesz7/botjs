export const typeDefs = `
input UserInput {
	name: String!
	email: String!
	password: String!
	date_of_birth: String!
	profession: String
}

type User {
	name: String
	email: String
	date_of_birth: String
	profession: String
	id: Int
}

type Query {
	users: String
}

type Mutation {
	insertUser( 
		requestData: UserInput
	): User
}
`;
