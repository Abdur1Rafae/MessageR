import { Flex } from "@chakra-ui/react"
import { Session } from "next-auth"
import { useSearchParams } from "next/navigation"
import MessageHeader from "./Messages/Header"
import MessageInput from "./Messages/Input"
import Messages from "./Messages/Messages"

interface FeedProps {
  session: Session
}

const FeedWrapper: React.FC<FeedProps> = ({session}) => {
  const searchParams = useSearchParams()

  const conversationId = searchParams.get('conversationId')


  return (
    <Flex width={'100%'} direction={'column'} display={{base: conversationId ? 'flex' : 'none', md: 'flex'}}>
      {
        conversationId && typeof conversationId === "string" ? (
          <>
            <Flex direction={'column'} justify={'space-between'} overflow={'hidden'} flexGrow={1}>
              <MessageHeader userId={session.user.id} conversationId={conversationId}/>
              <Messages conversationId={conversationId} userId={session?.user.id}/>
            </Flex>
            <MessageInput conversationId={conversationId} session={session}/>
          </>
        ) : (
          <>
            No Conversation Selected
          </>
        )
      }
    </Flex>
  )
}

export default FeedWrapper