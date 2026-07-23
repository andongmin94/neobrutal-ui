<script setup lang="ts">
import { withBase } from "vitepress";
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__inner">
      <div class="site-footer__copy">
        <div class="site-footer__identity">
          <a class="site-footer__brand" :href="withBase('/')">neobrutal-ui</a>
          <span>Open source / MIT</span>
        </div>
        <p>Editable React components for Base UI and shadcn projects.</p>
      </div>

      <nav aria-label="Footer navigation">
        <a href="https://github.com/andongmin94/neobrutal-ui" rel="noreferrer" target="_blank">
          GitHub
        </a>
        <a :href="withBase('/docs/credits')">Credits</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  flex: none;
  border-top: var(--border-width) solid var(--border);
  background: var(--background);
  color: var(--foreground);
}

.site-footer__inner {
  display: flex;
  width: min(100%, 1720px);
  min-height: 72px;
  margin: 0 auto;
  padding: 14px 24px;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.site-footer__copy {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: clamp(24px, 4vw, 56px);
}

.site-footer__identity {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 12px;
}

.site-footer__brand {
  color: inherit;
  font-size: 17px;
  font-weight: 900;
  text-decoration: none;
}

.site-footer__identity > span {
  padding-left: 12px;
  border-left: 1px solid currentcolor;
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.35;
  text-transform: uppercase;
}

.site-footer p {
  margin: 0;
  color: var(--foreground-muted);
  font-size: 13px;
  line-height: 1.5;
}

.site-footer nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.site-footer nav a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  border-bottom: 2px solid transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
  text-decoration: none;
}

.site-footer nav a:hover,
.site-footer nav a:focus-visible {
  border-bottom-color: currentcolor;
}

@media (max-width: 760px) {
  .site-footer__copy {
    display: grid;
    gap: 0;
  }

  .site-footer p {
    margin-top: -4px;
  }
}

@media (max-width: 600px) {
  .site-footer__inner {
    display: grid;
    padding: 18px 17px;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .site-footer nav {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 8px 18px;
  }
}
</style>
