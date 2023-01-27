import mongoose from "mongoose";
import { OrderDocument } from "./order.model";

export interface TimelineDocument extends mongoose.Document {
  order: OrderDocument["_id"];
  message: string;
  message_kz: string;
  status: string;
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TimelineMsg {
  WAREHOUSE_URUMQI,
  HORGOS,
  BORDER,
}

export interface TimelineInput {
  order: OrderDocument["_id"];
  message: string;
  message_ru: string;
  message_kz: string;
  sort: number;
  status: string;
}
export const DAYS_TO_URUMQI = 3;
export const DAYS_URUMQI_TO_HORGOS = 2;
export const DAYS_HORGOS_TO_BORDER = 2;

const timelineSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    message: { type: String, require: true },
    message_ru: { type: String, require: true },
    message_kz: { type: String, require: true },
    sort: { type: Number, require: true },
    status: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const TimelineModel = mongoose.model<TimelineDocument>(
  "Timeline",
  timelineSchema
);

export default TimelineModel;
