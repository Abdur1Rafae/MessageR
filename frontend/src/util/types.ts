/**User */
import { ConversationPopulated, MessagePopulated } from '../../../backend/src/utils/type'

export interface UserNameData {
    createUsername: {
        success: boolean,
        error: string
    }
}

export interface createUsernameVariables {
    username: string
}

export interface searchUsersInput {
    username: string
}

export interface searchUsersData {
    searchUsers: Array<{id: string, username: string, image: string}>;
}

export interface SearchedUser {
    image: string,
    username: string,
    id: string
}

/** CONVERSATION */

export interface CreateConversationData {
    createConversation : {
        conversationId: string
    }
}

export interface createConversationInput {
    participants: Array<string>
}

export interface conversationsData{
    conversations: Array<ConversationPopulated>
}


/**mesages */

export interface MessagesData {
    messages: Array<MessagePopulated>
}

export interface MessageVariables {
    conversationId: string
}

export interface MessageSubscriptionData {
    subscriptionData: {
        data: {
            messageSent: MessagePopulated;
        }
    }
}

export interface ConversationUpdatedData {
    conversationUpdated : {
        // conversation : Omit<ConversationPopulated, 'latestMessage'> & {
        //     latestMessage: MessagePopulated
        // }
        conversation: ConversationPopulated
    }
}