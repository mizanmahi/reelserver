export interface File {
   originalname: string;
   buffer: Buffer;
   mimetype: string;
}

export interface IVideoPayload {
   title: string;
   description: string;
}

export type UploadedFile = {
   fieldname: string;
   originalname: string;
   encoding: string;
   mimetype: string;
   destination: string;
   filename: string;
   path: string;
   size: number;
};
