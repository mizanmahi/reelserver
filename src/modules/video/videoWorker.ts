import { parentPort, workerData } from 'worker_threads';
import ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';

interface WorkerData {
   videoBuffer: Buffer;
   tempVideoPath: string;
   compressedVideoPath: string;
   thumbnailPath: string;
}

console.log('worker is working ===========');

const { videoBuffer, tempVideoPath, compressedVideoPath, thumbnailPath } =
   workerData as WorkerData;

// Write the video buffer to a temporary file
writeFileSync(tempVideoPath, videoBuffer);

// Compress the video
ffmpeg(tempVideoPath)
   .output(compressedVideoPath)
   .videoCodec('libx264')
   .size('50%')
   .outputOptions('-crf 28')
   .on('end', () => {
      // Generate thumbnail
      ffmpeg(tempVideoPath)
         .screenshots({
            count: 1,
            folder: join(tempVideoPath, '..'),
            filename: thumbnailPath.split('/').pop() as string,
            size: '1080x1920',
         })
         .on('end', () => {
            const compressedVideoData = readFileSync(compressedVideoPath);
            const thumbnailData = readFileSync(thumbnailPath);

            // Clean up temporary files
            unlinkSync(tempVideoPath);
            unlinkSync(compressedVideoPath);
            unlinkSync(thumbnailPath);

            // Send results back to the main thread
            parentPort?.postMessage({
               compressedVideoData,
               thumbnailData,
            });
         })
         .on('error', (error) => {
            parentPort?.postMessage({
               error: 'Thumbnail generation failed: ' + error.message,
            });
         });
   })
   .on('error', (error) => {
      parentPort?.postMessage({
         error: 'Video compression failed: ' + error.message,
      });
   })
   .run();
