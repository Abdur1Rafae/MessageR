import { Stack, Flex, Avatar, Text, Box } from "@chakra-ui/react"
import { MessagePopulated } from "../../../../../../../backend/src/utils/type"
import { formatRelative } from "date-fns"
import { enUS } from "date-fns/locale/en-US"

interface MessageItemProps {
    message: MessagePopulated,
    sentByMe: boolean
}

const formatRelativeLocale = {
    lastWeek: "eeee 'at' p",
    yerterday: "Yesterday at' p",
    today: "p",
    other: "dd/MM/yy"
}

const MessageItem: React.FC<MessageItemProps> = ({message, sentByMe}) => {
    return (
        <Stack direction={'row'} px={4} py={2} _hover={{bg: 'whiteAlpha.200'}} wordBreak={'break-word'} alignItems={'start'}>
            {
                !sentByMe && (
                    <Avatar size={'xs'} src={message.sender.image} referrerPolicy="no-referrer" mt={2}/>
                )
            }
            <Stack spacing={1} width={'100%'}>
                <Stack direction={'row'} alignItems={'center'} justify={sentByMe ? 'flex-end': 'flex-start'}>
                    {
                        !sentByMe && (
                            <Text fontWeight={500} textAlign={'left'} fontSize={'xs'} ml={1}>
                                {message.sender.username}
                            </Text>
                        )
                    }
                    <Text fontSize={10} color={'whiteAlpha.700'}>
                    {
                        formatRelative(message.createdAt, new Date(), {
                            locale: {
                                ...enUS,
                                formatRelative: (token) => formatRelativeLocale[token as keyof typeof formatRelativeLocale]
                            }
                        })
                    }
                    </Text>
                </Stack>
                <Flex justify={sentByMe ? 'flex-end': 'flex-start'}>
                    <Box bg={sentByMe ? 'gray.600': 'whiteAlpha.300'} px={2} py={1} borderRadius={12} maxWidth={{ base: '90%' ,md:'65%'}}>
                        <Text fontSize={'sm'}>{message.body}</Text>
                    </Box>
                </Flex>
            </Stack>
        </Stack>
    )
}

export default MessageItem