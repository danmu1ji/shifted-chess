// Radial red gradient overlay on the king's square when in check.
export default function CheckIndicator() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, rgba(255,0,0,0.75) 0%, rgba(231,0,0,0.5) 45%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
}
