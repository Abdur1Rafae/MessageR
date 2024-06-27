import { GraphQlContext, createUsernameResponse } from "../../utils/type";
import { User } from "@prisma/client";

const userResolvers = {
    Query: {
        searchUsers: async(_:any, args: {username: string}, context: GraphQlContext): Promise<Array<User>>=>{
            const {username: searchedUsername} = args;
            const { prisma, session } = context;

            if(!session) {
                throw new Error('Not authorized')
            }

            const {
                user: {username: myUsername}
            } = session

            try {
                const users = await prisma.user.findMany({
                    where : {
                        username : {
                            contains: searchedUsername,
                            not: myUsername,
                            mode: 'insensitive'
                        }
                    },
                })

                return users;
            } catch(err: any) {
                console.log(err)
                throw new Error(err.message)
            }
        }
    },

    Mutation: {
        createUsername: async (_:any, args: {username: string}, context: GraphQlContext ) : Promise<createUsernameResponse>=>{
            const {username} = args;
            const { prisma, session } = context;

            if(!session) {
                return {success: false, error: "Unauthorized"}
            }

            const  { id: userId } = session.user

            try {
                const uniqueUsername = await prisma.user.findUnique({
                    where: {
                        username
                    }
                })

                if(uniqueUsername) {
                    return {success: false, error: "Username Exists"}
                }

                await prisma.user.update({
                    where : {
                        id: userId,
                    },
                    data: {
                        username
                    }
                })

                return {success: true, error: "None"}
            } catch(err: any) {
                console.log(err)
                return {success: false, error: err?.message}
            }
        }
    },
}

export default userResolvers;