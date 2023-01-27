import { object, number, string, TypeOf, nativeEnum } from "zod";
import { BarCodeType } from "../models/customerBarCode.model";

const payload = {
  body: object({
    barCode: string({
      required_error: "barCode is required",
    }),
    title: string().optional(),
    type: nativeEnum(BarCodeType),
  }),
};

const customerBarCodeIdPayload = {
  body: object({
    customerBarCodeId: string({
      required_error: "customerBarCodeId is required",
    }),
  }),
};

const paramsFilter = {
  params: object({
    type: nativeEnum(BarCodeType),
  }),
};

const params = {
  params: object({
    customerBarCodeId: string({
      required_error: "CustomerBarCodeId is required",
    }),
  }),
};

const paramsBothCustomerAndBarCode = {
  params: object({
    customerBarCodeId: string({
      required_error: "CustomerBarCodeId is required",
    }),
  }),
};

const query = {
  query: object({
    page: number({
      required_error: "page is required",
    }),
    limit: number({
      required_error: "limit is required",
    }),
  }),
};

export const createCustomerBarCodeSchema = object({
  ...payload,
});

export const updateCustomerBarCodeSchema = object({
  ...paramsBothCustomerAndBarCode,
  ...payload,
});

export const deleteCustomerBarCodeSchema = object({
  ...paramsBothCustomerAndBarCode,
});

export const getCustomerBarCodeSchema = object({
  ...customerBarCodeIdPayload,
});

export const paginateCustomerBarCodeSchema = object({
  ...paramsFilter,
});

export type CreateCustomerBarCodeInput = TypeOf<
  typeof createCustomerBarCodeSchema
>;
export type UpdateCustomerBarCodeInput = TypeOf<
  typeof updateCustomerBarCodeSchema
>;
export type ReadCustomerBarCodeInput = TypeOf<typeof getCustomerBarCodeSchema>;
export type DeleteCustomerBarCodeInput = TypeOf<
  typeof deleteCustomerBarCodeSchema
>;

export type PaginateCustomerBarCodeInput = TypeOf<
  typeof paginateCustomerBarCodeSchema
>;
// export type SearchBarcodeCustomerBarCodeInput = TypeOf<typeof searchBarCodeCustomerBarCodeSchema>;
