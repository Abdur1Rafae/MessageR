import { Prisma } from "@prisma/client"
import { GraphQlContext, MessagePopulated, MessageSentSubsPayload, SendMessageArgs } from "../../utils/type"
import { GraphQLError, subscribe } from "graphql"
import { withFilter } from "graphql-subscriptions"
import { userIsConversationParticipant } from "../../utils/functions"
import { conversationPopulated } from "./conversation"


const resolvers = {
    Query: {
        messages: async function (_: any, args: {conversationId: string}, context: GraphQlContext): Promise<Array<MessagePopulated>> {
            const {session, prisma} = context;
            const {conversationId} = args

            if(!session?.user) {
                throw new GraphQLError("Not Authorized")
            }

            const {user: {id: userId}} = session

            const conversationExist = await prisma.conversation.findUnique({
                where: {
                    id: conversationId
                },
                include : conversationPopulated
            })

            if(!conversationExist) {
                throw new GraphQLError("Conversation not found")
            }

            const allowedToView = userIsConversationParticipant(conversationExist.participants, userId)

            if(!allowedToView) {
                throw new GraphQLError("Not Authorized to view these messages")
            }

            try {
                const messages = await prisma.message.findMany({
                    where: {
                        conversationId: conversationId
                    },
                    include: messagePopulated,
                    orderBy: {
                        createdAt: "desc"
                    }
                })

                return messages
            } catch(err: any) {
                console.log(err)
                throw new GraphQLError(err?.message)
            }
        }
    },
    Mutation: {
        sendMessage: async function(_: any, args: SendMessageArgs, context: GraphQlContext): Promise<boolean> {

            const {session, prisma, pubsub } = context

            if(!session?.user) {
                throw new GraphQLError("Not Authorized")
            }

            const {user: {id: userId}} = session
            const {body, id: messageId, conversationId, senderId} = args

            if(userId !== senderId) {
                throw new GraphQLError("Not Authorized to send this message")
            }

            try {
                const newMessage = await prisma.message.create({
                    data: {
                        id: messageId,
                        senderId,
                        conversationId,
                        body
                    },
                    include: messagePopulated
                })


                const conversationParticipant = await prisma.conversationParticipant.findFirst({
                    where: {
                        userId,
                        conversationId
                    }
                })

                if(!conversationParticipant){
                    throw new GraphQLError("Conversation not found.")
                }
                else {
                    const conversation = await prisma.conversation.update({
                        where: {
                            id: conversationId
                        },
                        data: {
                            latestMessageId: newMessage.id,
                            participants : {
                                update : {
                                    where: {
                                        id: conversationParticipant.id
                                    },
                                    data: {
                                        hasSeenLatest: true
                                    }
                                },
                                updateMany : {
                                    where: {
                                        NOT: {
                                            userId
                                        }
                                    },
                                    data: {
                                        hasSeenLatest: false
                                    }
                                }
                            }
                        },
                        include: conversationPopulated
                    })
    
                    pubsub.publish('MESSAGE_SENT', {messageSent: newMessage})
                    pubsub.publish('CONVERSATION_UPDATED', {conversationUpdated:{conversation}, session: session})
                }
                
                
            } catch(err: any) {
                console.log(err)
                throw new GraphQLError(err?.message)
            }


            return true;
        }
    },
    Subscription: {
        messageSent: {
            subscribe: withFilter((_:any, __:any, context: GraphQlContext)=> {
                const {pubsub} = context
                return pubsub.asyncIterator(['MESSAGE_SENT'])
            }, (payload: MessageSentSubsPayload, args: {conversationId: string})=>{
                return payload.messageSent.conversationId === args.conversationId
            })
        }
    }
}

export const messagePopulated = Prisma.validator<Prisma.MessageInclude>() ({
    sender: {
        select: {
            id: true,
            username: true,
            image: true
        }
    }
})


export default resolvers