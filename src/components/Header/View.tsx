import { FC } from "react";

import { ContactsRounded, DarkMode, Settings } from "@mui/icons-material";
import {
  Avatar,
  ButtonBase,
  Divider,
  Drawer,
  Stack,
  Switch,
  Typography
} from "@mui/material";

import Chat from "./layouts/Chat";
import Main from "./layouts/Main";
import NewContact from "./layouts/NewContact";
import { CommonProps, ViewProps } from "./types";

type TotalProps = ViewProps & CommonProps;

const View: FC<TotalProps> = ({
  isDrawerOpened,
  isNightMode,
  toggleDrawer,
  toggleNightMode,
  variant
}) => {
  return (
    <>
      <Stack
        sx={{
          bgcolor: "primary.dark"
        }}
        color="white"
        height="50px"
        justifyContent="start"
        alignItems="center"
        direction="row"
      >
        {variant === "main" && <Main toggleDrawer={toggleDrawer} />}
        {variant === "chat" && <Chat />}
        {variant === "new-contact" && <NewContact />}
      </Stack>

      <Drawer open={isDrawerOpened} onClose={toggleDrawer}>
        <Stack padding="15px" width="280px">
          <Avatar
            sx={{ bgcolor: "primary.dark", width: "54px", height: "54px" }}
          >
            NU
          </Avatar>

          <Typography fontWeight="bold" marginY="5px">
            New User
          </Typography>

          <Divider />

          <Stack marginTop="10px" gap="5px">
            <ButtonBase sx={{ height: "35px" }}>
              <Stack alignItems="center" direction="row" sx={{ width: "100%" }}>
                <ContactsRounded
                  fontSize="small"
                  sx={{ marginRight: "5px", color: "primary.dark" }}
                />
                <Typography fontSize="14px">New Contact</Typography>
              </Stack>
            </ButtonBase>

            <ButtonBase sx={{ height: "35px" }}>
              <Stack alignItems="center" direction="row" sx={{ width: "100%" }}>
                <Settings
                  fontSize="small"
                  sx={{ mr: "5px", color: "primary.dark" }}
                />
                <Typography fontSize="14px">Settings</Typography>
              </Stack>
            </ButtonBase>

            <ButtonBase sx={{ height: "35px" }} onClick={toggleNightMode}>
              <Stack alignItems="center" direction="row" sx={{ width: "100%" }}>
                <DarkMode
                  fontSize="small"
                  sx={{ mr: "5px", color: "primary.dark" }}
                />
                <Typography fontSize="14px">Night Mode</Typography>

                <Switch
                  checked={isNightMode}
                  size="small"
                  sx={{ ml: "auto" }}
                  inputProps={{ "aria-label": "controlled" }}
                />
              </Stack>
            </ButtonBase>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default View;
