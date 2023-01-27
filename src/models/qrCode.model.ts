import mongoose from "mongoose";
import { OrderDocument } from "./order.model";
import { OrderGroupDocument } from "./orderGroup.model";

export interface QrCodeDocument extends mongoose.Document {
  orderGroup: OrderGroupDocument["_id"];
  img: string;
  type: string;
  isScanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum QrCodeType {
  CHINA_SIDE = "CHINA_SIDE",
  KAZAKHSTAN_SIDE = "KAZAKHSTAN_SIDE",
}
export const INIT_QR_CODE_NUM = 2;

const qrCodeSchema = new mongoose.Schema(
  {
    orderGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderGroup",
      required: true,
    },
    img: { type: String, required: true },
    type: { type: String, required: true },
    isScanned: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

const QrCodeModel = mongoose.model<QrCodeDocument>("QrCode", qrCodeSchema);

export default QrCodeModel;
