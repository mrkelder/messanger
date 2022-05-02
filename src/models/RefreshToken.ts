import mongoose, { Schema, model, models, Model } from "mongoose";

import { DatabseRefreshToken } from "src/types/db";

import { USER_MODEL_NAME, REFRESH_TOKEN_MODEL_NAME } from "./CONSTANTS";
import "./User";

type RefreshTokenDocument = Document & Omit<DatabseRefreshToken, "_id">;

interface RefreshTokenModel extends Model<RefreshTokenDocument> {
  refresh(
    userId: string | mongoose.Types.ObjectId,
    newRefreshToken: string
  ): Promise<void>;
  deleteByUserId(userId: string | mongoose.Types.ObjectId): Promise<void>;
  findByUserId(
    userId: string | mongoose.Types.ObjectId
  ): Promise<RefreshTokenDocument | undefined>;
}

const refreshTokenSchema = new Schema({
  token: String,
  userId: { type: mongoose.Types.ObjectId, ref: USER_MODEL_NAME }
});

refreshTokenSchema.static(
  "refresh",
  async function (
    userId: string | mongoose.Types.ObjectId,
    newRefreshToken: string
  ) {
    await this.updateOne(
      { userId: new mongoose.Types.ObjectId(userId) },
      { $set: { token: newRefreshToken } }
    );
  }
);

refreshTokenSchema.static(
  "deleteByUserId",
  async function (userId: string | mongoose.Types.ObjectId) {
    await this.deleteOne({ userId: new mongoose.Types.ObjectId(userId) });
  }
);

refreshTokenSchema.static(
  "findByUserId",
  async function (
    userId: string | mongoose.Types.ObjectId
  ): Promise<RefreshTokenDocument | undefined> {
    return await this.find({ userId: new mongoose.Types.ObjectId(userId) })[0];
  }
);

export default (models[REFRESH_TOKEN_MODEL_NAME] as RefreshTokenModel) ||
  model<RefreshTokenModel>(REFRESH_TOKEN_MODEL_NAME, refreshTokenSchema);
