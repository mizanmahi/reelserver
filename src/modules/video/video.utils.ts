// import sharp from 'sharp';

// export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
//     try {
//         return await sharp(buffer)
//             .resize({ width: 320, height: 180 }) // Resize to 320x180 while maintaining aspect ratio
//             .toBuffer();
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`Failed to generate thumbnail: ${error.message}`);
//         } else {
//             throw new Error('An unknown error occurred during thumbnail generation.');
//         }
//     }
// }

// import fs from "fs";
// import path from "path";
// import { promisify } from "util";
// import ffmpeg from "fluent-ffmpeg";

// const writeFile = promisify(fs.writeFile);
// const unlink = promisify(fs.unlink);

// export const generateVideoThumbnail = async (videoBuffer: Buffer): Promise<Buffer> => {
//     const tempVideoPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
//     const tempThumbnailPath = path.join(__dirname, `temp_thumbnail_${Date.now()}.png`);

//     try {
//         // Write the video buffer to a temporary file
//         await writeFile(tempVideoPath, videoBuffer);

//         return new Promise((resolve, reject) => {
//             ffmpeg(tempVideoPath)
//                 .on("end", async () => {
//                     try {
//                         // Read the thumbnail and return as a Buffer
//                         const thumbnailBuffer = await fs.promises.readFile(tempThumbnailPath);
//                         // Clean up temporary files
//                         await unlink(tempVideoPath);
//                         await unlink(tempThumbnailPath);
//                         resolve(thumbnailBuffer);
//                     } catch (err) {
//                         reject(new Error(`Failed to read thumbnail: ${err.message}`));
//                     }
//                 })
//                 .on("error", async (err) => {
//                     // Clean up on error
//                     await unlink(tempVideoPath).catch(() => null);
//                     await unlink(tempThumbnailPath).catch(() => null);
//                     reject(new Error(`FFmpeg error: ${err.message}`));
//                 })
//                 .screenshots({
//                     count: 1,
//                     timemarks: ["5"], // Capture at 5 seconds
//                     size: "320x180",
//                     filename: tempThumbnailPath,
//                 });
//         });
//     } catch (err) {
//         await unlink(tempVideoPath).catch(() => null);
//         throw new Error(`Error writing video to temp file: ${err.message}`);
//     }
// };

// my version
// import ffmpeg from 'fluent-ffmpeg';
// import path from 'path';
// import fs from 'fs';
// import ffmpegPath from 'ffmpeg-static';
// // import ffprobePath from '@ffprobe-installer/ffprobe';

// if (!ffmpegPath) {
//    throw new Error(
//       'FFmpeg binary not found. Please ensure ffmpeg-static is installed correctly.'
//    );
// }

// ffmpeg.setFfmpegPath(ffmpegPath);
// ffmpeg.setFfprobePath(ffprobePath.path);

// export const generateVideoThumbnail = (
//    videoBuffer: Buffer
// ): Promise<Buffer> => {
//    return new Promise((resolve, reject) => {
//       // Create a temporary file to store the video data
//       const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
//       const tempThumbnailPath = path.join(__dirname, 'temp_thumbnail.png');

//       // Write the video buffer to a temporary file
//       fs.writeFileSync(tempVideoPath, videoBuffer);

//       // Generate the thumbnail using ffmpeg
//       ffmpeg(tempVideoPath)
//          .screenshots({
//             count: 1,
//             folder: __dirname,
//             filename: 'temp_thumbnail.png',
//             size: '1080x1920',
//          })
//          .on('end', () => {
//             // Read the generated thumbnail
//             const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

//             // Clean up temporary files
//             fs.unlinkSync(tempVideoPath);
//             fs.unlinkSync(tempThumbnailPath);

//             // Return the thumbnail buffer
//             resolve(thumbnailBuffer);
//          })
//          .on('error', (err) => {
//             // Clean up temporary files on error
//             fs.unlinkSync(tempVideoPath);
//             reject(new Error('Error generating thumbnail: ' + err.message));
//          });
//    });
// };

