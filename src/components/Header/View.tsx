import { FC } from "react";

import {
  ContactsRounded,
  DarkMode,
  Menu,
  Search,
  Settings
} from "@mui/icons-material";
import {
  Avatar,
  ButtonBase,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Switch,
  Typography
} from "@mui/material";

interface Props {
  isDrawerOpened: boolean;
  isNightMode: boolean;
  toggleDrawer: () => void;
  toggleNightMode: () => void;
}

const View: FC<Props> = ({
  isDrawerOpened,
  isNightMode,
  toggleDrawer,
  toggleNightMode
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
        <IconButton color="inherit" onClick={toggleDrawer}>
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
