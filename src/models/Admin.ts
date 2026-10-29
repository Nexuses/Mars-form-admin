import { Schema, models, model, type InferSchemaType } from "mongoose";

const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export type AdminDocument = InferSchemaType<typeof AdminSchema> & {
  _id: { toString(): string };
};

export const Admin =
  models.Admin || model("Admin", AdminSchema, "admins");
