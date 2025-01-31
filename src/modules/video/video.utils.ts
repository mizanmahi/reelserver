// import ffmpeg from 'fluent-ffmpeg';
// import { tmpdir } from 'os';
// import { join } from 'path';
// import { writeFileSync, readFileSync, unlinkSync } from 'fs';
// import ffmpegPath from 'ffmpeg-static';
// import minioClient from '../../clients/minio';

// if (!ffmpegPath) {
//    throw new Error(
//       'FFmpeg binary not found. Please ensure ffmpeg-static is properly installed.'
//    );
// }

// // Configure FFmpeg binary path
// ffmpeg.setFfmpegPath(ffmpegPath);

// export const extractThumbnail = async (
//    videoContent: Buffer
// ): Promise<Buffer> => {
//    return new Promise((resolve, reject) => {
//       const tempVideo = join(tmpdir(), `input_${Date.now()}.mp4`);
//       const thumbnailPath = join(tmpdir(), `thumbnail_${Date.now()}.png`);

//       try {
//          // Store video buffer in a temporary file
//          writeFileSync(tempVideo, videoContent);

//          // Extract a thumbnail using FFmpeg
//          ffmpeg(tempVideo)
//             .screenshots({
//                count: 1,
//                folder: tmpdir(),
//                filename: thumbnailPath.split('/').pop(), // Extracts filename only
//                size: '1080x1920',
//             })
//             .on('end', () => {
//                try {
//                   const thumbnailData = readFileSync(thumbnailPath);

//                   // Remove temporary files
//                   unlinkSync(tempVideo);
//                   unlinkSync(thumbnailPath);

//                   console.log(
//                      '===================================== WORKED!!!'
//                   );

//                   resolve(thumbnailData);
//                } catch (fileError) {
//                   reject(
//                      new Error(
//                         'Error reading or cleaning up temporary files: ' +
//                            (fileError as Error).message
//                      )
//                   );
//                }
//             })
//             .on('error', (error) => {
//                unlinkSync(tempVideo);
//                reject(
//                   new Error(
//                      'FFmpeg thumbnail generation failed: ' + error.message
//                   )
//                );
//             });
//       } catch (writeError) {
//          reject(
//             new Error(
//                'Failed to write video file: ' + (writeError as Error).message
//             )
//          );
//       }
//    });
// };

// export const processVideoUpload = async (
//    videoBuffer: Buffer,
//    originalName: string,
//    bucketName: string
// ) => {
//    const timestamp = Date.now();
//    const videoKey = `videos/${timestamp}_${originalName}`;
//    const thumbnailKey = `thumbnails/${timestamp}_preview.png`;

//    console.log('in processVideoUpload ============!!!!!!!!!!!!============');

//    try {
//       // Upload video to MinIO
//       await minioClient.putObject(bucketName, videoKey, videoBuffer);
//       console.log('Video uploaded successfully');

//       // Generate thumbnail
//       const thumbnailBuffer = await extractThumbnail(videoBuffer);
//       console.log('Thumbnail generated');

//       // Upload thumbnail
//       await minioClient.putObject(bucketName, thumbnailKey, thumbnailBuffer);

//       // Construct public URLs
//       const videoUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoKey}`;
//       const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailKey}`;

//       return { videoUrl, thumbnailUrl };
//    } catch (error) {
//       console.error('Error processing video upload:', error);
//       throw new Error('Failed to process video upload');
//    }
// };

// ----------------- previous code -----------------

// import ffmpeg from 'fluent-ffmpeg';
// import { tmpdir } from 'os';
// import { join } from 'path';
// import { writeFileSync, readFileSync, unlinkSync } from 'fs';
// import ffmpegPath from 'ffmpeg-static';
// import minioClient from '../../clients/minio';

// if (!ffmpegPath) {
//    throw new Error(
//       'FFmpeg binary not found. Please ensure ffmpeg-static is properly installed.'
//    );
// }

// // Configure FFmpeg binary path
// ffmpeg.setFfmpegPath(ffmpegPath);

// export const extractThumbnail = async (
//    videoContent: Buffer
// ): Promise<Buffer> => {
//    return new Promise((resolve, reject) => {
//       const tempVideo = join(tmpdir(), `input_${Date.now()}.mp4`);
//       const thumbnailPath = join(tmpdir(), `thumbnail_${Date.now()}.png`);

//       try {
//          // Store video buffer in a temporary file
//          writeFileSync(tempVideo, videoContent);

//          // Extract a thumbnail using FFmpeg
//          ffmpeg(tempVideo)
//             .screenshots({
//                count: 1,
//                folder: tmpdir(),
//                filename: thumbnailPath.split('/').pop(), // Extracts filename only
//                size: '1080x1920',
//             })
//             .on('end', () => {
//                try {
//                   const thumbnailData = readFileSync(thumbnailPath);

//                   // Remove temporary files
//                   unlinkSync(tempVideo);
//                   unlinkSync(thumbnailPath);

