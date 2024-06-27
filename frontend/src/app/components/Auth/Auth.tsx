import { useMutation } from "@apollo/client";
import { Button, Center, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";
import UserOperations from '../../../graphql/operations/User';
import { UserNameData, createUsernameVariables } from "@/src/util/types";
import toast from "react-hot-toast";

interface IAuthProps {
  session: Session | null;
  reloadSession: () => void;
}

const Auth: React.FC<IAuthProps> = ({ session, reloadSession }) => {
  const [username, setUsername] = useState('');

  const [CreateUserName, { loading, error }] = useMutation<UserNameData, createUsernameVariables>(UserOperations.Mutations.createUsername);

  const onSubmit = async () => {
    if (!username) return;
    try {
      const { data } = await CreateUserName({ variables: { username } });

      if(!data?.createUsername) {
        throw new Error();
      }

      if(data.createUsername.error !== "None") {
        const {createUsername: {error}} = data;
        
        throw new Error(error)
      }

      toast.success('Username created successfully!')

      reloadSession()

    } catch (err: any) {
      toast.error(err?.message)
      console.log('in catch block', err);
    }
  };

  return (
    <Center height={'100vh'}>
      <Stack align={'center'} spacing={8}>
        {session ? (
          <>
            <Text fontSize={"3xl"}>Create a Username</Text>
            <Input
              placeholder="Enter a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button
              width={'100%'}
              onClick={onSubmit}
              isLoading={loading} // Disable button while loading
            >
              Save
            </Button>
            {error && <Text color="red.500">Error: {error.message}</Text>}
          </>
        ) : (
          <>
            <Text fontSize={"3xl"}>MessageR</Text>
            <Button
              isLoading={loading}
              onClick={() => signIn("google")}
              leftIcon={<Image height={'20px'} src="/images/googlelogo.png" />}
            >
              Continue with Google
            </Button>
          </>
        )}
      </Stack>
    </Center>
  );
};

export default Auth;
