import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { makeExecutableSchema } from "@graphql-tools/schema";
import * as dotenv from 'dotenv'
import { getServerSession } from './getServerSession';
import { GraphQlContext } from './utils/type';
import { PrismaClient } from '@prisma/client';
import { SubscriptionContext } from './utils/type';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { PubSub } from 'graphql-subscriptions';

const main = async () => {
  dotenv.config();
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql/subscriptions',
  });

  const prisma = new PrismaClient()
  const pubsub = new PubSub();

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  const serverCleanup = useServer({ schema, context: async (ctx: SubscriptionContext): Promise<GraphQlContext>=>{
    if(ctx.connectionParams && ctx.connectionParams.session) {
      const {session} = ctx.connectionParams

      return {session, prisma, pubsub}
    }
    else {
      return {session: null, prisma, pubsub}
    }
  } }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
  
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  const corsOptions = {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true
  }

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<GraphQlContext> => {
        const session = await getServerSession(req.headers.cookie as string);
        return { session, prisma, pubsub };
      }
    }),
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
};

main().catch((error) => {
  console.error('Error starting server:', error);
});
