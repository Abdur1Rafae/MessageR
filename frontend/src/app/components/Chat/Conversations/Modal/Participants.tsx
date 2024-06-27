import { SearchedUser } from "@/src/util/types";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { IoCloseCircleOutline } from "react-icons/io5";

interface ParticipantProps {
    participants: Array<SearchedUser>;
    removeUser: (userid: string) => void
}

const Participants: React.FC<ParticipantProps> = ({participants, removeUser}) => {
    return (
        <Flex mt={8} gap={'10px'} flexWrap={'wrap'}>
            {
                participants.map(participant => (
                    <Stack direction={'row'} key={participant.id} align={'center'} bg={'whiteAlpha.200'} borderRadius={2} p={2}>
                        <Text>{participant.username}</Text>
                        <IoCloseCircleOutline size={20} cursor={'pointer'} onClick={()=>removeUser(participant.id)}/>
                    </Stack>
                ))
            }
        </Flex>
    )
}

export default Participants