import { useState } from "react";

// Persiste un état de navigation interne (onglet actif, élément sélectionné...)
// dans sessionStorage. Sur mobile en particulier, changer de fenêtre/appli peut
// faire décharger l'onglet par le navigateur (économie de mémoire), qui le
// recharge ensuite en remontant les composants React — ramenant silencieusement
// l'utilisateur à l'écran principal au lieu de la page où il se trouvait. Les
// pages qui gèrent leur navigation via un simple useState (au lieu de routes
// réelles) doivent utiliser ceci pour survivre à un tel remontage.
export function useSessionState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });

  const setPersistedState = (value: T) => {
    setState(value);
    try {
      if (value === null || value === undefined) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Stockage indisponible (navigation privée, quota...) : la sélection ne
      // survivra pas à un remontage, mais la navigation reste fonctionnelle.
    }
  };

  return [state, setPersistedState];
}
