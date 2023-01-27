import { object, string } from "zod";

export const createSessionSchema = object({
  body: object({
    username: string({
      required_error: "username is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});

export const createSessioCustomerSchema = object({
  body: object({
    telephone: string({
      required_error: "telephone is required",
    }),
    password: string({
      required_error: "Password is required",
    }),
  }),
});
