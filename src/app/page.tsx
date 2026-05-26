export default function Home() {
  return (
    <>
      {/* Ambient background blobs */}
      <div className="ambient-wrapper" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="page">
        {/* ── Navbar ── */}
        <header>
          <nav className="navbar" aria-label="Main navigation">
            <div className="nav-logo">rap<span style={{ fontWeight: 300 }}>cicd</span></div>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pipeline">Pipeline</a></li>
              <li>
                <a
                  id="nav-github-link"
                  href="https://github.com/rfxfxfx/rapcicd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-badge"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* ── Hero ── */}
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <div className="hero-pill">
              <span className="hero-pill-dot" aria-hidden="true" />
              Production-Ready CI/CD Pipeline
            </div>

            <h1 id="hero-title" className="hero-title">
              Ship faster with{" "}
              <span className="gradient-text">Next.js&nbsp;&amp;&nbsp;Firebase</span>
            </h1>

            <p className="hero-subtitle">
              A modern starter wired with GitHub Actions CI/CD and Firebase Hosting.
              Push code, trigger the pipeline, and see your app live — automatically.
            </p>

            <div className="hero-actions">
              <a
                id="hero-cta-github"
                href="https://github.com/rfxfxfx/rapcicd"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                View on GitHub
              </a>
              <a
                id="hero-cta-firebase"
                href="https://console.firebase.google.com/project/rapcicd-ac398"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M5.91 23.5L9.53 6.14a.5.5 0 01.96-.06l3.3 8.02L16.5 9a.5.5 0 01.94.02l2.2 6.18L23.5 4.5a.5.5 0 01.93.18l2.66 18.82a.5.5 0 01-.24.5L16 29.5 5.15 24a.5.5 0 01-.24-.5z" fill="#FFA000"/>
                  <path d="M16 29.5L26.85 24l-2.66-18.82a.5.5 0 00-.93-.18L19.64 15.2 17.44 9a.5.5 0 00-.94-.02l-2.71 5.1-3.3-8.02a.5.5 0 00-.96.06L5.91 23.5 16 29.5z" fill="#F57C00" opacity=".6"/>
                </svg>
                Firebase Console
              </a>
            </div>
          </section>

          {/* ── Tech stack strip ── */}
          <div className="stack-strip" role="list" aria-label="Technology stack">
            {[
              { label: "Next.js 14", emoji: "⚡" },
              { label: "TypeScript", emoji: "🔷" },
              { label: "Firebase Hosting", emoji: "🔥" },
              { label: "GitHub Actions", emoji: "🤖" },
              { label: "Static Export", emoji: "📦" },
              { label: "App Router", emoji: "🗂️" },
            ].map((tag) => (
              <span key={tag.label} className="stack-tag" role="listitem">
                <span aria-hidden="true">{tag.emoji}</span>
                {tag.label}
              </span>
            ))}
          </div>

          {/* ── Features ── */}
          <section id="features" className="features" aria-labelledby="features-title">
            <div className="features-heading">
              <h2 id="features-title">
                Everything you need to{" "}
                <span className="gradient-text">ship</span>
              </h2>
              <p>A complete, opinionated setup so you can focus on building features, not infrastructure.</p>
            </div>

            <div className="features-grid">
              {[
                {
                  icon: "⚡",
                  iconClass: "feature-icon-violet",
                  title: "Next.js 14 App Router",
                  desc: "Built on the latest Next.js with App Router, TypeScript, and server components. Static export ready for Firebase Hosting.",
                },
                {
                  icon: "🔥",
                  iconClass: "feature-icon-amber",
                  title: "Firebase Hosting",
                  desc: "Globally distributed CDN, SSL by default, custom domains, and deploy previews. Your app served fast, everywhere.",
                },
                {
                  icon: "🤖",
                  iconClass: "feature-icon-cyan",
                  title: "GitHub Actions CI/CD",
                  desc: "Push to main → install → build → deploy. Fully automated pipeline with status checks on every commit.",
                },
                {
                  icon: "🔷",
                  iconClass: "feature-icon-blue",
                  title: "TypeScript First",
                  desc: "Strict TypeScript configuration out of the box. Catch bugs before they reach production.",
                },
                {
                  icon: "🔒",
                  iconClass: "feature-icon-green",
                  title: "Secure by Default",
                  desc: "Firebase service account credentials stored as GitHub Secrets — never committed to source control.",
                },
                {
                  icon: "🎨",
                  iconClass: "feature-icon-pink",
                  title: "Premium Design System",
                  desc: "Dark mode, gradient text, glassmorphism cards, ambient animations, and responsive layout included.",
                },
              ].map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className={`feature-icon ${feature.iconClass}`} aria-hidden="true">
                    {feature.icon}
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── Pipeline ── */}
          <section id="pipeline" className="pipeline" aria-labelledby="pipeline-title">
            <h2 id="pipeline-title">
              How the <span className="gradient-text">pipeline</span> works
            </h2>
            <ol className="pipeline-steps">
              {[
                {
                  n: "01",
                  title: "Push to main",
                  desc: "A git push to the main branch triggers the GitHub Actions workflow automatically.",
                },
                {
                  n: "02",
                  title: "Install dependencies",
                  desc: "The runner checks out your code and runs npm ci for a clean, reproducible install.",
                },
                {
                  n: "03",
                  title: "Build static export",
                  desc: "next build generates the optimised static site in the out/ directory, ready for hosting.",
                },
                {
                  n: "04",
                  title: "Deploy to Firebase",
                  desc: "FirebaseExtended/action-hosting-deploy uploads the out/ directory to Firebase Hosting using your service account.",
                },
                {
                  n: "05",
                  title: "Live on the CDN",
                  desc: "Your app is served globally via Firebase's CDN with automatic SSL and your custom domain.",
                },
              ].map((step) => (
                <li key={step.n} className="pipeline-step">
                  <div className="step-number" aria-hidden="true">{step.n}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer className="footer">
          <p className="footer-left">
            Built with <span>rapcicd</span> · Next.js + Firebase Hosting
          </p>
          <nav className="footer-right" aria-label="Footer links">
            <a
              id="footer-github"
              href="https://github.com/rfxfxfx/rapcicd"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              id="footer-firebase"
              href="https://console.firebase.google.com/project/rapcicd-ac398"
              target="_blank"
              rel="noopener noreferrer"
            >
              Firebase
            </a>
          </nav>
        </footer>
      </div>
    </>
  );
}
