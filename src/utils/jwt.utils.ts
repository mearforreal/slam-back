import jwt from "jsonwebtoken";
import _default from "../config/default";

export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  //   const signingKey = Buffer.from(
  //     config.get<string>(keyName),
  //     "base64"
  //   ).toString("ascii");
  //   console.log(config.get<string>(keyName));
  //   console.log(signingKey);

  return jwt.sign(object, _default[keyName], {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
) {
  //   const publicKey = Buffer.from(config.get<string>(keyName), "base64").toString(
  //     "ascii"
  //   );

  try {
    const decoded = jwt.verify(token, _default[keyName]);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: any) {
    console.error(e);
    return {
      valid: false,
      expired: e.message === "jwt expired",
      decoded: null,
    };
  }
}
