import mongoose, { Schema, model, models, Model } from "mongoose";

import { DatabaseChat } from "src/types/db";

import { CHAT_MODEL_NAME, USER_MODEL_NAME } from "./CONSTANTS";

import "./User";
import "./Message";

interface ChatModel extends Model<DatabaseChat> {}

const chatSchema = new Schema(
  {
    members: [
      { type: mongoose.Types.ObjectId, ref: USER_MODEL_NAME, required: true }
    ]
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

export default (models[CHAT_MODEL_NAME] as ChatModel) ||
  model<ChatModel>(CHAT_MODEL_NAME, chatSchema);
