import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-texture">
          <div className="craft-card flex flex-col items-center w-full max-w-2xl p-8">
            <div className="text-5xl mb-4">💥</div>
            <h2 className="text-xl text-[#2A1F1A] mb-4">Le carton s'est effondré (erreur inattendue).</h2>

            <div className="p-4 w-full rounded bg-[#F0E2CE] overflow-auto mb-6">
              <pre className="text-sm text-[#6B5740] whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="btn-primary px-4 py-2 text-sm"
            >
              🔄 Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
