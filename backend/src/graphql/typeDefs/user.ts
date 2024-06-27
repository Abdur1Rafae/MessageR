import gql from 'graphql-tag';

const userTypeDefs = gql`
    type SearchedUser {
        id: String,
        username: String,
        image: String
    }

    type User {
        id: String
        image: String
        username: String
        email: String
        emailVerified: String
        name: String
    }

    type CreateUsernameResponse {
        success: Boolean,
        error: String
    }

    type Query {
        searchUsers(username: String): [SearchedUser]
    }

    type Mutation {
        createUsername(username: String): CreateUsernameResponse
    }
`

export default userTypeDefs