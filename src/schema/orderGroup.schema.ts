import { object, number, string, TypeOf } from "zod";

const payload = {
  body: object({
    title: string({
      required_error: "title is required",
    }),
  }),
};

const params = {
  params: object({
    orderGroupId: string({
      required_error: "orderGroupId is required",
    }),
  }),
};

export const deleteOrderGroupSchema = object({
  ...params,
});

export const createOrderGroupSchema = object({
  ...payload,
});

export const getOrderGroupSchema = object({
  ...params,
});

export type CreateOrderGroupInput = TypeOf<typeof createOrderGroupSchema>;
// export type UpdateOrderGroupInput = TypeOf<typeof updateOrderGroupSchema>;
export type ReadOrderGroupInput = TypeOf<typeof getOrderGroupSchema>;
export type DeleteOrderGroupInput = TypeOf<typeof deleteOrderGroupSchema>;
