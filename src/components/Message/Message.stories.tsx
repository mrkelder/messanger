import { ComponentMeta, ComponentStory } from "@storybook/react";

import Message from "./Message";

export default {
  title: "Message",
  component: Message,
  argTypes: {
    date: { control: "date" }
  }
} as ComponentMeta<typeof Message>;

const Template: ComponentStory<typeof Message> = args => <Message {...args} />;

export const MessageComponent = Template.bind({});

MessageComponent.args = {
  authorName: "User",
  date: new Date(),
  text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,"
};
