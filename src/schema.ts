export const typeDefs = `

input CreateUserInput {
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

	user(id: Int): User
}

type LoginData {
	user: User
	token: String
}

type Mutation {
	insertUser( 
		requestData: CreateUserInput
	): User

	login(
		requestCredentials: LoginInfo
	): LoginData
}
`;
