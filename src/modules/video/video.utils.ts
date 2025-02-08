import { Worker } from 'worker_threads';
import { tmpdir } from 'os';
import { join } from 'path';
// import minioClient from '../../clients/minio';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { writeFileSync, unlinkSync } from 'fs';
import config from '../../config/config';
import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import s3 from '../../clients/s3Client';

if (!ffmpegPath) {
   throw new Error(
      'FFmpeg binary not found. Please ensure ffmpeg-static is installed.'
   );
}
ffmpeg.setFfmpegPath(ffmpegPath);

const getVideoDuration = (
   videoPath: string
): Promise<{ duration: number; metadata: ffmpeg.FfprobeData }> => {
   return new Promise((resolve, reject) => {
      ffmpeg(videoPath).ffprobe((err, metadata) => {
         if (err) {
            reject(
               new Error('Failed to extract video duration: ' + err.message)
            );
         } else {
            const duration = metadata.format.duration; // Duration in seconds
            console.log({ metadata });
            if (duration === undefined) {
               reject(new Error('Could not determine video duration.'));
            } else {
               resolve({ duration, metadata });
            }
         }
      });
   });
};

export const processVideoUpload = async (
   videoBuffer: Buffer,
   originalName: string
): Promise<{
   compressedVideoUrl: string;
   thumbnailUrl: string;

   metadata: ffmpeg.FfprobeData;
}> => {
   return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const tempVideoPath = join(tmpdir(), `input_${timestamp}.mp4`);
      const compressedVideoPath = join(tmpdir(), `compressed_${timestamp}.mp4`);
      const thumbnailPath = join(tmpdir(), `thumbnail_${timestamp}.png`);

      try {
         // Write the video buffer to a temporary file
         writeFileSync(tempVideoPath, videoBuffer);

         // Check video duration
         getVideoDuration(tempVideoPath)
            .then(({ duration, metadata }) => {
               if ((duration as number) > 60) {
                  // 1 minute = 60 seconds
                  unlinkSync(tempVideoPath); // Clean up the temporary file
                  reject(new Error('Video duration must not exceed 1 minute.'));
               } else {
                  // Proceed with video processing
                  const worker = new Worker(join(__dirname, 'videoWorker.ts'), {
                     workerData: {
                        videoBuffer,
                        tempVideoPath,
                        compressedVideoPath,
                        thumbnailPath,
                     },
                  });

                  worker.on('message', async (message) => {
                     if (message.error) {
                        reject(new Error(message.error));
                     } else {
                        try {
                           const compressedVideoData = Buffer.from(
                              message.compressedVideoData
                           );
                           const thumbnailData = Buffer.from(
                              message.thumbnailData
                           );

                           console.log(
                              'Compressed video data is Buffer:',
                              Buffer.isBuffer(compressedVideoData)
                           );
                           console.log(
                              'Thumbnail data is Buffer:',
                              Buffer.isBuffer(thumbnailData)
                           );

                           // Upload compressed video to MinIO
                           const compressedVideoKey = `videos/compressed_${timestamp}_${originalName}`;
                           const thumbnailKey = `thumbnails/${timestamp}_preview.png`;
                           // await minioClient.putObject(
                           //    bucketName,
                           //    compressedVideoKey,
                           //    compressedVideoData
                           // );

                           // Upload thumbnail to MinIO
                           // await minioClient.putObject(
                           //    bucketName,
                           //    thumbnailKey,
                           //    thumbnailData
                           // );

                           // const compressedVideoUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoKey}`;
                           // const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailKey}`;

                           // config for s3
                           const videoParams: PutObjectCommandInput = {
                              Bucket: config.aws.s3_bucket_name,
                              Key: compressedVideoKey,
                              Body: compressedVideoData,
                           };

                           const videoUploadCommand = new PutObjectCommand(
                              videoParams
                           );
                           await s3.send(videoUploadCommand);

                           const url = `https://${config.aws.s3_bucket_name}.s3.${config.aws.s3_region}.amazonaws.com/${videoParams.Key}`;

                           const thumbnailParams: PutObjectCommandInput = {
                              Bucket: config.aws.s3_bucket_name,
                              Key: thumbnailKey,
                              Body: thumbnailData,
                           };

                           const thumbnailUploadCommand = new PutObjectCommand(
                              thumbnailParams
                           );
                           await s3.send(thumbnailUploadCommand);

                           // Construct public URLs
                           const thumbnailUrl = `https://${config.aws.s3_bucket_name}.s3.${config.aws.s3_region}.amazonaws.com/${thumbnailParams.Key}`;

                           resolve({
                              compressedVideoUrl: url,
                              thumbnailUrl: thumbnailUrl,
                              metadata,
                           });
                        } catch (error) {
                           reject(
                              new Error(
                                 'Failed to upload files to MinIO: ' +
                                    (error as Error).message
                              )
                           );
                        }
                     }
                  });

                  worker.on('error', (error) => {
                     reject(new Error('Worker thread error: ' + error.message));
                  });

                  worker.on('exit', (code) => {
                     if (code !== 0) {
                        reject(
                           new Error(`Worker stopped with exit code ${code}`)
                        );
                     }
                  });
               }
            })
            .catch((error) => {
               unlinkSync(tempVideoPath); // Clean up the temporary file
               reject(
                  new Error(
                     'Failed to validate video duration: ' + error.message
                  )
               );
            });
      } catch (writeError) {
         reject(
            new Error(
               'Failed to write video file: ' + (writeError as Error).message
            )
         );
      }
   });
};
