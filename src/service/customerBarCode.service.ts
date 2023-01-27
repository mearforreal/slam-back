import { FilterQuery, ObjectId, QueryOptions, UpdateQuery } from "mongoose";
import { number } from "zod";
import CustomerBarCodeModel, {
  CustomerBarCodeDocument,
  CustomerBarCodeInput,
  CustomerBarCodeStatus,
} from "../models/customerBarCode.model";
import {
  OrderDocument,
  WarehouseChina,
  WarehouseKazakstan,
} from "../models/order.model";
// import { sendSmsXML, SMS, SMSType } from "../utils/sms";
import {
  findOrder,
  findOrdersBarcodesByOrderGroup,
  findOrdersByOrderGroup,
} from "./order.service";
import {
  findTimelineOrder,
  getWareHouseNameInMessage,
} from "./timeline.service";

export async function createCustomerBarCode(input: CustomerBarCodeInput) {
  try {
    const result = await CustomerBarCodeModel.create(input);
    return result;
  } catch (e) {
    throw e;
  }
}
// findFilterCustomerBarCodes

export function formatTelphone(tel: string) {
  //+7(747)733-44-96
  return tel
    .replace("+", "")
    .replace("(", "")
    .replace(")", "")
    .replace("-", "")
    .replace("-", "");
}

export async function findFilterCustomerBarCodes(
  limit: any,
  page: any,
  query: FilterQuery<CustomerBarCodeDocument>,
  options: QueryOptions = { lean: false }
) {
  try {
    // execute query with page and limit values
    // const customerBarCodes = await CustomerBarCodeModel.find(query, {}, options)
    //   .limit(limit * 1)
    //   .skip((page - 1) * limit)
    //   .exec();

    const customerBarCodes = await CustomerBarCodeModel.aggregate([
      // { $match: query },
      { $match: query },
      {
        $lookup: {
          from: "orders",
          localField: "barCode",
          foreignField: "barCode",
          as: "orderdetails",
        },
      },
      {
        $facet: {
          pagination: [{ $skip: (page - 1) * limit }, { $limit: limit * 1 }],
        },
      },
    ]);
    // .limit(limit * 1)
    // .skip((page - 1) * limit)
    // .exec();

    // get total documents in the Posts collection
    const count = await CustomerBarCodeModel.find(
      query,
      {},
      options
    ).countDocuments();

    // return response with posts, total pages, and current page
    return {
      customerBarCodes: customerBarCodes[0],
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    throw err;
  }
}

export async function findAndUpdateCustomerBarCode(
  query: FilterQuery<CustomerBarCodeDocument>,
  update: UpdateQuery<CustomerBarCodeDocument>,
  options: QueryOptions
) {
  return CustomerBarCodeModel.findOneAndUpdate(query, update, options);
}

export async function deleteCustomerBarCode(
  query: FilterQuery<CustomerBarCodeDocument>
) {
  return CustomerBarCodeModel.deleteOne(query);
}

export async function findOneCustomerBarCode(
  query: FilterQuery<CustomerBarCodeDocument>,
  options: QueryOptions = { lean: true }
) {
  try {
    const result = await CustomerBarCodeModel.findOne(
      query,
      {},
      options
    ).populate({
      path: "owner",
      options: { select: { telephone: 1, name: 1, verified: 1, createdAt: 1 } },
    });

    return result;
  } catch (e) {
    throw e;
  }
}

interface NotifyCustomer {
  orders: string[];
  warehouse?: WarehouseKazakstan | WarehouseChina;
}

export async function findManyCustomerBarCodeGroupByOwner(orders: any) {
  const result = await CustomerBarCodeModel.aggregate([
    { $match: { barCode: { $in: orders } } },
    {
      $group: {
        _id: "$customer",
        barCode: { $addToSet: "$barCode" },
      },
    },

    {
      $lookup: {
        from: "customers",
        localField: "_id",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: { path: "$owner" } },
    {
      $project: {
        "owner.telephone": 1,
        "owner.name": 1,
        barCode: 1,
      },
    },
  ]);

  return result;
}

// export async function notifyCustomerSMS(params: NotifyCustomer) {
//   // let ordersbarcodes = params.orders.map((code) => code.barCode);

//   const customerCodes = await findManyCustomerBarCodeGroupByOwner(
//     params.orders
//   );

//   for (let i = 0; i < customerCodes.length; i++) {
//     if (!!customerCodes[i].barCode && !!customerCodes[i].owner) {
//       let text = `${
//         customerCodes[i].barCode.length > 1
//           ? `Ваши товары со штрих-кодами`
//           : `Ваш товар со штрих-кодом`
//       } `;

//       customerCodes[i].barCode.forEach((element: any, index: any) => {
//         text += `«${element}»${
//           index === customerCodes[i].barCode.length - 1 ? "" : ", "
//         }`;
//       });
//       // for (let j = 0; i < customerCodes[i].barCode.length; j++) {
//       //   text += `«${customerCodes[i].barCode[j]}»,\n`;
//       // }
//       text += `${
//         customerCodes[i].barCode.length > 1
//           ? ` прибыли в Казахстан.`
//           : ` прибыл в Казахстан.`
//       }\n`;

//       text += `Пожалуйста, заберите через два дня.\n`;
//       text += `Телефон склада: +7(707)326 99 99, +7(707)595 95 15\n`;
//       text += `«9515 Международная логистическая компания, ТОО»`;

//       let smsData: SMS = {
//         recipient: formatTelphone(customerCodes[i].owner.telephone),
//         text,
//         type: SMSType.REGULAR,
//       };
//       sendSmsXML(smsData);
//       // setTimeout(() => , 0);
//     }
//   }
// }

export async function fetchCustomerBarCodeDetails(_id: string) {
  try {
    const customerBarCode = await findOneCustomerBarCode({ _id });
    if (!customerBarCode) {
      throw Error("Not found");
    }

    let barCodeStatus = "";

    const barCodeRegistered = await findOrder({
      barCode: customerBarCode.barCode,
    });

    if (!barCodeRegistered) {
      barCodeStatus = CustomerBarCodeStatus.UNREGISTERED;
      return { customerBarCode, barCodeStatus, timeline: [] };
    }

    const timeline = await findTimelineOrder({ order: barCodeRegistered._id });
    if (barCodeRegistered.status) {
      barCodeStatus = barCodeRegistered.status;
    }

    return { customerBarCode, barCodeStatus, timeline };
  } catch (e) {
    throw e;
  }
}
