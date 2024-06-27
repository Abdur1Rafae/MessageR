import { useQuery } from "@apollo/client";
import { Button, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, {useEffect} from "react";
import Conversations from "../../../../../graphql/operations/Conversation";
import { formatUsernames } from "../../../../../util/functions";
import { conversationsData } from "../../../../../util/types";
import { HiArrowCircleLeft } from "react-icons/hi";

interface MessageHeaderProps {
    userId: string
    conversationId: string
}

const MessageHeader: React.FC<MessageHeaderProps> = ({userId, conversationId}) => {
    const router = useRouter()
    const {data, loading} = useQuery<conversationsData, {}>(Conversations.Queries.conversations)
    
    const conversation = data?.conversations.find((convo)=>convo.id == conversationId)

    if (data?.conversations && !loading && !conversation) {
        console.log("cancelling search param")
        router.replace('/');
    }

    return (
        <Stack direction={'row'} align={'center'} spacing={6} py={5} px={{ base: 4, md: 4}} borderBottom={'1px solid'} borderColor={'whiteALpha.200'}>
            <Button display={{md: 'none'}} onClick={()=>router.replace("/")}><HiArrowCircleLeft size={31}/></Button>
            {!conversation && !loading && <div>Conversation not Found</div>}
            {conversation && (
                <Stack direction={'row'} alignItems={'center'}>
                    <Text fontWeight={600}>{formatUsernames(conversation.participants, userId)}</Text>
                </Stack>
            )}
        </Stack>
    )
} 

export default MessageHeader