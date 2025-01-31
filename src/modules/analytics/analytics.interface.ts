export interface File {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
}

export interface IVideoPayload {
    title: string;
    description: string;
}