import { FC } from "react";

import { ArrowBack } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";

const Chat: FC = () => {
  return (
    <>
      <IconButton color="inherit">
        <ArrowBack fontSize="medium" />
      </IconButton>

      <Typography
        fontSize="0.9em"
        color="inherit"
        fontWeight="bold"
        marginLeft="7px"
      >
        New Contact
      </Typography>
    </>
  );
};

export default Chat;
