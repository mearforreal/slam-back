import { object, number, string, TypeOf, nativeEnum } from "zod";
import { WarehouseChina } from "../models/order.model";
import { CargoType, PLAN_TYPE } from "../models/priceList.model";
// density_from: number;
// density_to: number;
// express_plan: number;
// train_plan: number;
// standard_plan: number;
// plane_plan: number;
// status: string;
// createdAt: Date;
// updatedAt: Date;

const payload = {
  body: object({
    density_from: number({
      required_error: "density_from is required",
    }),
    density_to: number({
      required_error: "density_to is required",
    }),
    express_plan: number({
      required_error: "express_plan is required",
    }),
    train_plan: number({
      required_error: "train_plan is required",
    }),
    standard_plan: number({
      required_error: "standard_plan is required",
    }),
    plane_plan: number({
      required_error: "plane_plan is required",
    }),
    cargo_type: nativeEnum(CargoType),
  }),
};

// export interface CalculatorInterface {
//   weight: number;
//   length: number;
//   height: number;
//   width: number;
//   warehouse: WarehouseChina | WarehouseKazakstan;
//   plan: PLAN_TYPE;
// }
const calculatorPayload = {
  body: object({
    weight: number({
      required_error: "weight is required",
    }),
    length: number({
      required_error: "length is required",
    }),
    height: number({
      required_error: "height is required",
    }),
    width: number({
      required_error: "width is required",
    }),
    title: string({
      required_error: "title is required",
    }),
    // ip:string({
    //   required_error: "title is required",
    // })

    plan: nativeEnum(PLAN_TYPE),
    cargo_type: nativeEnum(CargoType),
  }),
};

const params = {
  params: object({
    priceListId: string({
      required_error: "priceListId is required",
    }),
  }),
};

export const createPriceListSchema = object({
  ...payload,
});

export const calculatorSchema = object({
  ...calculatorPayload,
});

export const updatePriceListSchema = object({
  ...payload,
  ...params,
});

export const deletePriceListSchema = object({
  ...params,
});

export const getPriceListSchema = object({
  ...params,
});

export type CreatePriceListInput = TypeOf<typeof createPriceListSchema>;
export type CalculatorInput = TypeOf<typeof calculatorSchema>;
export type UpdatePriceListInput = TypeOf<typeof updatePriceListSchema>;
export type ReadPriceListInput = TypeOf<typeof getPriceListSchema>;
export type DeletePriceListInput = TypeOf<typeof deletePriceListSchema>;
