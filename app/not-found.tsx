import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-panel">
      <p className="meta-note">404</p>
      <h1>页面不存在</h1>
      <p>这个地址没有内容，可能已被移除或从未存在。</p>
      <p>
        <Link href="/">返回首页</Link>
      </p>
    </main>
  );
}
