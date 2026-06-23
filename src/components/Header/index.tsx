import { routeDefs } from "@/router";
import { Link, useLocation } from "@tanstack/react-router";
import { Avatar } from "./Avatar";
import { Title } from "./Title";

export const Header = () => {
  const { pathname } = useLocation();

  return (
    <header className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-5 py-4 border-b border-border/50 shrink-0">
      <Avatar />

      <div className="min-w-0 overflow-hidden flex items-center justify-center">
        <Title />
      </div>

      <nav className="flex items-center justify-end gap-5">
        {routeDefs.map(({ path, label }) => {
          const isActive = path === pathname;
          return (
            <Link
              key={`page-${path}`}
              to={path}
              className={`font-mono text-sm uppercase tracking-[0.06em] transition-colors duration-150 ${
                isActive ? "text-accent" : "text-muted hover:text-text"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
