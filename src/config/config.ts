import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
   env: process.env.NODE_ENV,
   port: process.env.PORT,
   database_url: process.env.DATABASE_URL,
   jwt: {
      secret: process.env.JWT_SECRET,
      expires_in: process.env.EXPIRES_IN,
      refresh_secret: process.env.REFRESH_SECRET,
      refresh_expires_in: process.env.REFRESH_EXPIRES_IN,
      passwordResetTokenExpirationTime: process.env.PASS_RESET_EXPIRATION_TIME,
   },
   aws: {
      access_key: process.env.AWS_ACCESS_KEY,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      s3_bucket_name: process.env.AWS_S3_BUCKET_NAME,
      s3_region: process.env.AWS_S3_REGION,
   },
   bycrypt_salt_rounds: process.env.SALT_ROUND,
};
