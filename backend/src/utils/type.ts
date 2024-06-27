import { Prisma, PrismaClient } from "@prisma/client";
import {ISODateString} from "next-auth"
import { conversationPopulated, participantPopulated } from "../graphql/resolvers/conversation";
import { Context } from "graphql-ws";
import { PubSub } from "graphql-subscriptions";
import { messagePopulated } from "../graphql/resolvers/message";

export interface GraphQlContext {
    session: Session | null;
    prisma: PrismaClient;
    pubsub: PubSub
}



//user types

export interface Session {
    user: User;
    expires: ISODateString 
}

export interface User {
    id: string;
    username: string;
    image: string;
    name: string;
    email: string;
    emailVerified: boolean;
}

export interface createUsernameResponse {
    success: boolean,
    error: string
}

export type ConversationPopulated = Prisma.ConversationGetPayload<{include: typeof conversationPopulated}>

export type ParticipantPopulated = Prisma.ConversationParticipantGetPayload<{include: typeof participantPopulated}>

/**SERVER CONFIGURATION */

export interface SubscriptionContext extends Context {
    connectionParams: {
        session?: Session
    }
}

export interface ConversationUpdatedSubscriptionData {
    conversationUpdated : {
        conversation: ConversationPopulated
    }
    session: Session
}

/**messages */

export interface SendMessageArgs {
    id: string,
    senderId: string,
    conversationId: string,
    body: string
}

export interface MessageSentSubsPayload {
    messageSent: MessagePopulated;
}

export type MessagePopulated = Prisma.MessageGetPayload<{include: typeof messagePopulated}>
