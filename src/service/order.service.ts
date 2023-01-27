import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { number } from "zod";
import OrderModel, {
  OrderDocument,
  OrderInput,
  OrderStatus,
} from "../models/order.model";
import { ReceiveOrderInput } from "../schema/order.schema";
import { generateQR } from "./qrCode.service";
import { createTimeline, getWareHouseNameInMessage } from "./timeline.service";

export async function createOrder(input: OrderInput) {
  try {
    input.status = OrderStatus.PENDING;
    const result = await OrderModel.create(input);
    createTimeline(
      [result],
      "新订单已创建",
      "Создан новый заказ",
      "Жаңа тапсырыс жасалды",
      1
    );
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findOrder(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await OrderModel.findOne(query, {}, options);
    return result;
  } catch (e) {
    throw e;
  }
}

export async function findOrdersByOrderGroup(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await OrderModel.find(query, {}, options);

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findOrdersBarcodesByOrderGroup(
  query: FilterQuery<OrderDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await OrderModel.find(query, {}, options).select({
      barCode: 1,
      _id: 0,
    });

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findAndUpdateOrder(
  query: FilterQuery<OrderDocument>,
  update: UpdateQuery<OrderDocument>,
  options: QueryOptions
) {
  return OrderModel.findOneAndUpdate(query, update, options);
}

export async function findAndUpdateMultipleOrders(
  query: FilterQuery<OrderDocument>,
  update: UpdateQuery<OrderDocument>,
  options: QueryOptions
) {
  return OrderModel.updateMany(query, update, options);
}

export async function deleteOrder(query: FilterQuery<OrderDocument>) {
  return OrderModel.deleteOne(query);
}

export async function findFilterOrders(orderGroup: any, limit: any, page: any) {
  try {
    // execute query with page and limit values
    const orders = await OrderModel.find({ orderGroup })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection
    const count = await OrderModel.countDocuments({ orderGroup });

    // return response with posts, total pages, and current page
    return {
      orders,
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    console.error(err.message);
  }
}

async function getReceivedOrders(barcodes: string[]) {
  const orders = await findOrdersByOrderGroup({
    barCode: { $in: barcodes },
    status: OrderStatus.ARRIVED_AT_KAZAKHSTAN,
  });

  return orders;
}

export async function receiveOrder(data: ReceiveOrderInput["body"]) {
  const orders = await getReceivedOrders(data.barCodes);

  let orderBarcodes = orders.map((code) => code.barCode);

  const message_cn = `已接货`;
  const message_ru = `Доставлен`;

  const message_kz = `Жеткізілді`;

  const sort = 7;

  await findAndUpdateMultipleOrders(
    { barCode: { $in: orderBarcodes } },
    { status: OrderStatus.DELIVERED },
    { new: true }
  );
  await createTimeline(orders, message_cn, message_ru, message_kz, sort);
}

export async function notifyDailyArrivedOrders() {
  const result = await OrderModel.aggregate([
    {
      $match: {
        status: OrderStatus.ARRIVED_AT_KAZAKHSTAN,
        updatedAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);

  return result;
}
