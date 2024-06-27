import {
    Avatar,
    Box,
    Flex,
    Menu,
    MenuItem,
    MenuList,
    Stack,
    Text,
  } from "@chakra-ui/react";
  import { formatRelative } from "date-fns";
  import enUS from "date-fns/locale/en-US";
  import React, { useState } from "react";
  import { MdDeleteOutline } from "react-icons/md";
  import { BiLogOut } from "react-icons/bi";
  import { AiOutlineEdit } from "react-icons/ai";
  import { formatUsernames } from "../../../../util/functions";
import { ConversationPopulated } from "../../../../../../backend/src/utils/type"
import { MdGroups } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";

interface ConversationItemProps {
    conversation: ConversationPopulated
    userId: string,
    onClick: (conversationId: string, hasSeenLatest: boolean)=>void,
    selectedConversationId?: string
}

const formatRelativeLocale = {
    lastWeek: "eeee",
    yesterday: "'Yesterday",
    today: "p",
    other: "MM/dd/yy",
};

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, userId, onClick, selectedConversationId}) => {
    const [menuOpen, setMenuOpen] = useState(false)

    const myUser = conversation.participants.find((user: any)=> user.user.id == userId)

    const handleClick = (event: React.MouseEvent) => {
      if(event.type === "click") {
          onClick(conversation.id, myUser.hasSeenLatest);
      }
      else if( event.type === "contextmenu") {
          event.preventDefault()
          setMenuOpen(true)
      }
    }

    // const showMenu = 

    return (
        <Stack direction="row" align="center" justify="space-between" p={4} cursor="pointer"borderRadius={4}
            bg={ conversation.id === selectedConversationId ? "whiteAlpha.200" : "none"} _hover={{ bg: "whiteAlpha.200" }}
            onClick={handleClick}
            onContextMenu={handleClick}
            position="relative">
              <Flex position={'absolute'} left={'-6px'}>
                {myUser.hasSeenLatest == false && (
                  <GoDotFill size={10}/>
                )}
              </Flex>
            <Avatar icon={conversation.participants.length > 2 ? <MdGroups/> : <FaUser/>}/>
      <Flex justify="space-between" width="80%" height="100%">
        <Flex direction="column" width="70%" height="100%">
          <Text
            fontWeight={600}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.latestMessage && (
            <Box width="140%">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                fontSize={'sm'}
              >
                {conversation.latestMessage.body}
              </Text>
            </Box>
          )}
        </Flex>
      </Flex>
      <Text color="whiteAlpha.700" position={'absolute'} right={4} textAlign="right" fontSize={'xs'} top={5}>
          {
            formatRelative(conversation.updatedAt, new Date(), {
              locale: {
                  ...enUS,
                  formatRelative: (token) => formatRelativeLocale[token as keyof typeof formatRelativeLocale]
              }
            })
          }
      </Text>
      </Stack>
    )
}


export default ConversationItem