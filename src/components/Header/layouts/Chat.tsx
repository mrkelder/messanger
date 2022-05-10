import { FC } from "react";

import { ArrowBack } from "@mui/icons-material";
import { Avatar, IconButton, Typography } from "@mui/material";

const Chat: FC = () => {
  return (
    <>
      <IconButton color="inherit">
        <ArrowBack fontSize="medium" />
      </IconButton>

      <Avatar
        sx={{
          width: "35px",
          height: "35px",
          fontSize: "16px",
          bgcolor: "white",
          color: "primary.dark"
        }}
      >
        AU
      </Avatar>

      <Typography
        fontSize="0.9em"
        color="inherit"
        fontWeight="bold"
        marginLeft="7px"
      >
        Another User
      </Typography>
    </>
  );
};

export default Chat;
