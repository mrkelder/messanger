import mongoose, { Schema, model, models, Model } from "mongoose";

import { DatabaseMessage } from "src/types/db";

import {
  CHAT_MODEL_NAME,
  MESSAGE_MODEL_NAME,
  USER_MODEL_NAME
} from "./CONSTANTS";

interface MessageModel extends Model<DatabaseMessage> {}

const messageSchema = new Schema(
  {
    author: {
      type: mongoose.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true
    },
    chatId: {
      type: mongoose.Types.ObjectId,
      ref: CHAT_MODEL_NAME,
      required: true
    },
    text: { type: String, required: true },
    read: { type: Boolean, required: true }
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at"
    }
  }
);

export default (models[MESSAGE_MODEL_NAME] as MessageModel) ||
  model<MessageModel>(MESSAGE_MODEL_NAME, messageSchema);
