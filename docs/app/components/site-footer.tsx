import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__copy">
          <div className="site-footer__identity">
            <Link className="site-footer__brand" to="/">
              neobrutal-ui
            </Link>
            <span>Open source / MIT</span>
          </div>
          <p>Editable React components for Base UI and shadcn projects.</p>
        </div>

        <nav aria-label="Footer navigation">
          <a href="https://github.com/andongmin94/neobrutal-ui" rel="noreferrer" target="_blank">
            GitHub
          </a>
          <Link to="/docs/credits">Credits</Link>
        </nav>
      </div>
    </footer>
  );
}
