import mongoose, { PipelineStage } from "mongoose";

import Message from "src/models/Message";
import { ClientMessage } from "src/types/chat";

interface GetMessagesControllerInput {
  chatId: string;
  messagesOffset: number;
}

export class GetMessagesController {
  private MESSAGES_PER_REQUEST = 10;

  private chatId: string;
  private messagesOffset: number;

  constructor({ chatId, messagesOffset }: GetMessagesControllerInput) {
    this.chatId = chatId;
    this.messagesOffset = messagesOffset;
  }

  public async run(): Promise<ClientMessage[]> {
    try {
      await this.connectToDb();
      return await this.getChatMessages();
    } finally {
      await this.disconnectFromDb();
    }
  }

  private async connectToDb() {
    await mongoose.connect(process.env.MONGODB_HOST as string);
  }

  private async disconnectFromDb() {
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
  }

  private async getChatMessages(): Promise<ClientMessage[]> {
    const messages = await Message.aggregate(this.getAggregationPipeline());
    return messages as ClientMessage[];
  }

  private getAggregationPipeline(): PipelineStage[] {
    return [
      {
        $match: { chatId: new mongoose.Types.ObjectId(this.chatId) }
      },

      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { password: 0, __v: 0 } }]
        }
      },
      {
        $addFields: { author: { $first: "$author" } }
      },
      {
        $sort: {
          created_at: -1
        }
      },
      {
        $skip: Math.max(this.messagesOffset * this.MESSAGES_PER_REQUEST, 0)
      },
      {
        $limit: this.MESSAGES_PER_REQUEST
      }
    ];
  }
}