// import sharp from 'sharp';

// export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
//     try {
//         return await sharp(buffer)
//             .resize({ width: 320, height: 180 }) // Resize to 320x180 while maintaining aspect ratio
//             .toBuffer();
//     } catch (error) {
//         if (error instanceof Error) {
//             throw new Error(`Failed to generate thumbnail: ${error.message}`);
//         } else {
//             throw new Error('An unknown error occurred during thumbnail generation.');
//         }
//     }
// }

// import fs from "fs";
// import path from "path";
// import { promisify } from "util";
// import ffmpeg from "fluent-ffmpeg";

// const writeFile = promisify(fs.writeFile);
// const unlink = promisify(fs.unlink);

// export const generateVideoThumbnail = async (videoBuffer: Buffer): Promise<Buffer> => {
//     const tempVideoPath = path.join(__dirname, `temp_video_${Date.now()}.mp4`);
//     const tempThumbnailPath = path.join(__dirname, `temp_thumbnail_${Date.now()}.png`);

//     try {
//         // Write the video buffer to a temporary file
//         await writeFile(tempVideoPath, videoBuffer);

//         return new Promise((resolve, reject) => {
//             ffmpeg(tempVideoPath)
//                 .on("end", async () => {
//                     try {
//                         // Read the thumbnail and return as a Buffer
//                         const thumbnailBuffer = await fs.promises.readFile(tempThumbnailPath);
//                         // Clean up temporary files
//                         await unlink(tempVideoPath);
//                         await unlink(tempThumbnailPath);
//                         resolve(thumbnailBuffer);
//                     } catch (err) {
//                         reject(new Error(`Failed to read thumbnail: ${err.message}`));
//                     }
//                 })
//                 .on("error", async (err) => {
//                     // Clean up on error
//                     await unlink(tempVideoPath).catch(() => null);
//                     await unlink(tempThumbnailPath).catch(() => null);
//                     reject(new Error(`FFmpeg error: ${err.message}`));
//                 })
//                 .screenshots({
//                     count: 1,
//                     timemarks: ["5"], // Capture at 5 seconds
//                     size: "320x180",
//                     filename: tempThumbnailPath,
//                 });
//         });
//     } catch (err) {
//         await unlink(tempVideoPath).catch(() => null);
//         throw new Error(`Error writing video to temp file: ${err.message}`);
//     }
// };

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';
if (!ffmpegPath) {
   throw new Error(
      'FFmpeg binary not found. Please ensure ffmpeg-static is installed correctly.'
   );
}

// Make sure ffmpeg is pointing to the correct executable
ffmpeg.setFfmpegPath(ffmpegPath);

export const generateVideoThumbnail = (
   videoBuffer: Buffer
): Promise<Buffer> => {
   return new Promise((resolve, reject) => {
      // Create a temporary file to store the video data
      const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
      const tempThumbnailPath = path.join(__dirname, 'temp_thumbnail.png');

      // Write the video buffer to a temporary file
      fs.writeFileSync(tempVideoPath, videoBuffer);

      // Generate the thumbnail using ffmpeg
      ffmpeg(tempVideoPath)
         .screenshots({
            count: 1,
            folder: __dirname,
            filename: 'temp_thumbnail.png',
            size: '1080x1920',
         })
         .on('end', () => {
            // Read the generated thumbnail
            const thumbnailBuffer = fs.readFileSync(tempThumbnailPath);

            // Clean up temporary files
            fs.unlinkSync(tempVideoPath);
            fs.unlinkSync(tempThumbnailPath);

            // Return the thumbnail buffer
            resolve(thumbnailBuffer);
         })
         .on('error', (err) => {
            // Clean up temporary files on error
            fs.unlinkSync(tempVideoPath);
            reject(new Error('Error generating thumbnail: ' + err.message));
         });
   });
};
