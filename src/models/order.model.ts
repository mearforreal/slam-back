import mongoose from "mongoose";
import { OrderGroupDocument } from "./orderGroup.model";
import { UserDocument } from "./user.model";

export interface OrderInput {
  createdBy: UserDocument["_id"];
  orderGroup: OrderGroupDocument["_id"];
  barCode: string;
  status?: string;
}

export interface OrderDocument extends OrderInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum OrderStatus {
  PENDING = "PENDING",
  SENT_FROM_CHINA = "SENT_FROM_CHINA",
  DELIVERING = "DELIVERING",
  ARRIVED_AT_KAZAKHSTAN = "ARRIVED_AT_KAZAKHSTAN",
  DELIVERED = "DELIVERED",
  BORDER = "BORDER",
}

export enum WarehouseChina {
  GUANZHOU = "GUANZHOU",
  YIWU = "YIMU",
  URUMQI = "URUMQI",
}

export enum WarehouseKazakstan {
  ALMATY = "ALMATY",
  ASTANA = "ASTANA",
}

const orderSchema = new mongoose.Schema(
  {
    // order_token: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderGroup: { type: mongoose.Schema.Types.ObjectId, ref: "OrderGroup" },
    barCode: { type: String, required: true, unique: true },
    description: { type: String },
    address: { type: String },
    status: { type: String, required: true },
    client_name: { type: String },
    client_tel: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

const OrderModel = mongoose.model<OrderDocument>("Order", orderSchema);

export default OrderModel;
