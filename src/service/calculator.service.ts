import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { number } from "zod";
import CalculatorModel, {
  CalculatorDocument,
  CalculatorInput,
} from "../models/calculator.model";
import { generateQR } from "./qrCode.service";
import { createTimeline } from "./timeline.service";

export async function createCalculator(
  input: CalculatorInput & { ip: string; result: number | string }
) {
  try {
    const result = await CalculatorModel.create(input);
    return result;
  } catch (e) {
    throw e;
  }
}
// findFilterCalculators

export async function findFilterCalculators(limit: any, page: any) {
  try {
    // execute query with page and limit values
    const calculators = await CalculatorModel.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection
    const count = await CalculatorModel.countDocuments();

    // return response with posts, total pages, and current page
    return {
      calculators,
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    console.error(err.message);
  }
}
