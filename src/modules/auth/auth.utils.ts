import bcrypt from 'bcrypt';
import env from '../../config/config';

export const hashedPassword = async (password: string): Promise<string> => {
   try {
      const hashedPassword: string = await bcrypt.hash(
         password,
         Number(env.bycrypt_salt_rounds)
      );
      return hashedPassword;
   } catch (error: unknown) {
      if (error instanceof Error) {
         throw new Error(`Error hashing password: ${error.message}`);
      } else {
         throw new Error('Unknown error occurred while hashing password');
      }
   }
};

export const comparePasswords = async (
   plainTextPassword: string,
   hashedPassword: string
): Promise<boolean> => {
   return await bcrypt.compare(plainTextPassword, hashedPassword);
};
