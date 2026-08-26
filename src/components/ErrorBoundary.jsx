import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] bg-[#0c0c0c] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121214] border border-brand-gold/30 rounded-3xl p-8 space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mx-auto text-3xl">
              🧭
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-gold">
                Horizon Concierge Notice
              </span>
              <h2 className="font-serif text-3xl text-white">Experience Interrupted</h2>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                We encountered an unexpected rendering disturbance while preparing this sanctuary view.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-6 py-3 rounded-full bg-brand-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg"
              >
                Reload Sanctuary
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-6 py-3 rounded-full bg-white/10 text-white text-xs font-mono hover:bg-white/20 transition-all text-center flex items-center justify-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
