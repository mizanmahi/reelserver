import { S3Client } from '@aws-sdk/client-s3';
import config from '../config/config';

if (!config.aws.access_key || !config.aws.secret_access_key) {
   throw new Error('AWS credentials are not defined');
}

const s3 = new S3Client({
   region: config.aws.s3_region as string,
   credentials: {
      accessKeyId: config.aws.access_key,
      secretAccessKey: config.aws.secret_access_key,
   },
});

export default s3;
