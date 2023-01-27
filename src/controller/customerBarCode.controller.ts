import { Request, Response } from "express";

import {
  CreateCustomerBarCodeInput,
  PaginateCustomerBarCodeInput,
  ReadCustomerBarCodeInput,
  UpdateCustomerBarCodeInput,
} from "../schema/customerBarCode.schema";
import {
  createCustomerBarCode,
  deleteCustomerBarCode,
  fetchCustomerBarCodeDetails,
  findAndUpdateCustomerBarCode,
  findFilterCustomerBarCodes,
  findOneCustomerBarCode,
} from "../service/customerBarCode.service";
import { findOrder } from "../service/order.service";
import log from "../utils/logger";
import mongoose from "mongoose";

export async function createCustomerBarCodeHandler(
  req: Request<{}, {}, CreateCustomerBarCodeInput["body"]>,
  res: Response
) {
  try {
    // const customer = req.params.customerId;
    const body = req.body;

    const customer = res.locals.user._id;

    const customerBarCode = await createCustomerBarCode({
      ...body,
      customer,
    });

    return res.send({ data: customerBarCode });
  } catch (error: any) {
    log.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate username
      return res
        .status(422)
        .send({ succes: false, message: "Штрих-код уже существует в системе" });
    }
    return res.status(500).send("Ошибка");
  }
}

export async function updateCustomerBarCodeHandler(
  req: Request<
    UpdateCustomerBarCodeInput["params"],
    {},
    UpdateCustomerBarCodeInput["body"]
  >,
  res: Response
) {
  try {
    const customerBarCodeId = req.params.customerBarCodeId;
    // const customerId = req.params.customerId;
    const customerId = res.locals.user._id;
    const update = req.body;

    const customerBarCode = await findOneCustomerBarCode({
      _id: customerBarCodeId,
    });

    if (!customerBarCode) {
      return res.sendStatus(404);
    }

    if (customerBarCode.customer !== customerId) {
      return res.sendStatus(403);
    }

    const updatedCustomerBarCode = await findAndUpdateCustomerBarCode(
      { customerBarCodeId },
      update,
      {
        new: true,
      }
    );

    return res.send({ data: updatedCustomerBarCode });
  } catch (error) {
    log.error(error);

    return res.status(500).send("Ошибка");
  }
}

export async function getCustomerBarCodeHandler(
  req: Request<{}, {}, ReadCustomerBarCodeInput["body"]>,
  res: Response
) {
  try {
    const customerBarCodeId = req.body.customerBarCodeId;
    const customerId = res.locals.user._id;

    const result = await fetchCustomerBarCodeDetails(customerBarCodeId);

    if (!result.customerBarCode) {
      return res.sendStatus(404);
    }

    if (result.customerBarCode.customer.toString() !== customerId) {
      return res.sendStatus(403);
    }

    return res.send({ data: result });
  } catch (error) {
    console.log("error");

    log.error(error);

    return res.status(500).send("Ошибка");
  }
}

export async function deleteCustomerBarCodeHandler(
  req: Request<UpdateCustomerBarCodeInput["params"]>,
  res: Response
) {
  try {
    const customerBarCodeId = req.params.customerBarCodeId;
    const customerId = res.locals.user._id;

    const customerBarCode = await findOneCustomerBarCode({
      _id: customerBarCodeId,
    });

    if (!customerBarCode) {
      return res.sendStatus(404);
    }

    const barCodeRegistered = await findOrder({
      barCode: customerBarCode.barCode,
    });

    if (!!barCodeRegistered) {
      return res
        .status(400)
        .send({ message: "Штрих-код был импортирован и нельзя удалить" });
    }

    if (customerBarCode.customer.toString() !== customerId) {
      return res.sendStatus(403);
    }

    await deleteCustomerBarCode({ _id: customerBarCodeId });

    return res.status(200).send({ data: customerBarCode });
  } catch (error) {
    log.error(error);

    return res.status(500).send("出错");
  }
}

export async function getCustomerBarCodeFilter(
  req: Request<PaginateCustomerBarCodeInput["params"], {}, {}>,
  res: Response
) {
  try {
    const { type } = req.params;
    const customerId = res.locals.user._id;

    const { page = 1, limit = 12, search = "" } = req.query;

    console.log({ page, limit, search });

    if (
      typeof page === "string" &&
      typeof limit === "string" &&
      parseInt(page) >= 0
    ) {
      const customerBarCodes = await findFilterCustomerBarCodes(
        parseInt(limit),
        parseInt(page),
        {
          customer: new mongoose.Types.ObjectId(customerId),
          type,
          barCode: {
            $regex: search,
            $options: "i",
          },
        }
      );

      return res.send({ data: customerBarCodes });
    }
    return res.sendStatus(400);
  } catch (error) {
    log.error(error);

    return res.status(500).send("出错");
  }
}

export async function searchCustomerBarCodeFilter(
  req: Request<PaginateCustomerBarCodeInput["params"]>,
  res: Response
) {
  try {
    const { type } = req.params;
    const customerId = res.locals.user._id;
    const { page = 1, limit = 12, search = "" } = req.query;

    if (
      typeof page === "string" &&
      typeof limit === "string" &&
      parseInt(page) >= 0
    ) {
      const customerBarCodes = await findFilterCustomerBarCodes(
        parseInt(limit),
        parseInt(page),
        {
          customer: customerId,
          type,
          barCode: {
            $regex: search,
            $options: "i",
          },
        }
      );
      return res.send({ data: customerBarCodes });
    }
    return res.sendStatus(400);
  } catch (error) {
    log.error(error);

    return res.status(500).send("出错");
  }
}
