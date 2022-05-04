import { useCallback, useState, FC } from "react";

import { useMediaQuery } from "@mui/material";

import type {
  ContainerProps,
  FormDataState,
  HandleInputChange,
  HandleSubmit
} from "./types";
import View from "./View";

const defaultFormData: FormDataState = {
  name: "",
  password: ""
};

const Container: FC<ContainerProps> = props => {
  const isTablet = useMediaQuery("(max-width: 768px)");
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  const handleShowPassword = useCallback(() => {
    setIsPasswordShown(prev => !prev);
  }, []);

  const handleInputChange = useCallback<HandleInputChange>(
    field => event => {
      setFormData(prev => ({ ...prev, [field]: event.target?.value }));
    },
    []
  );

  const handleSubmit = useCallback<HandleSubmit>(event => {
    event.preventDefault();

    alert("Data is sent 😊");
  }, []);

  return (
    <View
      {...props}
      isTablet={isTablet}
      isPasswordShown={isPasswordShown}
      formData={formData}
      handleSubmit={handleSubmit}
      handleShowPassword={handleShowPassword}
      handleInputChange={handleInputChange}
    />
  );
};

export default Container;
