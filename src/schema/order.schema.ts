import { object, number, string, TypeOf, array, nativeEnum } from "zod";
import { WarehouseKazakstan } from "../models/order.model";

const payload = {
  body: object({
    barCode: string({
      required_error: "barCode is required",
    }),
    orderGroup: string({
      required_error: "orderGroup is required",
    }),
  }),
};

const recive_payload = {
  body: object({
    barCodes: array(
      string({
        required_error: "barCode is required",
      })
    ),
  }),
};

const payloadBarcode = {
  body: object({
    barCode: string({
      required_error: "barCode is required",
    }),
  }),
};

const params = {
  params: object({
    orderId: string({
      required_error: "OrderId is required",
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

export const createOrderSchema = object({
  ...payload,
});
export const searchBarCodeOrderSchema = object({
  ...payloadBarcode,
});

export const receiveOrderSchema = object({
  ...recive_payload,
});

export const updateOrderSchema = object({
  ...payload,
  ...params,
});

export const deleteOrderSchema = object({
  ...params,
});

export const getOrderSchema = object({
  ...params,
});

export type CreateOrderInput = TypeOf<typeof createOrderSchema>;
export type UpdateOrderInput = TypeOf<typeof updateOrderSchema>;
export type ReadOrderInput = TypeOf<typeof getOrderSchema>;
export type DeleteOrderInput = TypeOf<typeof deleteOrderSchema>;
export type SearchBarcodeOrderInput = TypeOf<typeof searchBarCodeOrderSchema>;
export type ReceiveOrderInput = TypeOf<typeof receiveOrderSchema>;
