import { Session } from "next-auth"
import { Box } from "@chakra-ui/react"
import ConversationList from "./ConversationList"
import { gql, useMutation, useQuery, useSubscription } from "@apollo/client"
import Conversation from "@/src/graphql/operations/Conversation"
import { ConversationUpdatedData, conversationsData } from "@/src/util/types"
import { ConversationPopulated, ParticipantPopulated } from "../../../../../../backend/src/utils/type"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SkeletonLoader from "../../common/SkeletonLoader"
import toast from "react-hot-toast"

interface ConversationProps {
  session: Session
}

const ConversationsWrapper: React.FC<ConversationProps> = ({session}) => {
  const searchParams = useSearchParams()

  const currentConvoId = searchParams.get('conversationId')
  const {data: conversationsData, loading: conversationsLoading, error: conversationsError, subscribeToMore} = useQuery<conversationsData, {}>(Conversation.Queries.conversations)
  const [markConversationRead] = useMutation<{markConversationRead: boolean}, {conversationId: string; userId: string}>(Conversation.Mutations.markConversationRead)
  useSubscription<ConversationUpdatedData, {}>(Conversation.Subscriptions.conversationUpdated, {
    onData: ({client, data}) => {
      const {data: subscriptionData} = data
      if(!subscriptionData) return

      const {conversationUpdated: {conversation: updatedConversation}} = subscriptionData

      const currentlyViewing = updatedConversation.id === currentConvoId

      if(currentlyViewing) {
        onviewConversation(currentConvoId!, false)
      }
    }
  })
  
  const router = useRouter()

  const onviewConversation = async(conversationId: string, hasSeenLatest: boolean) => {
    console.log(conversationId)
    router.replace(`?conversationId=${conversationId}`)
    if(hasSeenLatest) return

    const userId = session?.user.id

    try { 
      markConversationRead({variables: {conversationId, userId}, optimisticResponse: {
        markConversationRead: true
      },
      update: (cache) => {
        const participantsFromCache = cache.readFragment<{participants: Array<ParticipantPopulated>}>({
          id: `Conversation:${conversationId}`,
          fragment: gql`
            fragment Participants on Conversation {
              participants {
                user {
                  id
                  username
                }
                hasSeenLatest
              }
            }
          `
        })

        if(!participantsFromCache) return

        const participants = [...participantsFromCache.participants]
        let participantidx = participants.findIndex((person)=> person.user.id === userId)
        if(participantidx == -1) return
        const userParticipant = participants[participantidx]
        participants[participantidx] = {
          ...userParticipant,
          hasSeenLatest: true
        }

        cache.writeFragment({
          id: `Conversation:${conversationId}`,
          fragment: gql`
            fragment updateParticipant on Conversation {
              participants 
            }
          `,
          data: {
            participants
          }
        })

      }
    })
    } catch(err) {
      console.log(err)
      toast.error('Failed to mark conversation as read.')
    }

  }
  

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: Conversation.Subscriptions.conversationCreated,
      updateQuery:  (prev, {subscriptionData} : {subscriptionData: {data : { conversationCreated: ConversationPopulated}}}) => {
        if(!subscriptionData.data) return prev;

        const newConversation = subscriptionData.data.conversationCreated
        const returnConvo = prev.conversations.length > 0 ? [newConversation, ...prev.conversations] : [newConversation]

        return Object.assign({}, prev, {
          conversations: returnConvo
        })
      }
    })
  }

  useEffect(()=>{
    subscribeToNewConversations()
  }, [])

  return (
    <Box width={{base: '100%', md: "400px", }} bg={'whiteAlpha.50'} py={6} px={3} display={{base: currentConvoId ? 'none' : 'flex', md: 'flex'}} flexDirection={'column'} gap={4}>
      {
        conversationsLoading ? 
          <SkeletonLoader count={7} height="80px" width='360px'/>
        :
        <ConversationList session={session} conversations={conversationsData?.conversations || []} onViewConversation={onviewConversation}/>
      }
      
      
    </Box>
  )
}

export default ConversationsWrapper