import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[LB CodeBase] React render failure', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex min-h-[100svh] items-center justify-center bg-black px-6 text-white">
        <div role="alert" className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b0b0d] p-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">Display recovery</p>
          <h1 className="mt-4 font-display text-3xl font-black uppercase">The page could not finish rendering.</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/55">
            Reload the page to retry. If the problem continues, return home and start again.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-12 rounded-full bg-brand-primary px-7 text-xs font-black uppercase tracking-[0.18em] text-white"
            >
              Reload page
            </button>
            <a
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 text-xs font-black uppercase tracking-[0.18em] text-white/75"
            >
              Return home
            </a>
          </div>
        </div>
      </main>
    );
  }
}
