import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

import _default from "../config/default";
import { OrderStatus } from "../models/order.model";
import { QrCodeType } from "../models/qrCode.model";
import { CreateTimelineInput } from "../schema/timeline.schema";
// import { notifyCustomerSMS } from "../service/customerBarCode.service";
import {
  findAndUpdateMultipleOrders,
  findOrder,
} from "../service/order.service";
import { findOrderGroup } from "../service/orderGroup.service";
import { findAndUpdateQrCode } from "../service/qrCode.service";
import {
  createTimeLineAfterScan,
  findTimelineOrder,
} from "../service/timeline.service";
// import { transporter } from "../utils/email";
import log from "../utils/logger";
import { Socket } from "../utils/socket";

export async function fetchOrderTimelineHandler(req: Request, res: Response) {
  try {
    let { order, barcode } = req.query;

    if (order) {
      if (!isValidObjectId(order)) {
        return res.send({ data: [] });
      }
      const result = await findTimelineOrder({ order });
      return res.send({ data: result });
    }
    if (barcode) {
      const order = await findOrder({ barCode: barcode });
      if (!order) {
        return res.send({ data: [] });
      }
      const result = await findTimelineOrder({ order: order?._id });
      return res.send({ data: result });
    }
    return res.sendStatus(400);
  } catch (error) {
    return res.sendStatus(500);
  }
}

export async function createTimeLineAfterScanHandler(
  req: Request<{}, {}, CreateTimelineInput["body"]>,
  res: Response
) {
  try {
    const updatedQrCode = await findAndUpdateQrCode(
      { _id: req.body.qrId },
      { isScanned: true },
      { new: true }
    );

    if (!updatedQrCode) {
      return res.sendStatus(404);
    }

    // change orders status
    // todo
    let status =
      updatedQrCode.type === QrCodeType.CHINA_SIDE
        ? OrderStatus.SENT_FROM_CHINA
        : OrderStatus.ARRIVED_AT_KAZAKHSTAN;
    const updatedOrder = await findAndUpdateMultipleOrders(
      { orderGroup: updatedQrCode.orderGroup },
      { status },
      { new: true }
    );

    // create timeline
    const result = await createTimeLineAfterScan(
      updatedQrCode,
      req.body.warehouse
    );

    if (!updatedOrder) {
      return res.sendStatus(404);
    }

    const orderGroup = await findOrderGroup({ _id: updatedQrCode.orderGroup });

    if (!orderGroup) {
      return res.sendStatus(404);
    }

    // const qrCode = await findOneQrCode({
    //   orderGroup: orderGroup._id,
    //   type: QrCodeType.KAZAKHSTAN_SIDE,
    // });

    // if (!qrCode) {
    //   return res.sendStatus(404);
    // }

    // notify customers
    // if (updatedQrCode.type === QrCodeType.KAZAKHSTAN_SIDE) {
    //   setTimeout(
    //     () =>
    //       notifyCustomerSMS({
    //         orderGroup: updatedQrCode.orderGroup,
    //         warehouse: req.body.warehouse,
    //       }),
    //     0
    //   );
    // }

    // do not delete
    // if (updatedQrCode.type === QrCodeType.CHINA_SIDE) {
    //   transporter
    //     .sendMail({
    //       from: _default.email.user,
    //       to: "gani.00s@icloud.com",
    //       subject: `货物已发送【${orderGroup.createdAt}】`,
    //       // text:"qwe",
    //       html: `<h1>哈萨克斯坦库房二维码 【${orderGroup.createdAt}】</h1>
    //         <img src="https://api9515cargo.com/api/qrCode/${qrCode.img}">
    //         </div>`,
    //       attachments: [
    //         {
    //           filename: qrCode.img,
    //           path: path.join(__dirname, `../assets/${qrCode.img}`),
    //           cid: `https://api9515cargo.com/api/qrCode/${qrCode.img}`, //same cid value as in the html img src
    //         },
    //       ],
    //     })
    //     .catch((err) => console.error(err));
    // }

    Socket.emit("QR_SCANNED_TIMELINE_CREATED", {
      qrCode: updatedQrCode,
    });

    return res.send({ data: result });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
}
