"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Session } from "next-auth";
import { ApolloProvider } from "@apollo/client";
import { client } from "../../graphql/apollo-client";

interface ProviderProps {
  children: ReactNode;
  session?: Session | null;
}

const Provider = ({ children, session }: ProviderProps) => {
  return (
    <ApolloProvider client={client}>
      <SessionProvider session={session}>
          {children}
      </SessionProvider>
    </ApolloProvider>
  );
};

export default Provider;
