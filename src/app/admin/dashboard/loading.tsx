export default function DashboardLoading() {
  return (
    <div className="dash-loading" role="status" aria-live="polite">
      <div className="dash-loading-bar" />
      <div className="dash-loading-stack">
        <div className="dash-loading-line w-40" />
        <div className="dash-loading-line w-70" />
        <div className="dash-loading-panel" />
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
