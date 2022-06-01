import { Schema, model, models, Model } from "mongoose";

import { Message } from "src/types/chat";

import { MESSAGE_MODEL_NAME } from "./CONSTANTS";

interface MessageModel extends Model<Message> {}

const messageSchema = new Schema(
  {
    author: { type: String, required: true },
    text: { type: String, required: true }
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
