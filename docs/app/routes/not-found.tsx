import { Link } from "react-router";

export default function NotFound() {
  return (
    <main className="special-main" id="main-content" tabIndex={-1}>
      <div className="directory-empty">
        <span className="eyebrow">404 / Not found</span>
        <h1>This page is missing</h1>
        <p>The route does not match a document or component preview.</p>
        <Link className="pressable" to="/">
          Return to the directory
        </Link>
      </div>
    </main>
  );
}
