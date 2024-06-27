'use client';

import { Box, Text } from "@chakra-ui/react"
import { Session } from "next-auth"
import ConversationModal from './Modal/Modal'
import { useState } from "react";
import { ConversationPopulated } from "../../../../../../backend/src/utils/type";
import ConversationItem from "./ConversationItem";
import { useSearchParams } from "next/navigation";

interface ListProps {
  session: Session
  conversations: Array<ConversationPopulated>
  onViewConversation: (conversationId: string, hasSeenLatest: boolean) => void
} 

const ConversationList: React.FC<ListProps> = ({session, conversations, onViewConversation}) => {
  const [modalOpen, setModalOpen] = useState(false)

  console.log(conversations)
  const sortedConversations = [...conversations].sort((a,b)=> new Date(b.updatedAt).valueOf() - new Date(a.updatedAt).valueOf())
  console.log(sortedConversations)
  const {user: {id: userId}} = session

  const searchParams = useSearchParams()

  const currentConvoId = searchParams.get('conversationId')
  
  const onOpen = () => {
    setModalOpen(true)
  }

  const onClose = () => {
    setModalOpen(false)
  }
  return (
    <Box width={'100%'}>
      <Box py={2} px={4} mb={4} bg={'blackAlpha.300'} borderRadius={4} onClick={onOpen} cursor={'pointer'}>
        <Text textAlign={'center'} color={'whiteAlpha.800'} fontWeight={500}>Find or Start a conversation</Text>
      </Box>
      <ConversationModal isOpen={modalOpen} onClose={onClose} session={session}/>
      {
        sortedConversations.map((conv) => (
          <ConversationItem key={conv.id} userId={userId} conversation={conv} onClick={onViewConversation} selectedConversationId={currentConvoId || undefined}/>
        ))
      }
    </Box>
  )
}

export default ConversationList