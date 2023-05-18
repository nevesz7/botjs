export const typeDefs = `
input UserInput {
	name: String!
	email: String!
	password: String!
	dateOfBirth: String!
	profession: String
}

input LoginInfo {
	email: String!
	password: String!
}

type User {
	name: String
	email: String
	dateOfBirth: String
	profession: String
	id: Int
}

type Query {
	users: String
}

type LoginData {
	user: User
	token: String
}

type Mutation {
	insertUser( 
		requestData: UserInput
	): User

	login(
		requestCredentials: LoginInfo
	): LoginData
}
`;
