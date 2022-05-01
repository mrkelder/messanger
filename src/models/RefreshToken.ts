import mongoose, { Schema, model, models, Model } from "mongoose";

import { DatabseRefreshToken } from "src/types/db";

import { USER_MODEL_NAME, REFRESH_TOKEN_MODEL_NAME } from "./CONSTANTS";
import "./User";

type UserDocument = Document & Omit<DatabseRefreshToken, "_id">;

interface RefreshTokenModel extends Model<UserDocument> {
  refresh(userId: string, newRefreshToken: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

const refreshTokenSchema = new Schema({
  token: String,
  userId: { type: mongoose.Types.ObjectId, ref: USER_MODEL_NAME }
});

refreshTokenSchema.static(
  "refresh",
  async function (userId: string, newRefreshToken: string) {
    await this.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { token: newRefreshToken } }
    );
  }
);

refreshTokenSchema.static("deleteByUserId", async function (userId: string) {
  await this.deleteOne({ userId: new mongoose.Types.ObjectId(userId) });
});

export default (models[REFRESH_TOKEN_MODEL_NAME] as RefreshTokenModel) ||
  model<RefreshTokenModel>(REFRESH_TOKEN_MODEL_NAME, refreshTokenSchema);
