import { useEffect } from "react";
import { checkSession } from "@/src/services/session";

export function useSessionMonitor() {
  useEffect(() => {
    let stopped = false;
    let checking = false;
    async function check() {
      if (checking || stopped) {
        return;
      }
      checking = true;
      try {
        const destination = await checkSession();
        if (destination && !stopped) {
          window.location.assign(destination);
        }
      } catch {
      } finally {
        checking = false;
      }
    }
    const timer = window.setInterval(check, 5000);
    window.addEventListener("focus", check);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, []);
}
