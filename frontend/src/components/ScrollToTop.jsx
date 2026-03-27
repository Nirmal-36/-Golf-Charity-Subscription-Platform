import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - React Router helper component
 * Automatically scrolls the window to the top (0, 0) whenever the path changes.
 * This is essential for Single Page Applications (SPAs) where navigation
 * doesn't natively reset the scroll position.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
