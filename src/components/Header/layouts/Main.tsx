import { FC } from "react";

import { Menu, Search } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";

import { ViewProps } from "../types";

type TotalProps = Pick<ViewProps, "toggleDrawer">;

const Main: FC<TotalProps> = ({ toggleDrawer }) => {
  return (
    <>
      <IconButton color="inherit" onClick={toggleDrawer} aria-label="open nav">
        <Menu fontSize="medium" />
      </IconButton>

      <Typography
        variant="h1"
        fontSize="1.1em"
        color="inherit"
        fontWeight="bold"
      >
        Belo Chat
      </Typography>

      <IconButton sx={{ ml: "auto" }} color="inherit">
        <Search fontSize="medium" />
      </IconButton>
    </>
  );
};

export default Main;
