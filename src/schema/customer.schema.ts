import { object, number, string, TypeOf } from "zod";

const params = {
  params: object({
    customerId: string({
      required_error: "customerId is required",
    }),
  }),
};

const telephon_params = {
  params: object({
    telephone: string({
      required_error: "telephone is required",
    }),
  }),
};

const telephon_paylod = {
  body: object({
    telephone: string({
      required_error: "customerId is required",
    }),
  }),
};

const payload = {
  body: object({
    telephone: string({
      required_error: "telephone is required",
    }),
    password: string({
      required_error: "password is required",
    }),
    name: string({
      required_error: "name is required",
    }),
  }),
};

const verfiUserPayload = {
  body: object({
    telephone: string({
      required_error: "telephone is required",
    }),
    user_input: string({
      required_error: "user_input is required",
    }),
  }),
};

export const createCustomerSchema = object({
  ...payload,
});

export const verifyCustomerSchema = object({
  ...verfiUserPayload,
});

export const sendSmsCustomerSchema = object({
  ...telephon_paylod,
});

export const deleteCustomerSchema = object({
  ...params,
});

export const getCustomerSchema = object({
  ...params,
});

export const getCustomerBytelephoneSchema = object({
  ...telephon_params,
});

export type CreateCustomerInput = TypeOf<typeof createCustomerSchema>;
export type SmsCustomerInput = TypeOf<typeof sendSmsCustomerSchema>;
export type VerifyCustomerInput = TypeOf<typeof verifyCustomerSchema>;
export type ReadCustomerInput = TypeOf<typeof getCustomerSchema>;
export type ReadCustomerByTelephoneInput = TypeOf<
  typeof getCustomerBytelephoneSchema
>;
export type DeleteCustomerInput = TypeOf<typeof deleteCustomerSchema>;
