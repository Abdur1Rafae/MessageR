import gql from 'graphql-tag';

const typeDefs =gql`
    scalar Date

    type Conversation {
        id: String,
        latestMessage: Message
        participants: [Participant]
        createdAt: Date
        updatedAt: Date
    }

    type ConversationUpdatedPayload {
        conversation: Conversation,

    }

    type Participant {
        id: String
        user: User
        hasSeenLatest: Boolean
    }

    type Query {
        conversations: [Conversation]
    }
    
    type Mutation {
        createConversation(participantIds: [String]): CreateConversationResponse
    }

    type Mutation {
        markConversationRead(conversationId: String, userId: String): Boolean
    }

    type CreateConversationResponse {
        conversationId: String
    }

    type Subscription {
        conversationCreated: Conversation
    }

    type Subscription {
        conversationUpdated: ConversationUpdatedPayload
    }
`

export default typeDefs