export declare type InternalSign = {
    init: (algorithm: string) => void;
    update: (data: ArrayBuffer) => void;
    sign: (...args: any) => Uint8Array;
};
export declare type InternalVerify = {
    init: (algorithm: string) => void;
    update: (data: ArrayBuffer) => void;
    verify: (...args: any) => boolean;
};
export declare type CreateSignMethod = () => InternalSign;
export declare type CreateVerifyMethod = () => InternalVerify;
