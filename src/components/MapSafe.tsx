import React from 'react';

export default class MapSafe extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  constructor(props: any) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: any) { console.warn('Map disabled due to error:', err); }
  render() {
    if (this.state.failed) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-900/10 p-4 text-center">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Map temporarily unavailable</p>
          <p className="text-[11px] text-slate-500 mt-1">No problem — you can still use latitude / longitude fields below.</p>
        </div>
      );
    }
    return this.props.children;
  }
}