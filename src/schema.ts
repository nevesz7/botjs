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
	rememberMe: Boolean!
}

type Page {
	users: [User]
	numberOfUsers: Int
	numberOfPages: Int
	currentPage: Int
}

type User {
	name: String
	email: String
	dateOfBirth: String
	profession: String
	id: Int
}

type Query {
	user(id: Int): User
	users(amount: Int, usersToSkip: Int): Page
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
