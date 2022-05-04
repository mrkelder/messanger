import { useCallback, useState, FormEventHandler, ChangeEvent } from "react";

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
  useMediaQuery,
  Link as MLink
} from "@mui/material";
import { NextPage } from "next";
import Link from "next/link";

interface FormDataState {
  name: string;
  password: string;
}

const defaultFormData: FormDataState = {
  name: "",
  password: ""
};

const Registration: NextPage = () => {
  const isTablet = useMediaQuery("(max-width: 768px)");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const inputWidth = isTablet ? "25ch" : "40ch";
  const buttonWidth = isTablet ? "15ch" : "25ch";

  const handleShowPassword = useCallback(() => {
    setIsPasswordShown(prev => !prev);
  }, []);

  const handleInputChange =
    (field: keyof FormDataState) => (event: ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: event.target?.value }));
    };

  const handleSubmit: FormEventHandler<HTMLFormElement> = event => {
    event.preventDefault();

    alert("Data is sent 😊");
  };

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
            Sing Up
          </Button>

          <Link href="/authorization" passHref>
            <MLink>Sign In</MLink>
          </Link>
        </Stack>
      </form>
    </>
  );
};

export default Registration;
