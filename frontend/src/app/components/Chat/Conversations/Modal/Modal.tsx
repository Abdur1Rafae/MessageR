import { Modal, ModalOverlay, ModalHeader, ModalContent, ModalCloseButton, ModalBody, Stack, Input, Button } from "@chakra-ui/react"
import { useState } from "react"
import { useLazyQuery, useMutation } from "@apollo/client"
import User from "@/src/graphql/operations/User"
import { CreateConversationData, SearchedUser, createConversationInput, searchUsersData, searchUsersInput } from "@/src/util/types"
import UserSearchList from "./UserSearchlist"
import Participants from "./Participants"
import toast from "react-hot-toast"
import Conversation from "@/src/graphql/operations/Conversation"
import { Session } from "next-auth"
import { useRouter } from "next/navigation"


interface ModalProps {
    isOpen: boolean,
    onClose: ()=>void,
    session: Session
}

const ConversationModal: React.FC<ModalProps> = ({isOpen, onClose, session}) => {
    
    const router = useRouter()
    
    const {user: {id: myUserId}} = session
    const [username, setUsername] = useState('')
    const [searchUsers, {data, loading, error}] = useLazyQuery<searchUsersData, searchUsersInput>(User.Queries.searchUsers)
    const [createConversation, {loading: createConversationLoading}] = useMutation<CreateConversationData, createConversationInput>(Conversation.Mutations.createConversations)
    const [selectedUsers, setSelectedUsers] = useState<Array<SearchedUser>>([])

    const selectUser = (user: SearchedUser) => {
        setSelectedUsers((prev) => [...prev, user])
    }

    const removeUser = (userId: string) => {
        setSelectedUsers((prev)=> prev.filter((p)=>p.id !== userId))
    }

    const createConversationCall = async() => {
        const ids = [myUserId, ...selectedUsers.map((user)=>user.id)]
        try {
            const {data} = await createConversation({variables: {participants: ids }})
            console.log("here is response: ", data)

            if(!data?.createConversation) {
                toast.error("Conversation could not be created.")
            }
            else {
                const {createConversation : {conversationId}} = data

                router.replace(`?conversationId=${conversationId}`)

                setSelectedUsers([])
                setUsername('')
                onClose()
            }
        } catch(err: any) {
            console.log(err)
            toast.error(err?.message)
        }
    }

    const onSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        searchUsers({variables: { username }});
        console.log('Username:', username)
    }
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={'#2d2d2d'} pb={4}>
                <ModalHeader>Create a conversation</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <form onSubmit={onSearch}>
                        <Stack spacing={4}>
                            <Input placeholder="Enter a username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                            <Button type="submit" isDisabled={!username} isLoading={loading}>
                                Search
                            </Button>
                        </Stack>
                    </form>
                    {
                        data && data.searchUsers && <UserSearchList users={data?.searchUsers} addUser={selectUser}/>
                    }
                    {
                        selectedUsers.length !== 0 && (
                            <>
                                <Participants participants={selectedUsers} removeUser={removeUser}/>
                                <Button bg={'brand.100'} width={'100%'} mt={6} _hover={{bg:'brand.100'}} onClick={createConversationCall} isLoading={createConversationLoading}>
                                    Create Conversation
                                </Button>
                            </>
                        )
                    }
                    
                </ModalBody>
            </ModalContent>
            </Modal>
        </>
        )
}

export default ConversationModal

