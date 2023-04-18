import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { AppDataSource } from "./data-source";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const start = async () => {
  await initializeData();
  await startStandaloneServer(server, {
    listen: { port: 4000 },
  });
  console.log("Server ready at http://localhost:4000/");
};

const initializeData = async () => {
  await AppDataSource.initialize();
};

start();

/*hummm....tanto email quanto profissão, no banco existe restrição (que achei meio aleatório) de tamanho de dados. Vc chegou a considerar que ele pode ter um email gigante ou mandar uma string aqui de profissão maior do que o limite da coluna e isso vai dar erro na hora de salvar o seu user?
aqui eu recomendo dar uma pesquisada a mais, já que vc vai querer salvar uma string. Outro ponto é que quando falamos em segurança de dados, não basta encriptar, geralmente adicionamos alguns fatores para gerar a o dado para dificultar a quebra dessa criptografia. dá uma olhada sobre salt e round, peguei um link aqui mas é só um exemplo da wikipedia sobre salt
https://en.wikipedia.org/wiki/Salt_(cryptography)
esse é um caso bacana de explicitar, pq poderia ser um tipo smallint
tudo bem que o typeorm infere, mas seria mais interessante vc deixar explícito quando nao for varchar*/
