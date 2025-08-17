import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const apollo = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:5000/api/graphql", // explicitly target NestJS
    credentials: "include", // keep cookies/session
  }),
  cache: new InMemoryCache(),
});
