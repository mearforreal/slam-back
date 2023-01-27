import { Request, Response } from "express";
// import {
//   DeleteCustomerInput,
//   ReadCustomerInput,
// } from "../schema/customer.schema";
// import { findOrdersByCustomer } from "../service/order.service";
import { Socket } from "../utils/socket";
import {
  createCustomer,
  deleteCustomer,
  findFilterCustomers,
  findCustomer,
  validatePassword,
  // sendCodeSMSCustomer,
  // verifyCustomer,
} from "../service/customer.service";
import { findQrCodes } from "../service/qrCode.service";

import log from "../utils/logger";
import { CreateOrderInput } from "../schema/order.schema";
import {
  CreateCustomerInput,
  ReadCustomerByTelephoneInput,
  SmsCustomerInput,
  VerifyCustomerInput,
} from "../schema/customer.schema";
import dayjs from "dayjs";
import { createSession } from "../service/session.service";
import { signJwt } from "../utils/jwt.utils";

export async function createCustomerHandler(
  req: Request<{}, {}, CreateCustomerInput["body"]>,
  res: Response
) {
  try {
    const customer = await createCustomer(req.body);

    const session = await createSession(
      customer._id,
      req.get("user-agent") || ""
    );
    //const verificationCode = await sendCodeSMSCustomer(customer.telephone);

    //console.log(verificationCode);
    const accessToken = signJwt(
      { ...customer, session: session._id },
      "accessTokenPrivateKey",
      {}
      // { expiresIn: config.get("accessTokenTtl") } // 15 minutes,
    );

    // create a refresh token
    const refreshToken = signJwt(
      { ...customer, session: session._id },
      "refreshTokenPrivateKey",
      {}
      // { expiresIn: config.get("refreshTokenTtl") } // 15 minutes
    );

    // return access & refresh tokens

    return res.send({ ...customer, accessToken, refreshToken });
  } catch (error: any) {
    log.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate username
      return res
        .status(422)
        .send({ succes: false, message: "Аккаунт уже существует в системе" });
    }
    return res.status(500).send("Ошибка");
  }
}

export async function loginCustomerHandler(
  req: Request<{}, {}, CreateCustomerInput["body"]>,
  res: Response
) {
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).send("Invalid email or password");
  }

  // create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  // create an access token

  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    {}
    // { expiresIn: config.get("accessTokenTtl") } // 15 minutes,
  );

  // create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    "refreshTokenPrivateKey",
    {}
    // { expiresIn: config.get("refreshTokenTtl") } // 15 minutes
  );

  // return access & refresh tokens

  return res.send({ accessToken, refreshToken });
}
// export async function deleteCustomerHandler(
//   req: Request<DeleteCustomerInput["params"]>,
//   res: Response
// ) {
//   // const userId = res.locals.user._id;
//   const customerId = req.params.customerId;

//   const customer = await findCustomer({ _id: customerId });

//   if (!customer) {
//     return res.sendStatus(404);
//   }

//   const orders = await findOrdersByCustomer({ customer: customer._id });

//   if (orders.length !== 0) {
//     return res.send("无法删除，已导入代码");
//   }

//   // if (String(customer.createdBy) !== userId) {
//   //   return res.sendStatus(403);
//   // }

//   await deleteCustomer({ _id: customerId });

//   return res.sendStatus(200);
// }
