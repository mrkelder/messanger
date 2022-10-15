import mongoose from "mongoose";

import { GetMessagesController } from "src/controllers/chat";
import Message from "src/models/Message";
import User from "src/models/User";

const CHAT_ID = new mongoose.Types.ObjectId("111111111111111111111111");
const USER_ID = new mongoose.Types.ObjectId("211111111111111111111111");
const PEER_ID = new mongoose.Types.ObjectId("311111111111111111111111");

async function deleteMockData() {
  const messages = [];
  for (let i = 0; i < 12; i++) {
    messages.push(
      Message.deleteOne({
        _id: new mongoose.Types.ObjectId(
          `${String(i).padStart(3, "a")}111111111111111111111`
        )
      })
    );
  }

  await User.deleteOne({ _id: USER_ID });
  await User.deleteOne({ _id: PEER_ID });
  await Promise.all(messages);
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  await deleteMockData();

  const messages = [];

  const newUser = new User({
    _id: USER_ID,
    name: "chat-messages-controller-test-user",
    password: "123"
  });

  const newPeer = new User({
    _id: PEER_ID,
    name: "chat-messages-controller-test-peer",
    password: "123"
  });

  for (let i = 0; i < 12; i++) {
    const author = i % 2 === 0 ? USER_ID : PEER_ID;
    messages.push(
      new Message({
        chatId: CHAT_ID,
        author,
        text: String(i),
        read: false,
        _id: `${String(i).padStart(3, "a")}111111111111111111111`
      })
    );
  }

  await newUser.save();
  await newPeer.save();
  await Promise.all(messages.map(i => i.save()));

  await mongoose.disconnect();
});

afterAll(async () => {
  await mongoose.connect(process.env.MONGODB_HOST as string);
  await deleteMockData();
  await mongoose.disconnect();
});

describe("Get chat messages controller", () => {
  test("Should return last 10 messages", async () => {
    const controller = new GetMessagesController({
      chatId: CHAT_ID.toString(),
      messagesOffset: 0
    });

    const messages = await controller.run();

    expect(messages).toHaveLength(10);
  });

  test("Should return the last 3 messages", async () => {
    const controller = new GetMessagesController({
      chatId: CHAT_ID.toString(),
      messagesOffset: 0,
      messagesPerRequest: 3
    });

    const messages = await controller.run();

    expect(messages).toHaveLength(3);
  });

  test("Should return 2 messages when requesting more messages", async () => {
    const controller = new GetMessagesController({
      chatId: CHAT_ID.toString(),
      messagesOffset: 1
    });

    const messages = await controller.run();

    expect(messages).toHaveLength(2);
  });

  test("Should return the last 10 messages inspite of a negative messages offset", async () => {
    const controller = new GetMessagesController({
      chatId: CHAT_ID.toString(),
      messagesOffset: -24
    });

    const messages = await controller.run();

    expect(messages).toHaveLength(10);
  });

  test("Should return no messages due to requesting the messages that don't exist", async () => {
    const controller = new GetMessagesController({
      chatId: CHAT_ID.toString(),
      messagesOffset: 24
    });

    const messages = await controller.run();

    expect(messages).toHaveLength(0);
  });
});
