import dayjs from "dayjs";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

import CustomerModel, {
  CustomerDocument,
  CustomerInput,
  ICustomerSelete,
} from "../models/customer.model";
// import { sendSmsXML, SMS, SMSType } from "../utils/sms";
import { formatTelphone } from "./customerBarCode.service";
import { omit } from "lodash";
//
interface VerifyUserInput {
  telephone: string;
  user_input: string;
}

export async function createCustomer(input: CustomerInput) {
  try {
    const tel = formatTelphone(input.telephone);
    const result = await CustomerModel.create({ ...input, telephone: tel });

    return omit(result.toJSON(), "password");
  } catch (e) {
    throw e;
  }
}

export async function validatePassword({
  telephone,
  password,
}: {
  telephone: string;
  password: string;
}) {
  const tel = formatTelphone(telephone);
  const user = await CustomerModel.findOne({ telephone: tel });

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return omit(user.toJSON(), "password");
}

// export async function findUser(query: FilterQuery<UserDocument>) {
//   return CustomerModel.findOne(query).lean();
// }

export async function findCustomer(
  query: FilterQuery<CustomerDocument>,
  options: QueryOptions = { lean: true },
  select: ICustomerSelete = {
    telephone: 1,
    name: 1,
    // verified: 1,
    // createdAt: 1,
    // next_sms_limit_time: 1,
    // verfication_code: 0,
    // barCodes: 0,
    // updatedAt: 0,
  }
) {
  try {
    // const result = await CustomerModel.findOne(query, {}, options).select({
    //   telephone: 1,
    //   name: 1,
    //   verified: 1,
    //   createdAt: 1,
    //   next_sms_limit_time: 1,
    //   // verfication_code: 0,
    //   // barCodes: 0,
    //   // updatedAt: 0,
    // });

    const result = await CustomerModel.findOne(query, {}, options).select(
      select
    );

    return result;
  } catch (e) {
    throw e;
  }
}

export async function findAndUpdateCustomer(
  query: FilterQuery<CustomerDocument>,
  update: UpdateQuery<CustomerDocument>,
  options: QueryOptions,
  select: ICustomerSelete = {
    telephone: 1,
    name: 1,
    // verified: 1,
    // createdAt: 1,
    // next_sms_limit_time: 1,
    // verfication_code: 0,
    // barCodes: 0,
    // updatedAt: 0,
  }
) {
  return CustomerModel.findOneAndUpdate(query, update, options).select(select);
}

export async function deleteCustomer(query: FilterQuery<CustomerDocument>) {
  return CustomerModel.deleteOne(query);
}

export async function findFilterCustomers(
  limit: any,
  page: any,
  query: FilterQuery<CustomerDocument>
) {
  try {
    let customers;

    // execute query with page and limit values
    customers = await CustomerModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // get total documents in the Posts collection
    const count = await CustomerModel.countDocuments();

    // return response with posts, total pages, and current page
    return {
      customers,
      total: count,
      currentPage: page,
    };
  } catch (err: any) {
    console.error(err.message);
  }
}

//
