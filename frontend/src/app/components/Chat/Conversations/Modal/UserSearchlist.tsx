import { SearchedUser } from "@/src/util/types"
import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react"

interface USList {
    users: Array<SearchedUser>;
    addUser: (user: SearchedUser) => void;
}

const UserSearchList: React.FC<USList> = ({users, addUser}) => {
    return (
        <>
        {
            users.length == 0 ? (
                <Flex mt={6} justify={'center'}>
                    <Text>No users found</Text>
                </Flex>
            ) : (
                <Stack mt={6}>
                    {
                        users.map((user) => (
                            <Stack key={user.id} direction={'row'} align={'center'} spacing={4} px={2} py={4} borderRadius={4} _hover={{bg: "whiteAlpha.200"}}>
                                <Avatar src={user.image} referrerPolicy={'no-referrer'}/>
                                <Flex justify={'space-between'} align={'center'} width={'100%'}>
                                    <Text color={'whiteAlpha.700'}>{user.username}</Text>
                                    <Button bg='brand.100' _hover={{bg: 'brand.100'}} onClick={()=>addUser(user)}>Select</Button>
                                </Flex>
                                
                            </Stack>
                        ))
                    }
                </Stack>
            )
        }
        </>
    )
}

export default UserSearchList