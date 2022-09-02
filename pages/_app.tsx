import type { AppProps } from "next/app";
import { Provider } from "react-redux";

import AxiosProvider from "src/components/AxiosProvider";
import Layout from "src/components/Layout";
import SocketProvider from "src/components/SocketProvider";
import store from "src/store";

import "styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AxiosProvider>
        <SocketProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SocketProvider>
      </AxiosProvider>
    </Provider>
  );
}

export default MyApp;
