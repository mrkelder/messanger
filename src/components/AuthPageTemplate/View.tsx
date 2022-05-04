import { FC } from "react";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  OutlinedInput,
  IconButton,
  TextField,
  Stack,
  InputAdornment,
  Button,
  InputLabel,
  FormControl,
  Link as MLink,
  Typography
} from "@mui/material";

import type {
  ContainerProps,
  FormDataState,
  HandleInputChange,
  HandleSubmit,
  HandleLinkClick
} from "./types";

interface ViewProps {
  isTablet: boolean;
  isPasswordShown: boolean;
  formData: FormDataState;
  handleSubmit: HandleSubmit;
  handleInputChange: HandleInputChange;
  handleLinkClick: HandleLinkClick;
  handleShowPassword: () => void;
}

type TotalProps = ViewProps & ContainerProps;

const View: FC<TotalProps> = ({
  isTablet,
  title,
  handleSubmit,
  formData,
  handleInputChange,
  handleShowPassword,
  isPasswordShown,
  buttonText,
  linkText,
  handleLinkClick
}) => {
  const inputWidth = isTablet ? "25ch" : "40ch";
  const buttonWidth = isTablet ? "15ch" : "25ch";

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack
          alignItems="center"
          justifyContent="center"
          height="100vh"
          spacing={2}
        >
          <h1>Belo Chat</h1>

          <Typography>{title}</Typography>

          <FormControl sx={{ m: 1, width: inputWidth }} variant="outlined">
            <TextField
              name="name"
              label="Name"
              size="small"
              value={formData.name}
              onChange={handleInputChange("name")}
            />
          </FormControl>

          <FormControl
            size="small"
            sx={{ m: 1, width: inputWidth }}
            variant="outlined"
          >
            <InputLabel
              sx={{ backgroundColor: "white", borderRight: "3px solid white" }}
              htmlFor="outlined-adornment-password"
            >
              Password
            </InputLabel>
            <OutlinedInput
              name="password"
              id="outlined-adornment-password"
              label="Name"
              type={isPasswordShown ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange("password")}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="toggle password visibility"
                    onClick={handleShowPassword}
                  >
                    {isPasswordShown ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <Button type="submit" variant="contained" sx={{ width: buttonWidth }}>
            {buttonText}
          </Button>

          <MLink onClick={handleLinkClick}>{linkText}</MLink>
        </Stack>
      </form>
    </>
  );
};

export default View;
