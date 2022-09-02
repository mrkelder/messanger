import { useRouter } from "next/router";

function useIsRootPage() {
  const router = useRouter();

  return { isRootPage: router.pathname === "/" };
}

export default useIsRootPage;