//                   resolve(thumbnailData);
//                } catch (fileError) {
//                   reject(
//                      new Error(
//                         'Error reading or cleaning up temporary files: ' +
//                            (fileError as Error).message
//                      )
//                   );
//                }
//             })
//             .on('error', (error) => {
//                unlinkSync(tempVideo);
//                reject(
//                   new Error(
//                      'FFmpeg thumbnail generation failed: ' + error.message
//                   )
//                );
//             });
//       } catch (writeError) {
//          reject(
//             new Error(
//                'Failed to write video file: ' + (writeError as Error).message
//             )
//          );
//       }
//    });
// };

// export const compressVideo = async (videoContent: Buffer): Promise<Buffer> => {
//    return new Promise((resolve, reject) => {
//       const tempVideo = join(tmpdir(), `input_${Date.now()}.mp4`);
//       const compressedVideoPath = join(
//          tmpdir(),
//          `compressed_${Date.now()}.mp4`
//       );

//       try {
//          // Store video buffer in a temporary file
//          writeFileSync(tempVideo, videoContent);

//          // Compress the video using FFmpeg
//          ffmpeg(tempVideo)
//             .output(compressedVideoPath)
//             .videoCodec('libx264') // Use H.264 codec for compression
//             .size('50%') // Reduce video size to 50% of the original
//             .outputOptions('-crf 28') // Constant Rate Factor
//             .on('end', () => {
//                try {
//                   const compressedVideoData = readFileSync(compressedVideoPath);

//                   // Remove temporary files
//                   unlinkSync(tempVideo);
//                   unlinkSync(compressedVideoPath);

//                   resolve(compressedVideoData);
//                } catch (fileError) {
//                   reject(
//                      new Error(
//                         'Error reading or cleaning up temporary files: ' +
//                            (fileError as Error).message
//                      )
//                   );
//                }
//             })
//             .on('error', (error) => {
//                unlinkSync(tempVideo);
//                reject(
//                   new Error('FFmpeg video compression failed: ' + error.message)
//                );
//             })
//             .run();
//       } catch (writeError) {
//          reject(
//             new Error(
//                'Failed to write video file: ' + (writeError as Error).message
//             )
//          );
//       }
//    });
// };

// export const processVideoUpload = async (
//    videoBuffer: Buffer,
//    originalName: string,
//    bucketName: string
// ) => {
//    const timestamp = Date.now();
//    // const videoKey = `videos/${timestamp}_${originalName}`;
//    const compressedVideoKey = `videos/compressed_${timestamp}_${originalName}`;
//    const thumbnailKey = `thumbnails/${timestamp}_preview.png`;

//    console.log('in processVideoUpload ============!!!!!!!!!!!!============');

//    try {
//       // Compress the video
//       const compressedVideoBuffer = await compressVideo(videoBuffer);
//       console.log('Video compressed successfully');

//       // Upload compressed video to MinIO
//       await minioClient.putObject(
//          bucketName,
//          compressedVideoKey,
//          compressedVideoBuffer
//       );
//       console.log('Compressed video uploaded successfully');

//       // Generate thumbnail from the original video
//       const thumbnailBuffer = await extractThumbnail(videoBuffer);
//       console.log('Thumbnail generated');

//       // Upload thumbnail
//       await minioClient.putObject(bucketName, thumbnailKey, thumbnailBuffer);

//       // Construct public URLs
//       const compressedVideoUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoKey}`;
//       const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailKey}`;

//       return { compressedVideoUrl, thumbnailUrl };
//    } catch (error) {
//       console.error('Error processing video upload:', error);
//       throw new Error('Failed to process video upload');
//    }
// };

import { Worker } from 'worker_threads';
import { tmpdir } from 'os';
import { join } from 'path';
import minioClient from '../../clients/minio';

export const processVideoUpload = async (
   videoBuffer: Buffer,
   originalName: string,
   bucketName: string
): Promise<{ compressedVideoUrl: string; thumbnailUrl: string }> => {
   return new Promise((resolve, reject) => {
      const timestamp = Date.now();
      const tempVideoPath = join(tmpdir(), `input_${timestamp}.mp4`);
      const compressedVideoPath = join(tmpdir(), `compressed_${timestamp}.mp4`);
      const thumbnailPath = join(tmpdir(), `thumbnail_${timestamp}.png`);

      const worker = new Worker(join(__dirname, 'videoWorker.js'), {
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
               // converting back to Buffer
               const compressedVideoData = Buffer.from(
                  message.compressedVideoData
               );
               const thumbnailData = Buffer.from(message.thumbnailData);

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
               await minioClient.putObject(
                  bucketName,
                  compressedVideoKey,
                  compressedVideoData
               );
               console.log('Compressed video uploaded successfully');

               // Upload thumbnail to MinIO
               const thumbnailKey = `thumbnails/${timestamp}_preview.png`;
               await minioClient.putObject(
                  bucketName,
                  thumbnailKey,
                  thumbnailData
               );
               console.log('Thumbnail uploaded successfully');

               // Construct public URLs
               const compressedVideoUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${compressedVideoKey}`;
               const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailKey}`;

               resolve({ compressedVideoUrl, thumbnailUrl });
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
            reject(new Error(`Worker stopped with exit code ${code}`));
         }
      });
   });
};
