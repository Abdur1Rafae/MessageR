import { gql } from "@apollo/client"

export const MessageFields = `
    id
    sender {
        id
        username
    }
    body
    createdAt

`


export default {
    Queries: {
        messages: gql`
            query Messages($conversationId: String!) {
                messages(conversationId: $conversationId) {
                    ${MessageFields}
                }
            }
        `
    },
    Mutations: {
        sendMessage: gql`
            mutation sendMessage($id: String, $conversationId: String, $body: String, $senderId: String) {
                sendMessage(id: $id, senderId: $senderId, body: $body, conversationId: $conversationId)
            }
        `
    }, 
    Subscriptions: {
        messageSent: gql`
            subscription MessageSent($conversationId: String) {
                messageSent(conversationId: $conversationId) {
                    ${MessageFields}
                }
            }
        `
    }
}