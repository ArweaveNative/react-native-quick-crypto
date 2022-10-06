export declare type InternalHmac = {
    update: (data: ArrayBuffer) => InternalHmac;
    digest: () => ArrayBuffer;
};
export declare type CreateHmacMethod = (algorithm: string, key?: ArrayBuffer) => InternalHmac;
