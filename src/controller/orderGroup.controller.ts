import { Request, Response } from "express";
import {
  CreateOrderGroupInput,
  DeleteOrderGroupInput,
  ReadOrderGroupInput,
} from "../schema/orderGroup.schema";
import { findOrdersByOrderGroup } from "../service/order.service";
import { Socket } from "../utils/socket";
import {
  createOrderGroup,
  deleteOrderGroup,
  findAndUpdateOrderGroup,
  findFilterOrderGroups,
  findOrderGroup,
} from "../service/orderGroup.service";
import { findQrCodes } from "../service/qrCode.service";

import log from "../utils/logger";

export async function createOrderGroupHandler(
  req: Request<{}, {}, CreateOrderGroupInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;

    const orderGroup = await createOrderGroup({
      title: req.body.title || null,
      createdBy: userId,
    });
    const orders = await findOrdersByOrderGroup({ orderGroup: orderGroup._id });

    const qrCodes = await findQrCodes({ orderGroup: orderGroup._id });

    const result = {
      ...orderGroup.toObject(),
      orders: orders.length,
      qrCodes,
    };

    return res.send(result);
  } catch (error: any) {
    log.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate username
      return res
        .status(422)
        .send({ succes: false, message: "条码组已存在！！" });
    }

    return res.status(500).send("出错");
  }
}

export async function getOrderByOrderGroupHandler(
  req: Request<ReadOrderGroupInput["params"]>,
  res: Response
) {
  const order_group_id = req.params.orderGroupId;

  const orders = await findOrdersByOrderGroup({ orderGroup: order_group_id });
  return res.send({ data: orders });
}

export async function getOrderGroupHandler(
  req: Request<ReadOrderGroupInput["params"]>,
  res: Response
) {
  try {
    const id = req.params.orderGroupId;
    const orderGroup = await findOrderGroup({ _id: id });

    if (!orderGroup) {
      return res.sendStatus(404);
    }

    const orders = await findOrdersByOrderGroup({ orderGroup: orderGroup._id });

    const qrCodes = await findQrCodes({ orderGroup: orderGroup._id });

    const result = {
      ...orderGroup,
      orders,
      qrCodes,
    };

    return res.send({ data: result });
  } catch (error) {
    log.error(error);
  }
}

export async function deleteOrderGroupHandler(
  req: Request<DeleteOrderGroupInput["params"]>,
  res: Response
) {
  // const userId = res.locals.user._id;
  const orderGroupId = req.params.orderGroupId;

  const orderGroup = await findOrderGroup({ _id: orderGroupId });

  if (!orderGroup) {
    return res.sendStatus(404);
  }

  const orders = await findOrdersByOrderGroup({ orderGroup: orderGroup._id });

  if (orders.length !== 0) {
    return res.send("无法删除，已导入代码");
  }

  // if (String(orderGroup.createdBy) !== userId) {
  //   return res.sendStatus(403);
  // }

  await deleteOrderGroup({ _id: orderGroupId });

  return res.sendStatus(200);
}

export async function getOrderGroupFilter(req: Request, res: Response) {
  try {
    const { page = 1, limit = 12, isMobile = false } = req.query;

    if (
      typeof page === "string" &&
      typeof limit === "string" &&
      typeof isMobile === "string" &&
      parseInt(page) >= 0
    ) {
      let mobile = isMobile === "true";
      const orderGroups = await findFilterOrderGroups(
        parseInt(limit),
        parseInt(page),
        mobile
      );
      return res.send({ data: orderGroups });
    }
    return res.sendStatus(400);
  } catch (error) {
    log.error(error);
    return res.sendStatus(400);
  }
}

export async function openOrderGroupOnWebHandler(
  req: Request<ReadOrderGroupInput["params"]>,
  res: Response
) {
  const id = req.params.orderGroupId;

  Socket.emit("OPEN_ORDERGROUP", {
    orderGroupId: id,
  });
  res.send("已打开").status(200);
}
