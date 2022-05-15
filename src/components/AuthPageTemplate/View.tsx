import { FC } from "react";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  OutlinedInput,
  IconButton,
  TextField,
  Stack,
  InputAdornment,
  Button,
  FormControl,
  Link as MLink,
  Typography,
  FormHelperText
} from "@mui/material";

import type {
  CommonProps,
  FormDataState,
  HandleInputChange,
  HandleSubmit,
  HandleLinkClick,
  FormErrorState
} from "./types";

interface ViewProps {
  isTablet: boolean;
  isPasswordShown: boolean;
  formData: FormDataState;
  formError: FormErrorState;
  handleSubmit: HandleSubmit;
  handleInputChange: HandleInputChange;
  handleLinkClick: HandleLinkClick;
  handleShowPassword: () => void;
}

type TotalProps = ViewProps & CommonProps;

const View: FC<TotalProps> = ({
  isTablet,
  title,
  handleSubmit,
  formData,
  formError,
  handleInputChange,
  handleShowPassword,
  isPasswordShown,
  buttonText,
  linkText,
  handleLinkClick,
  isSubmitDisabled
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
          <Typography variant="h1" sx={{ fontSize: "3em", fontWeight: "bold" }}>
            Belo Chat
          </Typography>

          <Typography>{title}</Typography>

          <FormControl sx={{ m: 1, width: inputWidth }} variant="outlined">
            <TextField
              name="name"
              placeholder="Name"
              size="small"
              value={formData.name}
              onChange={handleInputChange("name")}
              error={formError.name}
              helperText={
                formError.name
                  ? "Name has to be at least 4 characters long"
                  : ""
              }
            />
          </FormControl>

          <FormControl
            size="small"
            sx={{ m: 1, width: inputWidth }}
            variant="outlined"
          >
            <OutlinedInput
              name="password"
              placeholder="Password"
              type={isPasswordShown ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange("password")}
              error={formError.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label="show password"
                    onClick={handleShowPassword}
                  >
                    {isPasswordShown ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <FormHelperText error>
              {formError.password
                ? "Password has to be at least 6 characters long"
                : ""}
            </FormHelperText>
          </FormControl>

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            variant="contained"
            sx={{ width: buttonWidth }}
          >
            {buttonText}
          </Button>

          <MLink onClick={handleLinkClick}>{linkText}</MLink>
        </Stack>
      </form>
    </>
  );
};

export default View;
