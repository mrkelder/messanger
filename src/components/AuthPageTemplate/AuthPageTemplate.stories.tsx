import React from "react";

import { ComponentStory, ComponentMeta } from "@storybook/react";
import { screen, userEvent } from "@storybook/testing-library";

import AuthPageTemplate from "./index";

import "styles/globals.css";

const argTypes = {
  title: {
    options: ["Registration", "Authorization"],
    control: { type: "select" }
  },
  buttonText: {
    options: ["Sign Up", "Sign In"],
    control: { type: "select" }
  },
  linkText: {
    options: ["Have the account already?", "Don't have an account yet?"],
    control: { type: "select" }
  }
};

export default {
  title: "AuthPageTemplate",
  component: AuthPageTemplate,
  parameters: {
    layout: "fullscreen",
    chromatic: {
      viewports: [320, 768, 1024]
    }
  },
  argTypes
} as ComponentMeta<typeof AuthPageTemplate>;

const Template: ComponentStory<typeof AuthPageTemplate> = args => (
  <AuthPageTemplate {...args} />
);

export const Registration = Template.bind({});
Registration.args = {
  title: argTypes.title.options[0],
  buttonText: argTypes.buttonText.options[0],
  linkText: argTypes.linkText.options[0]
};

export const Authorization = Template.bind({});
Authorization.args = {
  title: argTypes.title.options[1],
  buttonText: argTypes.buttonText.options[1],
  linkText: argTypes.linkText.options[1]
};

export const InputErrors = Template.bind({});
InputErrors.args = Registration.args;
InputErrors.play = async () => {
  const nameInput = screen.getByPlaceholderText(/Name/i);
  const passwordInput = screen.getByPlaceholderText(/Password/i);
  const submitButton = screen.getByText(/Sign Up/i);

  await userEvent.type(nameInput, "123");
  await userEvent.type(passwordInput, "12345");
  await userEvent.click(submitButton);
  await userEvent.unhover(submitButton);
};
