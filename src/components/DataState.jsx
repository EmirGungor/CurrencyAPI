import { FaExclamationTriangle, FaInbox, FaRedoAlt } from "react-icons/fa";

/* ============ Skeleton primitives ============ */
export function Shimmer({ width = "100%", height = 14, radius = 4, style }) {
  return (
    <span
      className="dx-shimmer"
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  );
}

export function SkeletonRow({ cols = 4, height = 14 }) {
  return (
    <div className="dx-skel-row">
      {Array.from({ length: cols }).map((_, i) => (
        <Shimmer key={i} width={i === 0 ? "30%" : i === cols - 1 ? "20%" : "100%"} height={height} />
      ))}
    </div>
  );
}

export function SkeletonStack({ rows = 4, cols = 4 }) {
  return (
    <div className="dx-skel-stack">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </div>
  );
}

/* ============ Empty / Error states ============ */
export function EmptyState({ icon = <FaInbox />, title = "Veri yok", message, action }) {
  return (
    <div className="dx-empty">
      <div className="dx-empty-ic">{icon}</div>
      <div className="dx-empty-title">{title}</div>
      {message && <div className="dx-empty-msg">{message}</div>}
      {action}
    </div>
  );
}

export function ErrorState({ message = "Veri alınamadı", onRetry, detail }) {
  return (
    <div className="dx-empty dx-error" role="alert">
      <div className="dx-empty-ic"><FaExclamationTriangle /></div>
      <div className="dx-empty-title">{message}</div>
      {detail && <div className="dx-empty-msg">{detail}</div>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="dx-retry-btn">
          <FaRedoAlt /> Tekrar dene
        </button>
      )}
    </div>
  );
}

/* ============ Compound: <DataState> ============
   Usage:
     <DataState
       loading={loading}
       error={error}
       empty={!data}
       skeleton={<SkeletonStack rows={5} cols={4} />}
       onRetry={refetch}
     >
       {children}
     </DataState>
============================================== */
export default function DataState({
  loading,
  error,
  empty,
  skeleton,
  emptyTitle,
  emptyMessage,
  emptyIcon,
  emptyAction,
  errorMessage,
  onRetry,
  children,
}) {
  if (error) {
    return <ErrorState message={errorMessage} onRetry={onRetry} detail={typeof error === "string" ? error : null} />;
  }
  if (loading) {
    return <div className="dx-loading">{skeleton || <SkeletonStack rows={3} cols={3} />}</div>;
  }
  if (empty) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return children;
}
