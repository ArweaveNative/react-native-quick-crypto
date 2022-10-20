export declare type InternalHash = {
    update: (data: ArrayBuffer) => InternalHash;
    digest: () => ArrayBuffer;
    copy: (len?: number) => InternalHash;
};
export declare type CreateHashMethod = (algorithm: string, outputLength?: number) => InternalHash;
