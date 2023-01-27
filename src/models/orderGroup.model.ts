import mongoose from "mongoose";
import { OrderStatus } from "./order.model";
import { UserDocument } from "./user.model";

export interface OrderGroupInput {
  title: string | null;
  createdBy: UserDocument["_id"];
}

export interface OrderGroupDocument extends OrderGroupInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const orderGroupSchema = new mongoose.Schema(
  {
    title: { type: String, require: false, unique: true, sparse: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
    toObject: { virtuals: true }, // So `console.log()` and other functions that use `toObject()` include virtuals
  }
);

orderGroupSchema.virtual("orders", {
  ref: "Order", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "orderGroup", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.

  count: true,
});

orderGroupSchema.virtual("recivedOrderCount", {
  ref: "Order", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "orderGroup", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  match: { status: OrderStatus.DELIVERED }, // match option with basic query selector
  count: true,
});

orderGroupSchema.virtual("qrCodes", {
  ref: "QrCode", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "orderGroup", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: false,
});

const OrderGroupModel = mongoose.model<OrderGroupDocument>(
  "OrderGroup",
  orderGroupSchema
);

export default OrderGroupModel;
