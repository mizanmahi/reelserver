import ffmpeg from 'fluent-ffmpeg';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import ffmpegPath from 'ffmpeg-static';
import minioClient from '../../clients/minio';

if (!ffmpegPath) {
   throw new Error(
      'FFmpeg binary not found. Please ensure ffmpeg-static is properly installed.'
   );
}

// Configure FFmpeg binary path
ffmpeg.setFfmpegPath(ffmpegPath);

export const extractThumbnail = async (
   videoContent: Buffer
): Promise<Buffer> => {
   return new Promise((resolve, reject) => {
      const tempVideo = join(tmpdir(), `input_${Date.now()}.mp4`);
      const thumbnailPath = join(tmpdir(), `thumbnail_${Date.now()}.png`);

      try {
         // Store video buffer in a temporary file
         writeFileSync(tempVideo, videoContent);

         // Extract a thumbnail using FFmpeg
         ffmpeg(tempVideo)
            .screenshots({
               count: 1,
               folder: tmpdir(),
               filename: thumbnailPath.split('/').pop(), // Extracts filename only
               size: '1080x1920',
            })
            .on('end', () => {
               try {
                  const thumbnailData = readFileSync(thumbnailPath);

                  // Remove temporary files
                  unlinkSync(tempVideo);
                  unlinkSync(thumbnailPath);

                  console.log(
                     '===================================== WORKED!!!'
                  );

                  resolve(thumbnailData);
               } catch (fileError) {
                  reject(
                     new Error(
                        'Error reading or cleaning up temporary files: ' +
                           (fileError as Error).message
                     )
                  );
               }
            })
            .on('error', (error) => {
               unlinkSync(tempVideo);
               reject(
                  new Error(
                     'FFmpeg thumbnail generation failed: ' + error.message
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

export const processVideoUpload = async (
   videoBuffer: Buffer,
   originalName: string,
   bucketName: string
) => {
   const timestamp = Date.now();
   const videoKey = `videos/${timestamp}_${originalName}`;
   const thumbnailKey = `thumbnails/${timestamp}_preview.png`;

   console.log('in processVideoUpload ============!!!!!!!!!!!!============');

   try {
      // Upload video to MinIO
      await minioClient.putObject(bucketName, videoKey, videoBuffer);
      console.log('Video uploaded successfully');

      // Generate thumbnail
      const thumbnailBuffer = await extractThumbnail(videoBuffer);
      console.log('Thumbnail generated');

      // Upload thumbnail
      await minioClient.putObject(bucketName, thumbnailKey, thumbnailBuffer);

      // Construct public URLs
      const videoUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${videoKey}`;
      const thumbnailUrl = `${process.env.MINIO_PUBLIC_URL}/${bucketName}/${thumbnailKey}`;

      return { videoUrl, thumbnailUrl };
   } catch (error) {
      console.error('Error processing video upload:', error);
      throw new Error('Failed to process video upload');
   }
};
