import { Session } from "next-auth"
import { Box, Input } from "@chakra-ui/react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useMutation } from "@apollo/client"
import Message from "@/src/graphql/operations/Message"
import { MessagePopulated, SendMessageArgs } from "../../../../../../../backend/src/utils/type"
import ObjectID from 'bson-objectid'
import { MessagesData } from "@/src/util/types"

interface MessageInputProps {
    session: Session
    conversationId: string
}

const MessageInput: React.FC<MessageInputProps> = ({session, conversationId}) => {
    const [message, setMessage] = useState('')
    const [sendMessage, {data, loading, error}] = useMutation<{ sendMessage: boolean}, SendMessageArgs>(Message.Mutations.sendMessage, {onError:({message})=> toast.error("Mesage could not be sent.")})

    const onSendMessage = async(e: React.FormEvent)=> {
        e.preventDefault()

        try { 
            const {user: {id: senderId}} = session
            const messageId = ObjectID()
            const newMessage: SendMessageArgs = {
                id: messageId.toHexString(),
                senderId,
                conversationId,
                body: message
            }
            setMessage('')
            const {data, errors} = await sendMessage({
                variables: {
                    ...newMessage
                },
                optimisticResponse: {
                    sendMessage: true, 
                },
                update: (cache)=>{
                    const existing = cache.readQuery<MessagePopulated>({
                        query: Message.Queries.messages,
                        variables: { conversationId }
                    }) as MessagesData

                    cache.writeQuery<MessagesData, { conversationId: string}>({
                        query: Message.Queries.messages,
                        variables: {conversationId},
                        data: {
                            ...existing,
                            messages: [{
                                id: messageId,
                                body: message,
                                senderId: session.user.id,
                                conversationId,
                                sender: {
                                    id: session.user.id,
                                    username:session.user.username
                                },
                                createdAt: new Date(Date.now()), 
                                updatedAt: new Date(Date.now())
                            }, 
                            ...existing.messages]
                        }
                    })
                }
            }) 
        } catch(err: any) {
            console.log(err)
            toast.error(err?.message)
        }
    }


    return (
        <Box px={4} py={6} width={'100%'}>
            <form onSubmit={onSendMessage}>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} size={'md'} placeholder="New Message" 
                _focus={{boxShadow: 'none', border: '1px solid', borderColor: 'whiteAlpha.200'}} _hover={{borderColor: "whiteAlpha.300"}}
                resize={"none"}/>
            </form>
        </Box>
    )
}

export default MessageInput