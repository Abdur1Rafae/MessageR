"use client"
import { Box } from "@chakra-ui/react";
import type { NextPage, NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Auth from "./components/Auth/Auth";
import Chat from "./components/Chat/Chat";

const Home: NextPage = () => {
  const {data: session} = useSession();

  const reloadSession = ()=>{
    // const event = new Event("visibilitychange");
    // document.dispatchEvent(event)
  }

  console.log("Here is the ", session);
  return (
    <Box>
      {
        session?.user?.username ? 
        <Chat session={session}/>
        :
        <Auth session={session} reloadSession={reloadSession}/>
      }
    </Box>
  );
}

export async function getSeverSideProps(context: NextPageContext) {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}

export default Home;
