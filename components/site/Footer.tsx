export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <p className="footer__name">evo-lee&apos;s blog</p>
          <p className="footer__line">lee刻意进化 · © {new Date().getFullYear()}</p>
        </div>
        <p className="footer__line">用 Lora · DM Sans 排版</p>
      </div>
    </footer>
  );
}
