import { useCallback, useState, FC, useContext } from "react";

import { useMediaQuery } from "@mui/material";

import authContext, { AuthContext } from "src/contexts/authContext";

import type {
  ContainerProps,
  FormDataState,
  HandleInputChange,
  HandleSubmit,
  HandleLinkClick
} from "./types";
import View from "./View";

const defaultFormData: FormDataState = {
  name: "",
  password: ""
};

const Container: FC<ContainerProps> = props => {
  const isTablet = useMediaQuery("(max-width: 768px)");
  const { changePage } = useContext<AuthContext>(authContext);
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

  const handleLinkClick = useCallback<HandleLinkClick>(
    event => {
      event.preventDefault();
      changePage();
    },
    [changePage]
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
      handleLinkClick={handleLinkClick}
    />
  );
};

Container.defaultProps = {
  title: "Title",
  buttonText: "Action",
  linkText: "Some interesting text"
};

export default Container;
