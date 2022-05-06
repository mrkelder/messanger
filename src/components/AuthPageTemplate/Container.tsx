import { useCallback, useState, FC, useContext } from "react";

import { useMediaQuery } from "@mui/material";

import authContext, { AuthContext } from "src/contexts/authContext";

import type {
  ContainerProps,
  FormDataState,
  HandleInputChange,
  HandleSubmit,
  HandleLinkClick,
  FormErrorState
} from "./types";
import View from "./View";

const defaultFormData: FormDataState = {
  name: "",
  password: ""
};

const defaultFormError: FormErrorState = {
  name: false,
  password: false
};

const Container: FC<ContainerProps> = props => {
  const isTablet = useMediaQuery("(max-width: 768px)");
  const { changePage } = useContext<AuthContext>(authContext);
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [formError, setFormError] = useState(defaultFormError);

  const handleShowPassword = useCallback(() => {
    setIsPasswordShown(prev => !prev);
  }, []);

  const handleInputChange = useCallback<HandleInputChange>(
    field => event => {
      if (formError[field]) formError[field] = false;
      setFormData(prev => ({ ...prev, [field]: event.target?.value }));
    },
    [formError]
  );

  const handleLinkClick = useCallback<HandleLinkClick>(
    event => {
      event.preventDefault();
      setFormError(defaultFormError);
      changePage();
    },
    [changePage]
  );

  const handleSubmit = useCallback<HandleSubmit>(
    event => {
      event.preventDefault();
      const nameLength = formData.name.length;
      const passwordLength = formData.password.length;

      const formErrorState: FormErrorState = {
        name: false,
        password: false
      };

      if (nameLength < 4) formErrorState.name = true;
      if (passwordLength < 6) formErrorState.password = true;

      setFormError(formErrorState);
    },
    [formData]
  );

  return (
    <View
      {...props}
      isTablet={isTablet}
      isPasswordShown={isPasswordShown}
      formData={formData}
      formError={formError}
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
