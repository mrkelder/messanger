import { createContext } from "react";

export interface AuthContext {
  changePage: () => void;
}

const authContext = createContext<AuthContext>({ changePage: () => {} });

export default authContext;
