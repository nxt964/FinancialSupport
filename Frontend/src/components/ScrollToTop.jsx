// components/ScrollToTop.jsx
import { useLocation } from "react-router-dom";
import { useLayoutEffect } from "react";

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]); // include ?page= changes

  return null;
}
