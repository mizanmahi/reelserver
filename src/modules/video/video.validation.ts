import { z } from 'zod';

const videoCommentSchema = z.object({
   body: z
      .object({
         content: z
            .string()
            .min(10, 'Comment content must be at least 10 characters long.'),
      })
      .strict(),
});

export const VideoValidationSchemas = {
   videoCommentSchema,
};
