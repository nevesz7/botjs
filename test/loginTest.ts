import "mocha";
// import { expect } from "chai";
import { UserRepository } from "../src/data-source";
import { getMutation } from "./utils";

const input = {
  profession: "FBI Agent",
  password: "Test1234",
  name: "test name",
  email: "test.email@test",
  dateOfBirth: "01/01/2000",
};

const createLoginMutation = (input) => {
  const loginBody = {
    query: `mutation login($requestCredentials: LoginInfo) {
			  login(requestCredentials:$requestCredentials) {
				  user {
					  profession
					  name
					  id
					  dateOfBirth
					  email
				  }
				  token
			  }
		  }`,
    variables: {
      requestCredentials: {
        password: input.password,
        email: input.email,
      },
    },
  };
  return loginBody;
};

// it("should execute login mutation and return successfully", async () => {
//   await UserRepository.save(input);
//   const mutationBody = createLoginMutation(input);
//   const mutationResponse = await getMutation(mutationBody);
//   console.log(mutationResponse);
// });

// it("should detect non-existing user and fail the login mutation", async () => {
//   await UserRepository.save(input);
//   input.email = "error@email.com";
//   const mutationBody = createLoginMutation(input);
//   const mutationResponse = await getMutation(mutationBody);
//   console.log(mutationResponse);
// });

// it("should detect wrong password and fail the login mutation", async () => {
//   await UserRepository.save(input);
//   input.password = "TestError";
//   const mutationBody = createLoginMutation(input);
//   const mutationResponse = await getMutation(mutationBody);
//   console.log(mutationResponse);
// });
