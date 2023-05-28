import { startTest } from "./utils";

//starting server and connecting to test database
before(async () => {
  await startTest();
});
