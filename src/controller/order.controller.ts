import { Request, Response } from "express";

import {
  CreateOrderInput,
  ReceiveOrderInput,
  SearchBarcodeOrderInput,
  UpdateOrderInput,
} from "../schema/order.schema";
import {
  createOrder,
  deleteOrder,
  findAndUpdateOrder,
  findFilterOrders,
  findOrder,
  receiveOrder,
} from "../service/order.service";
import { findQrCodes } from "../service/qrCode.service";
import { findTimelineOrder } from "../service/timeline.service";
import log from "../utils/logger";
import { Socket } from "../utils/socket";

export async function createOrderHandler(
  req: Request<{}, {}, CreateOrderInput["body"]>,
  res: Response
) {
  try {
    const userId = res.locals.user._id;

    const body = req.body;

    const orderGroup = await findQrCodes({ orderGroup: body.orderGroup });

    if (orderGroup[0].isScanned === true) {
      return res
        .status(400)
        .send({ succes: false, message: "已出货 二维码以扫" });
    }

    const order = await createOrder({ ...body, createdBy: userId });

    Socket.emit("NEW_ORDER_CREATED", { order });

    return res.send(order);
  } catch (error: any) {
    log.error(error);
    if (error.name === "MongoServerError" && error.code === 11000) {
      // Duplicate username
      return res.status(422).send({ succes: false, message: "条码已存在！！" });
    }

    return res.status(500).send("出错");
  }
}

export async function updateOrderHandler(
  req: Request<UpdateOrderInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;

  const orderId = req.params.orderId;
  const update = req.body;

  const order = await findOrder({ orderId });

  if (!order) {
    return res.sendStatus(404);
  }

  if (String(order.createdBy) !== userId) {
    return res.sendStatus(403);
  }

  const updatedOrder = await findAndUpdateOrder({ orderId }, update, {
    new: true,
  });

  return res.send(updatedOrder);
}

export async function getOrderHandler(
  req: Request<UpdateOrderInput["params"]>,
  res: Response
) {
  const id = req.params.orderId;
  const order = await findOrder({ _id: id });

  if (!order) {
    return res.sendStatus(404);
  }
  const qrCodes = await findQrCodes({ order: order._id });
  const timelines = await findTimelineOrder({ order: order._id });
  const result = {
    ...order,
    qrCodes,
    timelines,
  };

  return res.send(result);
}

export async function deleteOrderHandler(
  req: Request<UpdateOrderInput["params"]>,
  res: Response
) {
  const userId = res.locals.user._id;
  const orderId = req.params.orderId;

  const order = await findOrder({ orderId });

  if (!order) {
    return res.sendStatus(404);
  }

  if (String(order.createdBy) !== userId) {
    return res.sendStatus(403);
  }

  await deleteOrder({ orderId });

  return res.sendStatus(200);
}

export async function getOrderFilter(req: Request, res: Response) {
  const { orderGroup, page = 1, limit = 12 } = req.query;

  if (
    typeof page === "string" &&
    typeof orderGroup === "string" &&
    typeof limit === "string" &&
    parseInt(page) >= 0
  ) {
    const orders = await findFilterOrders(
      orderGroup,
      parseInt(limit),
      parseInt(page)
    );
    return res.send({ data: orders });
  }
  return res.sendStatus(400);
}

export async function receiveOrderHandler(
  req: Request<{}, {}, ReceiveOrderInput["body"]>,
  res: Response
) {
  try {
    //
    const result = await receiveOrder(req.body);
    return res.status(200).send({ data: { message: "已接货" } });
  } catch (error: any) {
    log.error(error);

    return res.status(500).send("出错");
  }
}

export async function searchOrderHandler(
  req: Request<{}, {}, SearchBarcodeOrderInput["body"]>,
  res: Response
) {
  try {
    //
    const result = await findOrder({
      barCode: {
        $regex: req.body.barCode,
        $options: "i",
      },
    });
    return res.status(200).send({ data: result });
  } catch (error: any) {
    log.error(error);

    return res.status(500).send("出错");
  }
}
