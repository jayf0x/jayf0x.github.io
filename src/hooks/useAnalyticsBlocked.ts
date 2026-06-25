import { useEffect, useState } from "react";

export function useAnalyticsBlocked() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // Script is async — give it a moment before declaring it blocked
    const id = setTimeout(() => {
      setBlocked(typeof window.goatcounter?.count !== "function");
    }, 1000);
    return () => clearTimeout(id);
  }, []);

  return blocked;
}
