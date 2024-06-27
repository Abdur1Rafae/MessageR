import { Prisma } from "@prisma/client"
import { ConversationPopulated, ConversationUpdatedSubscriptionData, GraphQlContext, Session } from "../../utils/type"
import { GraphQLError, subscribe } from "graphql"
import { withFilter } from "graphql-subscriptions"

const resolvers = {
    Query: {
        conversations: async(_: any, __: any, context: GraphQlContext): Promise<Array<ConversationPopulated>> => {
            const {session, prisma, pubsub } = context

            if(!session?.user) {
                throw new GraphQLError("Not Authorized")
            }

            const {user: {id}} = session

            try {
                const conversations = await prisma.conversation.findMany({
                    include: conversationPopulated,
                });

                return conversations.filter(
                (conversation) =>
                    !!conversation.participants.find((p) => p.userId === id)
                );
            } catch(err: any) {
                console.log(err)
                throw new GraphQLError(err?.message)
            }
        }
    }, 
    Mutation: {
        createConversation: async (_: any, args: {participantIds: Array<string>}, context: GraphQlContext): Promise<{conversationId: string}> => {
            const {session, prisma, pubsub } = context
            const {participantIds} = args

            if(!session?.user) {
                throw new GraphQLError("Not Authorized")
            }

            const {user: {id: userId}} = session

            try {
                const conversation = await prisma.conversation.create({
                    data: {
                        participants: {
                            createMany: {
                                data: participantIds.map(id=> ({
                                    userId: id,
                                    hasSeenLatest: id === userId,

                                }))
                            }
                        },
                    },
                    include: conversationPopulated
                })

                pubsub.publish('CONVERSATION_CREATED', {
                    conversationCreated: conversation,
                    session: session
                })

                return {
                    conversationId: conversation.id
                } 
            } catch(err: any) {
                console.log(err)
                throw new GraphQLError(err?.message)
            }
        },
        markConversationRead: async(_: any, args: {conversationId: string; userId: string}, context: GraphQlContext): Promise<boolean> => {
            const {session, prisma, pubsub } = context
            const {conversationId, userId} = args

            if(!session?.user) {
                throw new GraphQLError("Not Authorized")
            }

            try {
                const convoPart = await prisma.conversationParticipant.findFirst({
                    where: {
                        conversationId,
                        userId
                    }
                })

                if(!convoPart) {
                    throw new GraphQLError('Conversation participant does not exist')
                }

                await prisma.conversationParticipant.update({
                    where: {
                        id: convoPart.id
                    },
                    data: {
                        hasSeenLatest: true
                    }
                });
                return true
            } catch (err: any) {
                console.log(err)
                throw new GraphQLError(err?.message)
            }
        }
    }, 
    Subscription: {
        conversationCreated: {
            subscribe: withFilter((_:any, __:any, context: GraphQlContext) => {
                const {pubsub} = context
                return pubsub.asyncIterator(['CONVERSATION_CREATED'])
            }, (payload: conversationCreatedSubsPayload)=>{
                
                const {conversationCreated: {participants}, session} = payload
                if (!session?.user) {
                    throw new GraphQLError("Not authorized");
                }

                const userIsParticipant = !!participants.find((participant)=>participant.userId == session.user?.id)
                return userIsParticipant
            }) 
        },
        conversationUpdated: {
            subscribe: withFilter((_:any, __:any, context: GraphQlContext) => {
                const {pubsub} = context
                return pubsub.asyncIterator(['CONVERSATION_UPDATED'])
            }, (payload: ConversationUpdatedSubscriptionData) => {
                const {conversationUpdated: {conversation}, session} = payload
                if (!session?.user) {
                    throw new GraphQLError("Not authorized");
                }

                const userIsParticipant = !!conversation.participants.find((participant)=>participant.userId == session.user?.id)
                return userIsParticipant
            })
        }
    }
}

export const participantPopulated = Prisma.validator<Prisma.ConversationParticipantInclude>()({
    user: {
        select: {
            id: true,
            username: true
        }
    }
})

export interface conversationCreatedSubsPayload {
    conversationCreated: ConversationPopulated
    session: Session
}

export const conversationPopulated = Prisma.validator<Prisma.ConversationInclude>()({
    participants: {
        include: participantPopulated
    },
    latestMessage: {
        include : {
            sender : {
                select : {
                    id: true,
                    username: true
                }
            }
        }
    }
})

export default resolvers