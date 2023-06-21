import "mocha";
import { expect } from "chai";
import { AddressRepository, UserRepository } from "../src/data-source";
import { UserInput, UserPayload } from "../src/types";
import { getToken } from "../src/token";
import { getQuery } from "./utils";
import { generateHash } from "../src/utils";

describe("user query test", () => {
  const testUserData: UserInput = {
    email: "test@test.com",
    name: "test-user",
    dateOfBirth: "01/01/2000",
    profession: "test-profession",
    password: "Test1234",
  };

  let testPayloadData: UserPayload;

  beforeEach(async () => {
    await AddressRepository.delete({});
    await UserRepository.delete({});
    await UserRepository.save({
      ...testUserData,
      password: generateHash(testUserData.password),
      dateOfBirth: new Date(testUserData.dateOfBirth),
    });
  });

  const address1 = {
    CEP: "01234567",
    city: "test city 1",
    name: "home",
    neighborhood: "test neighborhood 1",
    state: "test state 1",
    street: "test street 1",
    streetNumber: 42,
    complement: null,
  };

  const address2 = {
    CEP: "01234567",
    city: "test city 1",
    name: "work",
    neighborhood: "test neighborhood 2",
    state: "test state 1",
    street: "test street 2",
    streetNumber: 43,
    complement: null,
  };

  const testError = {
    userNotFoundError: [
      {
        code: 400,
        message: "User not found",
      },
    ],

    authError: [
      {
        code: 401,
        message: "User is not authenticated",
      },
    ],
  };

  const createUserQuery = (id: number) => {
    const queryBody = {
      query: `query user($userId: Int) {
		user(id: $userId) {
		  dateOfBirth
		  email
		  id
		  name
		  profession
		  address {
			CEP
			city
			complement
			name
			neighborhood
			state
			street
			streetNumber
		  }
		}
	  }`,
      variables: {
        userId: id,
      },
    };
    return queryBody;
  };

  it("should find user by the id and return its data correctly", async () => {
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    testPayloadData = {
      email: testUserData.email,
      name: testUserData.name,
      dateOfBirth: new Date(testUserData.dateOfBirth),
      profession: testUserData.profession,
      id: dbUser.id,
      address: [],
    };
    const queryBody = createUserQuery(dbUser.id);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.user).to.deep.equal({
      ...testPayloadData,
      dateOfBirth: new Date(testPayloadData.dateOfBirth).getTime().toString(),
    });
  });

  it("should find user with addresses by the id and return its data correctly", async () => {
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    await AddressRepository.save({
      ...address1,
      user: await UserRepository.findOne({ where: { id: dbUser.id } }),
    });
    await AddressRepository.save({
      ...address2,
      user: await UserRepository.findOne({ where: { id: dbUser.id } }),
    });
    testPayloadData = {
      email: testUserData.email,
      name: testUserData.name,
      dateOfBirth: new Date(testUserData.dateOfBirth),
      profession: testUserData.profession,
      id: dbUser.id,
      address: [address1, address2],
    };

    const queryBody = createUserQuery(dbUser.id);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.user).to.deep.equal({
      ...testPayloadData,
      dateOfBirth: new Date(testPayloadData.dateOfBirth).getTime().toString(),
    });
  });

  it("should throw error of user not found on database", async () => {
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    const queryBody = createUserQuery(0);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.errors).to.deep.equal(
      testError.userNotFoundError
    );
  });

  it("should fail the query due to not being authenticated", async () => {
    const queryBody = createUserQuery(0);
    const queryResponse = await getQuery(queryBody, "invalid token");
    expect(queryResponse.data.errors).to.deep.equal(testError.authError);
  });
});
