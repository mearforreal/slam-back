import QRCode from "qrcode";
import { OrderDocument } from "../models/order.model";
import QrCodeModel, {
  QrCodeDocument,
  QrCodeType,
} from "../models/qrCode.model";
import * as crypto from "crypto";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import log from "../utils/logger";
import { OrderGroupDocument } from "../models/orderGroup.model";
import path from "path";
// With async/await

// todo
export const generateQR = async (orderGroup: OrderGroupDocument) => {
  if (!orderGroup._id) {
    throw new Error("Order Not Given");
  }
  try {
    const keys1 = Object.keys(QrCodeType);

    keys1.forEach(async (key, index) => {
      let hash =
        crypto
          .createHash("sha256")
          .update(crypto.randomBytes(64).toString("hex"))
          .digest("hex") + ".png";

      let data = {
        orderGroup: orderGroup._id,
        img: hash,
        type: key,
        isScanned: false,
      };

      const result = await QrCodeModel.create(data);

      // let dataText = {
      //   orderId: result.order.toString(),
      //   qrCodeType: result.type,
      //   qrCodeId: result._id,
      // };

      await QRCode.toFile(
        path.join(__dirname, `../assets/${hash}`),
        result._id.toString()
      );
    });

    return true;
  } catch (err) {
    console.error(err);
  }
};

export async function findQrCodes(
  query: FilterQuery<OrderGroupDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await QrCodeModel.find(query, {}, options);
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findOneQrCode(
  query: FilterQuery<QrCodeDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await QrCodeModel.findOne(query, {}, options);

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findAndUpdateQrCode(
  query: FilterQuery<QrCodeDocument>,
  update: UpdateQuery<QrCodeDocument>,
  options: QueryOptions
) {
  return QrCodeModel.findOneAndUpdate(query, update, options);
}
