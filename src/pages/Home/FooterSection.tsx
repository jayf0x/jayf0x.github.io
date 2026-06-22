const year = new Date().getFullYear();

export const FooterSection = () => (
  <footer className="px-5 py-3 shrink-0 border-t border-border/30">
    <p className="font-mono text-mini text-(--muted)/60 tracking-wide">
      Jonatan · Ghent · {year}
    </p>
  </footer>
);
