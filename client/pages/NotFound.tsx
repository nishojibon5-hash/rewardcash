import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="py-16 text-center">
      <h1 className="text-5xl font-extrabold mb-2">404</h1>
      <p className="text-white/80 mb-4">Page not found</p>
      <a href="/" className="underline">Back to Home</a>
    </div>
  );
};

export default NotFound;
