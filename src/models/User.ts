import { Schema, models, model, Document, Model } from "mongoose";

import { DatabaseUser } from "src/types/db";

import { USER_MODEL_NAME } from "./CONSTANTS";

type UserDocument = Document & Omit<DatabaseUser, "_id">;

interface UserModel extends Model<UserDocument> {
  findByName(name: string): Promise<Array<UserDocument>>;
  deleteByName(name: string): Promise<void>;
}

const userSchema = new Schema({
  name: String,
  password: String
});

userSchema.static("findByName", async function (name: string) {
  return await this.find({ name });
});

userSchema.static("deleteByName", async function (name: string) {
  await this.deleteOne({ name });
});

export default (models[USER_MODEL_NAME] as UserModel) ||
  model<UserModel>(USER_MODEL_NAME, userSchema);
