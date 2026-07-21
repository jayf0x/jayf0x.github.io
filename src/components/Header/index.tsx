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

      <nav className="flex items-center justify-end gap-1">
        {routeDefs.map(({ path, label }) => {
          const isActive = path === pathname;
          return (
            <Link
              key={`page-${path}`}
              to={path}
              className={`relative rounded-full px-3 py-1.5 text-sm tracking-tight transition-colors duration-150 ${
                isActive ? "text-text" : "text-(--muted) hover:text-text"
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-full border border-border/70 bg-(--surface)/70" />
              )}
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
