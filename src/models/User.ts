import { Schema, models, model } from "mongoose";

import { USER_MODEL_NAME } from "./CONSTANTS";

const userSchema = new Schema({
  name: String,
  password: String
});

userSchema.static("findByName", async function (name: string) {
  return await this.find({ name });
});

export default models[USER_MODEL_NAME] || model(USER_MODEL_NAME, userSchema);
