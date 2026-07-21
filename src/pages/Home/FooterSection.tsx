const year = new Date().getFullYear();

export const FooterSection = () => (
  <footer className="flex shrink-0 items-center justify-between border-t border-border/40 px-8 py-4">
    <span className="font-display text-sm font-semibold tracking-tight text-text">
      Jonatan Verstraete
    </span>
    <span className="font-mono text-nano uppercase tracking-widest text-(--muted)">
      Gent · {year}
    </span>
  </footer>
);
