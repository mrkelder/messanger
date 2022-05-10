import { FC, useCallback, useState } from "react";

import { CommonProps } from "./types";
import View from "./View";

const Container: FC<CommonProps> = ({ variant }) => {
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpened(prev => !prev);
  }, []);

  const toggleNightMode = useCallback(() => {
    setIsNightMode(prev => !prev);
  }, []);

  return (
    <View
      isDrawerOpened={isDrawerOpened}
      isNightMode={isNightMode}
      toggleDrawer={toggleDrawer}
      toggleNightMode={toggleNightMode}
      variant={variant}
    />
  );
};

Container.defaultProps = {
  variant: "main"
};

export default Container;
