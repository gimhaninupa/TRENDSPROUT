import { useEffect } from "react";
import { Screen } from '../../components/shared';
import { Preloader } from '../../components/Preloader';

export function SplashScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  useEffect(() => {
    onNavigate("home");
  }, [onNavigate]);

  return <Preloader onFinish={() => onNavigate("home")} minDurationMs={800} />;
}
