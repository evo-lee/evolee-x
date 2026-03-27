import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="error-panel">
      <p className="meta-note">404</p>
      <h1>Page not found</h1>
      <p>The route exists in memory only. The published archive has nothing at this address yet.</p>
      <p>
        <Link href="/">Return home</Link>
      </p>
    </div>
  );
}

