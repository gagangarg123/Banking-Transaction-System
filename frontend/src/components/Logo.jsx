export default function Logo({ size = 30, sub }) {
  return (
    <div className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12.5L16 5l12 7.5z" />
        <path d="M8 15.5v8M13.3 15.5v8M18.7 15.5v8M24 15.5v8" />
        <path d="M4.5 27h23" />
      </svg>
      <div className="logo-t">
        <b>Banking</b> <span>System</span>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}