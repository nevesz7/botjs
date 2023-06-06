import "mocha";
import { expect } from "chai";
import { UserRepository } from "../src/data-source";
import { UserInput, UserPayload } from "../src/types";
import { getToken } from "../src/token";
import { getQuery } from "./utils";
import { createHash } from "crypto";

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
    await UserRepository.clear();
    await UserRepository.save({
      ...testUserData,
      password: createHash("sha256")
        .update(testUserData.password)
        .digest("hex"),
      dateOfBirth: new Date(testUserData.dateOfBirth),
    });
  });

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

  it("should fail the query due to not being authorized", async () => {
    const queryBody = createUserQuery(0);
    const queryResponse = await getQuery(queryBody, "invalid token");
    expect(queryResponse.data.errors).to.deep.equal(testError.authError);
  });
});
