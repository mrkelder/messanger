import mongoose, { Schema, model, models, Model } from "mongoose";

import { Chat } from "src/types/db";

import { CHAT_MODEL_NAME, MESSAGE_MODEL_NAME } from "./CONSTANTS";

interface ChatModel extends Model<Chat> {}

const chatSchema = new Schema(
  {
    name: { type: String, required: true },
    lastMessage: { type: mongoose.Types.ObjectId, ref: MESSAGE_MODEL_NAME }
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
