import mongoose from "mongoose";
import { string } from "zod";
import { CargoType, PLAN_TYPE } from "./priceList.model";

// export interface CalculatorDocument extends mongoose.Document {

//   createdAt: Date;
//   updatedAt: Date;
// }
//
export interface CalculatorInput {
  weight: number;
  length: number;
  height: number;
  width: number;
  title: string;
  plan: PLAN_TYPE;
  cargo_type: CargoType;
  density: number;
  ip: string;
  result: string;
}

export interface CalculatorDocument extends CalculatorInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
}

const calculatorSchema = new mongoose.Schema(
  {
    weight: { type: Number, required: true },
    length: { type: Number, required: true },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    density: { type: Number, required: true },
    title: { type: String, required: true },
    cargo_type: { type: String, required: true },
    plan: { type: String, required: true },
    ip: { type: String, required: true },
    result: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const CalculatorModel = mongoose.model<CalculatorDocument>(
  "Calculator",
  calculatorSchema
);

export default CalculatorModel;
