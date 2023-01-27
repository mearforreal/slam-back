import mongoose from "mongoose";
import { CustomerDocument } from "./customer.model";
import { findOrder } from "../service/order.service";
import OrderModel, { OrderDocument } from "./order.model";

// export interface Barcode {
//   barCode: string;
//   type: string;
// }

export enum BarCodeType {
  CARGO = "CARGO",
  PACKAGE = "PACKAGE",
}

export enum CustomerBarCodeStatus {
  UNREGISTERED = "UNREGISTERED",
}

// type DoorState = Door | DoorFrame;

export interface CustomerBarCodeInput {
  barCode: string;
  title?: string;
  type: BarCodeType;
  customer: CustomerDocument["_id"];
  owner?: CustomerDocument;
}

export interface CustomerBarCodeDocument
  extends CustomerBarCodeInput,
    mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  getOrder(): any;
}

const CustomerBarCodeSchema = new mongoose.Schema(
  {
    barCode: { type: String, unique: true, required: true },
    title: { type: String, unique: false, required: false },
    type: { type: String, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  },
  {
    timestamps: true,
  }
);

CustomerBarCodeSchema.virtual("owner", {
  ref: "Customer", // The model to use
  localField: "customer", // Find people where `localField`
  foreignField: "_id", // is equal to `foreignField`
  // If `justOne` is true, 'members' will be a single doc as opposed to
  // an array. `justOne` is false by default.
  justOne: true,
});

CustomerBarCodeSchema.methods.getOrder = async function () {
  const customerBarCode = this as CustomerBarCodeDocument;

  const orderDetail = await OrderModel.find({
    barCode: customerBarCode.barCode,
  });

  return { customerBarCode, orderDetail };
};

const CustomerBarCodeModel = mongoose.model<CustomerBarCodeDocument>(
  "CustomerBarCode",
  CustomerBarCodeSchema
);

export default CustomerBarCodeModel;
