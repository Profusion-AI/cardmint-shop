import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 font-display text-6xl font-bold text-paper">404</h1>
        <p className="mb-6 text-xl text-paper/70">Oops! This page doesn't exist</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-mint px-6 py-3 font-sans text-sm font-semibold text-midnight transition-all hover:bg-aqua hover:shadow-lg hover:shadow-mint/20"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
