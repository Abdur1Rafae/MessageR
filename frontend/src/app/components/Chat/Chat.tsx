import { Flex } from "@chakra-ui/react";
import ConversationsWrapper from "./Conversations/ConversationsWrapper";
import { Session } from "next-auth";
import FeedWrapper from "./Feed/FeedWrapper";

interface ChatProps {
  session: Session
}

const Chat: React.FC<ChatProps> = ({session}) => {
  return (
    <Flex height={'100vh'}>
      <ConversationsWrapper session={session}/>
      <FeedWrapper session={session}/>
    </Flex>
  );
};

export default Chat;
