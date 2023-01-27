import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import config from "config";
import _default from "../config/default";

export interface ICustomerSelete {
  telephone?: number;
  name?: number;
  password?: number;
  verified?: number;
  createdAt?: number;
  next_sms_limit_time?: number;
  verfication_code?: number;
  updatedAt?: number;
}

export interface CustomerInput {
  telephone: string;
  name: string;
  password: string;
}

export interface CustomerDocument extends CustomerInput, mongoose.Document {
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<Boolean>;
}

const CustomerSchema = new mongoose.Schema(
  {
    telephone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.pre("save", async function (next) {
  let customer = this as CustomerDocument;

  if (!customer.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(_default.saltWorkFactor);

  const hash = await bcrypt.hashSync(customer.password, salt);

  customer.password = hash;

  return next();
});

CustomerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const customer = this as CustomerDocument;

  return bcrypt
    .compare(candidatePassword, customer.password)
    .catch((e) => false);
};

const CustomerModel = mongoose.model<CustomerDocument>(
  "Customer",
  CustomerSchema
);

export default CustomerModel;
