import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { screen, userEvent } from "@storybook/testing-library";

import Header from "./index";

import "styles/globals.css";

export default {
  title: "Header",
  component: Header
} as ComponentMeta<typeof Header>;

const Template: ComponentStory<typeof Header> = args => <Header {...args} />;

export const Main = Template.bind({});
Main.args = { variant: "main" };

export const MainWithOpenedNav = Template.bind({});
MainWithOpenedNav.args = { variant: "main" };
MainWithOpenedNav.play = async () => {
  const burgerButton = screen.getByLabelText(/open nav/i);
  await userEvent.click(burgerButton);
};

export const MainWithNightModeOn = Template.bind({});
MainWithNightModeOn.args = { variant: "main" };
MainWithNightModeOn.play = async () => {
  const burgerButton = screen.getByLabelText(/open nav/i);
  await userEvent.click(burgerButton);
  const nightModeButton = screen.getByLabelText(/night mode/i);
  await userEvent.click(nightModeButton);
};

export const Chat = Template.bind({});
Chat.args = { variant: "chat" };

export const NewContact = Template.bind({});
NewContact.args = { variant: "new-contact" };
