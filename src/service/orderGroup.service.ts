import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { number } from "zod";
import OrderModel, { OrderDocument } from "../models/order.model";
import OrderGroupModel, {
  OrderGroupDocument,
  OrderGroupInput,
} from "../models/orderGroup.model";
import { QrCodeDocument } from "../models/qrCode.model";
import { generateQR } from "./qrCode.service";
import { createTimeline } from "./timeline.service";

export async function createOrderGroup(input: OrderGroupInput) {
  try {
    const result = await OrderGroupModel.create(input);
    generateQR(result);
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findOrderGroup(
  query: FilterQuery<OrderGroupDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await OrderGroupModel.findOne(query, {}, options);

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findAndUpdateOrderGroup(
  query: FilterQuery<OrderGroupDocument>,
  update: UpdateQuery<OrderGroupDocument>,
  options: QueryOptions
) {
  return OrderGroupModel.findOneAndUpdate(query, update, options);
}

export async function deleteOrderGroup(query: FilterQuery<OrderGroupDocument>) {
  return OrderGroupModel.deleteOne(query);
}

export async function findFilterOrderGroups(
  limit: any,
  page: any,
  isMobile: boolean
) {
  try {
    let orderGroups;

    // execute query with page and limit values
    if (isMobile) {
      orderGroups = await OrderGroupModel.find({})
        .sort({ createdAt: -1 })
        .populate({ path: "orders" })
        .populate({ path: "qrCodes" })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    } else {
      orderGroups = await OrderGroupModel.find({})
        .sort({ createdAt: -1 })
        .populate({ path: "orders" })
        .populate({ path: "recivedOrderCount" })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
    }

    // get total documents in the Posts collection
    const count = await OrderGroupModel.countDocuments();

    // return response with posts, total pages, and current page
    return {
      orderGroups,
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    console.error(err.message);
  }
}
