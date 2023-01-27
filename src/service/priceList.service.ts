import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { WarehouseChina, WarehouseKazakstan } from "../models/order.model";
import PriceListModel, {
  CargoType,
  PLAN_TYPE,
  PriceListDocument,
  PriceListInput,
} from "../models/priceList.model";
import log from "../utils/logger";

export async function createPriceList(input: PriceListInput) {
  try {
    const result = await PriceListModel.create(input);
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findPriceList(
  query: FilterQuery<PriceListDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await PriceListModel.findOne(query, {}, options);

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findDensityNearest(
  density: number,
  cargo_type: CargoType
) {
  try {
    const result = await PriceListModel.findOne({
      cargo_type: cargo_type,
      density_from: { $lte: density },
      density_to: { $gte: density },
    });

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findAndUpdatePriceList(
  query: FilterQuery<PriceListDocument>,
  update: UpdateQuery<PriceListDocument>,
  options: QueryOptions
) {
  return PriceListModel.findOneAndUpdate(query, update, options);
}

export async function deletePriceList(query: FilterQuery<PriceListDocument>) {
  return PriceListModel.deleteOne(query);
}

export async function findFilterPriceLists(
  limit: any,
  page: any,
  cargo_type: string
) {
  try {
    // execute query with page and limit values
    const priceLists = await PriceListModel.find({ cargo_type: cargo_type })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection
    const count = await PriceListModel.countDocuments();

    // return response with posts, total pages, and current page
    return {
      priceLists,
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    console.error(err.message);
  }
}

export interface CalculatorInterface {
  weight: number;
  length: number;
  height: number;
  width: number;
  title: string;
  cargo_type: CargoType;
  plan: PLAN_TYPE;
}
interface dataDensity {
  length: number;
  height: number;
  width: number;
  weight: number;
}
export function getDensity(data: dataDensity) {
  const volume = data.length * data.height * data.width;
  return volume / data.weight;
}
export async function calculator(data: CalculatorInterface) {
  try {
    const density = getDensity(data);
    const res = await findDensityNearest(density, data.cargo_type);

    if (!res) {
      return;
    }
    //let price = 0;
    switch (data.plan) {
      case PLAN_TYPE.EXPRESS_PLAN:
        return { result: res.express_plan, density };

      case PLAN_TYPE.PLANE_PLAN:
        return { result: res.plane_plan, density };

      case PLAN_TYPE.STANDARD_PLAN:
        return { result: res.standard_plan, density };

      case PLAN_TYPE.TRAIN_PLAN:
        return { result: res.train_plan, density };

      default:
        break;
    }
    // return price;
  } catch (error) {
    log.error(error);
  }
}
