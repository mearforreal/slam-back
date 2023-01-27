import mongoose from "mongoose";

// export interface PriceListDocument extends mongoose.Document {

//   createdAt: Date;
//   updatedAt: Date;
// }

export enum CargoType {
  CLOTH = "CLOTH",
  TOY = "TOY",
  BIG_CARGO = "BIG_CARGO",
  SMALL_CARGO = "SMALL_CARGO",
}

export interface PriceListInput {
  density_from: number;
  density_to: number;
  express_plan: number;
  train_plan: number;
  standard_plan: number;
  plane_plan: number;
  cargo_type: CargoType;
}

export interface PriceListDocument extends PriceListInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

export enum PLAN_TYPE {
  EXPRESS_PLAN = "EXPRESS_PLAN",
  TRAIN_PLAN = "TRAIN_PLAN",
  PLANE_PLAN = "PLANE_PLAN",
  STANDARD_PLAN = "STANDARD_PLAN",
}

const priceListSchema = new mongoose.Schema(
  {
    density_from: {
      type: Number,
      required: true,
      unique: true,
    },
    density_to: {
      type: Number,
      unique: true,
    },
    express_plan: { type: Number, required: true },
    train_plan: { type: Number, required: true },
    plane_plan: { type: Number, required: true },
    standard_plan: { type: Number, required: true },
    cargo_type: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const PriceListModel = mongoose.model<PriceListDocument>(
  "PriceList",
  priceListSchema
);

export default PriceListModel;
