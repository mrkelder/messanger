import { createContext } from "react";

import axios, { AxiosInstance } from "axios";

const axiosContext = createContext<AxiosInstance>(axios.create());

export default axiosContext;
