export interface CommonProps {
  variant?: "main" | "chat" | "new-contact";
}

export interface ViewProps {
  isDrawerOpened: boolean;
  isNightMode: boolean;
  toggleDrawer: () => void;
  toggleNightMode: () => void;
}
