// TODO(osp) on node this is defined on the native side
// Need to do the same so that values are always in sync
export let RSAKeyVariant;

(function (RSAKeyVariant) {
  RSAKeyVariant[RSAKeyVariant["kKeyVariantRSA_SSA_PKCS1_v1_5"] = 0] = "kKeyVariantRSA_SSA_PKCS1_v1_5";
  RSAKeyVariant[RSAKeyVariant["kKeyVariantRSA_PSS"] = 1] = "kKeyVariantRSA_PSS";
  RSAKeyVariant[RSAKeyVariant["kKeyVariantRSA_OAEP"] = 2] = "kKeyVariantRSA_OAEP";
})(RSAKeyVariant || (RSAKeyVariant = {}));
//# sourceMappingURL=Cipher.js.map