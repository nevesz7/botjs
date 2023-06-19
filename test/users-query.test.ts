import "mocha";
import { expect } from "chai";
import { UserRepository } from "../src/data-source";
import { UserInput, UserPayload, PagedUser } from "../src/types";
import { getToken } from "../src/token";
import { getQuery } from "./utils";
import { fillDatabase } from "./faker-test";
import { generateHash } from "../src/utils";

describe("users query test", () => {
  const testUserData: UserInput = {
    email: "test@test.com",
    name: "test-user",
    dateOfBirth: "01/01/2000",
    profession: "test-profession",
    password: "Test1234",
  };

  beforeEach(async () => {
    await UserRepository.clear();
    await UserRepository.save({
      ...testUserData,
      password: generateHash(testUserData.password),
      dateOfBirth: new Date(testUserData.dateOfBirth),
    });
  });

  const testError = {
    authError: [
      {
        code: 401,
        message: "User is not authenticated",
      },
    ],

    AmountSkipSumError: [
      {
        code: 400,
        message: `The sum of users per page and skipped users cannot be greater than total number of users. Total number of users: 43`,
      },
    ],

    negativeSkipError: [
      {
        code: 400,
        message: "Amount of skipped users must be greater or equal to 0",
      },
    ],

    negativeAmountError: [
      {
        code: 400,
        message: "Amount of users must be greater or equal to 0",
      },
    ],
  };

  const createUsersQuery = (amount?: number, usersToSkip?: number) => {
    const queryBody = {
      query: `query users($amount: Int, $usersToSkip: Int) {
		users(amount: $amount, usersToSkip: $usersToSkip) {
		  currentPage
		  numberOfPages
		  numberOfUsers
		  users {
			dateOfBirth
			email
			id
			name
			profession
		  }
		}
	  }`,
      variables: {
        amount: amount,
        usersToSkip: usersToSkip,
      },
    };
    return queryBody;
  };

  it("should return the correct array of users", async () => {
    await fillDatabase(42);
    const dbUser = await UserRepository.findOne({
      where: { email: "test@test.com" },
    });

    const testUsers: UserPayload[] = await UserRepository.find({
      order: {
        name: "ASC",
      },
      skip: 3,
      take: 10,
    });

    const testPagedUsers: PagedUser[] = testUsers.map((users) => ({
      ...users,
      dateOfBirth: users.dateOfBirth.toISOString(),
    }));
    testPagedUsers.forEach((user) => {
      delete user["password"];
    });

    const queryBody = createUsersQuery(10, 3);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.users.users).to.deep.equal(testPagedUsers);
  });

  it("should return the correct amount of total users", async () => {
    await fillDatabase(42);
    const dbUser = await UserRepository.findOne({
      where: { email: "test@test.com" },
    });
    const queryBody = createUsersQuery(10, 3);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.users.numberOfUsers).to.equal(43);
  });

  it("should return the correct amount of pages", async () => {
    await fillDatabase(42);
    const dbUser = await UserRepository.findOne({
      where: { email: "test@test.com" },
    });
    const queryBody = createUsersQuery(10, 3);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.users.numberOfPages).to.equal(5);
  });

  it("should return the correct number for current page", async () => {
    await fillDatabase(42);
    const dbUser = await UserRepository.findOne({
      where: { email: "test@test.com" },
    });
    const queryBody = createUsersQuery(10, 3);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.data.users.currentPage).to.equal(2);
  });

  it("should throw error of sum of amount and skipped users greater than total users on database", async () => {
    await fillDatabase(42);
    const dbUser = await UserRepository.findOne({
      where: { email: "test@test.com" },
    });
    const queryBody = createUsersQuery(50, 3);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.errors).to.deep.equal(
      testError.AmountSkipSumError
    );
  });

  it("should throw error of negative amount of skipped users", async () => {
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    const queryBody = createUsersQuery(0, -1);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.errors).to.deep.equal(
      testError.negativeSkipError
    );
  });

  it("should throw error of negative user amount", async () => {
    const dbUser = await UserRepository.findOne({
      where: { email: testUserData.email },
    });
    const queryBody = createUsersQuery(-1);
    const queryResponse = await getQuery(queryBody, getToken(dbUser, true));
    expect(queryResponse.data.errors).to.deep.equal(
      testError.negativeAmountError
    );

    it("should fail the query due to not being authorized", async () => {
      const queryBody = createUsersQuery(10, 3);
      const queryResponse = await getQuery(queryBody, "invalid token");
      expect(queryResponse.data.errors).to.deep.equal(testError.authError);
    });
  });
});
