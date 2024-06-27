import { gql } from "@apollo/client"
import { MessageFields } from "./Message"

const ConversationField  = `
    id 
    participants {
        user {
            id
            username
        }
        hasSeenLatest
    }
    latestMessage {
        ${MessageFields}
    }
    updatedAt
`


export default {
    Queries:{
        conversations: gql`
    	    query Conversations {
                conversations {
                    ${ConversationField}
                }
            }
        `
    },
    Mutations: {
        createConversations: gql`
            mutation CreateConversations($participants: [String]!) {
                createConversation(participantIds: $participants) {
                    conversationId
                }
            }
        `,
        markConversationRead: gql`
            mutation markConversationRead($conversationId: String, $userId: String) {
                markConversationRead(conversationId: $conversationId, userId: $userId) 
            }
        `

    },
    Subscriptions: {
        conversationCreated: gql`
            subscription ConversationCreated {
                conversationCreated {
                    ${ConversationField}
                }
            }
        `,
        conversationUpdated: gql`
            subscription ConversationUpdated {
                conversationUpdated {
                    conversation {
                        ${ConversationField}
                    }
                }
            }
        `
    }
}