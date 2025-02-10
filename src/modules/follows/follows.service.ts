import { JwtPayload } from 'jsonwebtoken';

const toggleFollow = async (authUser: JwtPayload) => {
   console.log(authUser);
};

export const FollowsService = {
   toggleFollow,
};
