import { FC } from "react";

import { ArrowBack } from "@mui/icons-material";
import { Avatar, IconButton, Typography } from "@mui/material";
import Link from "next/link";

const Chat: FC = () => {
  return (
    <>
      <Link href="/m">
        <a>
          <IconButton color="inherit" arial-label="back">
            <ArrowBack fontSize="medium" />
          </IconButton>
        </a>
      </Link>

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
