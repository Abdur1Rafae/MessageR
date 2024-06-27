import { Flex, Stack, Text } from "@chakra-ui/react"
import { useQuery } from "@apollo/client"
import { MessageVariables, MessagesData } from "@/src/util/types"
import Message from "@/src/graphql/operations/Message"
import toast from "react-hot-toast"
import SkeletonLoader from "../../../common/SkeletonLoader"
import { MessageSubscriptionData } from "@/src/util/types"
import { useEffect } from "react"
import MessageItem from "./MessageItem"

interface MessageProps {
    userId: string
    conversationId: string
}

const Messages: React.FC<MessageProps> = ({userId, conversationId}) => {    
    const { data, loading, error, subscribeToMore } = useQuery<MessagesData, MessageVariables>(Message.Queries.messages, {variables: {conversationId}, 
        onError: ({message})=>{toast.error(message)}})

        console.log(data?.messages)

    const subscribeToMoreMessages = (conversationId: string) => {
        subscribeToMore({
            document: Message.Subscriptions.messageSent,
            variables: {
                conversationId: conversationId
            },
            updateQuery: (prev, { subscriptionData }: MessageSubscriptionData) => {
                if(!subscriptionData) {
                    return prev
                }

                const newMessage = subscriptionData.data.messageSent

                if(newMessage.sender.id === userId) {
                    return prev
                }

                return Object.assign({}, prev, {
                    messages: [newMessage, ...prev.messages]
                })
            }
        })
    }

    useEffect(()=>{
        subscribeToMoreMessages(conversationId)
    }, [conversationId])

    if(error) {
        return null;
    }

    return (
        <Flex direction={'column'} justify={'flex-end'} overflow={'hidden'}>
            {
                loading && (
                    <Stack spacing={4} px={4}>
                        <SkeletonLoader count={4} height="35px" width="10px"/>
                    </Stack>
                )
            }

            {
                data?.messages && (
                    <Flex direction={'column-reverse'} overflowY={'scroll'} height={'100%'} css={{
                        '&::-webkit-scrollbar': {
                          width: '14px',
                        },
                        '&::-webkit-scrollbar-track': {
                          width: '16px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'brand.100',
                          borderRadius: '24px',
                        },
                      }}>
                        {
                            data.messages.map((msg) => (
                                <MessageItem key={msg.id} message={msg} sentByMe={userId === msg.sender.id}/>
                            ))
                        }
                    </Flex>
                )
            }
        </Flex>
    )
}

export default Messages