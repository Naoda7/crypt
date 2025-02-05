import 'crypto-js'

declare module 'crypto-js' {
  interface HmacAlgorithms {
    MD5: typeof CryptoJS.HmacMD5
    SHA1: typeof CryptoJS.HmacSHA1
    SHA224: typeof CryptoJS.HmacSHA224
    SHA256: typeof CryptoJS.HmacSHA256
    SHA384: typeof CryptoJS.HmacSHA384
    SHA512: typeof CryptoJS.HmacSHA512
    SHA3: (message: string, key: string) => CryptoJS.lib.WordArray
    RIPEMD160: (message: string, key: string) => CryptoJS.lib.WordArray
  }

  interface CryptoJSStatic {
    Hmac: HmacAlgorithms
  }
}