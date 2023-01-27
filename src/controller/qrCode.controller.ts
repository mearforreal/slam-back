import { Request, Response } from "express";
import path from "path";
import {
  OrderStatus,
  WarehouseChina,
  WarehouseKazakstan,
} from "../models/order.model";
import { QrCodeType } from "../models/qrCode.model";
import {
  findAndUpdateOrder,
  findOrder,
  findOrdersByOrderGroup,
} from "../service/order.service";
import {
  findAndUpdateQrCode,
  findOneQrCode,
  findQrCodes,
  generateQR,
} from "../service/qrCode.service";
import logger from "../utils/logger";

import { Socket } from "../utils/socket";
import {
  CreateOrderInput,
  SearchBarcodeOrderInput,
} from "../schema/order.schema";

import { findOrderGroup } from "../service/orderGroup.service";
import { findTimelineOrder } from "../service/timeline.service";

export function getQrCodeHandler(req: Request, res: Response) {
  const filepath = "/assets/" + req.params.fileName;

  res.sendFile(path.join(__dirname, "../" + filepath));
}

export async function fetchOrderQrcodesHandler(req: Request, res: Response) {
  try {
    let { orderGroup } = req.query;
    if (!orderGroup) {
      return res.sendStatus(400);
    }
    const result = await findQrCodes({ orderGroup });
    return res.send({ data: result });
  } catch (error) {
    return res.sendStatus(500);
  }
}

async function checkChinaSideScanedOrNot(orderGroupId: string) {
  const qrCodesByOrderGroup = await findOneQrCode({
    orderGroup: orderGroupId,
    type: QrCodeType.CHINA_SIDE,
  });

  if (!qrCodesByOrderGroup) {
    return false;
  }

  return qrCodesByOrderGroup.isScanned;
}

export async function scanQrHandler(req: Request, res: Response) {
  try {
    let { qrCodeId } = req.body;
    const qrCode = await findOneQrCode({ _id: qrCodeId });

    if (!qrCode) {
      return res.sendStatus(404);
    }
    const orderGroup = await findOrderGroup({ _id: qrCode.orderGroup });

    if (!orderGroup) {
      return res.sendStatus(404);
    }

    const orders = await findOrdersByOrderGroup({
      orderGroup: qrCode.orderGroup,
    });

    if (orders.length === 0) {
      return res.status(400).send("没有条码");
    }

    //check china qr has been scanned if kazakshatan

    // todo
    if (qrCode.type === QrCodeType.KAZAKHSTAN_SIDE) {
      const isChinaQRScanned = await checkChinaSideScanedOrNot(orderGroup._id);
      if (isChinaQRScanned === false) {
        return res.status(400).send("请先扫描中国二维码");
      }

      if (orders[0].status !== OrderStatus.BORDER) {
        return res.status(400).send("货物还没到达 口岸");
      }
    }

    if (qrCode.isScanned === true) {
      return res.sendStatus(409);
    }

    // // update QRCode
    // const updatedQrCode = await findAndUpdateQrCode(
    //   { _id: qrCode._id },
    //   { isScanned: true },
    //   { new: true }
    // );

    // update Order

    // if (!updatedQrCode) {
    //   return res.sendStatus(404);
    // }

    let wareHouseData = [];
    if (qrCode.type == QrCodeType.CHINA_SIDE) {
      wareHouseData = [
        { key: WarehouseChina.GUANZHOU, text: "广州" },
        { key: WarehouseChina.URUMQI, text: "乌鲁木齐" },
        { key: WarehouseChina.YIWU, text: "义务" },
      ];
    }
    // todo
    else {
      wareHouseData = [
        { key: WarehouseKazakstan.ALMATY, text: "阿拉木图" },
        { key: WarehouseKazakstan.ASTANA, text: "阿斯塔纳" },
      ];
    }

    Socket.emit("QR_SCANNED", {
      qrCode: qrCode,
      wareHouse: wareHouseData,
    });
    //req.app.io.emit("QR_SCANNED", { data: "Qwe" });

    return res.send({ status: 200, data: wareHouseData });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
}

export async function scanAndSearchBarCodeHandler(
  req: Request<{}, {}, SearchBarcodeOrderInput["body"]>,
  res: Response
) {
  try {
    const order = await findOrder({ barCode: req.body.barCode });

    if (!order) {
      return res.sendStatus(404);
    }

    // const timeline = await findTimelineOrder({ order });
    // const qrCodes = await findQrCodes({ orderGroup: order.orderGroup });

    Socket.emit("BARCODE_SEARCH_SCANNED", {
      order,
    });
    return res.send({
      order,
    });
  } catch (error) {
    logger.error(error);
    return res.sendStatus(500);
  }
}
