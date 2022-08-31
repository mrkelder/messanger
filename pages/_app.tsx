import axios from "axios";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";

import Layout from "src/components/Layout";
import SocketProvider from "src/components/SocketProvider";
import AxiosContext from "src/contexts/axiosContext";
import store from "src/store";

import "styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_HOST,
    timeout: 100000,
    params: {}
  });

  return (
    <Provider store={store}>
      <AxiosContext.Provider value={axiosInstance}>
        <SocketProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SocketProvider>
      </AxiosContext.Provider>
    </Provider>
  );
}

export default MyApp;
