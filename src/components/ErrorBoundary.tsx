import { Component, ErrorInfo, ReactNode } from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { logClientError } from "@/lib/errorLogger";

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Filet de sécurité React : intercepte toute erreur de rendu non gérée dans
 * l'arbre des enfants pour afficher un écran de secours au lieu d'une page
 * blanche, et journalise l'erreur (console + backend via logClientError). */
class ErrorBoundaryBase extends Component<Props, State> {
  state: State = { hasError: false };

  /** Bascule le composant en état d'erreur dès qu'un enfant lève une exception au rendu. */
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  /** Journalise l'erreur capturée (message + pile des composants) pour le diagnostic. */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught render error:", error, errorInfo);
    logClientError("react_error_boundary", error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center bg-background">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold">{t("errorBoundary.title")}</h1>
          <p className="text-muted-foreground max-w-md">{t("errorBoundary.description")}</p>
          <Button onClick={() => window.location.reload()}>{t("errorBoundary.reload")}</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);
