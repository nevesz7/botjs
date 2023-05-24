export const typeDefs = `

input Input {
	userInput: UserInput!
	token: String!
}

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
	rememberMe: Boolean!
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
		requestData: Input
	): User

	login(
		requestCredentials: LoginInfo
	): LoginData
}
`;
