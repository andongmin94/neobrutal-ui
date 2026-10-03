const GITHUB_STARS_URL = "https://api.github.com/repos/andongmin94/neobrutal-ui";
const CACHE_KEY = "neobrutal-ui-github-stars";
const CACHE_DURATION_MS = 60 * 60 * 1000;

type GitHubStarsCache = {
  count: number;
  fetchedAt: number;
};

let cachedStars: GitHubStarsCache | undefined;
let githubStarsRequest: Promise<number | null> | undefined;

function isStarCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function readStoredStars() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "null");
    if (
      isStarCount(stored?.count) &&
      typeof stored.fetchedAt === "number" &&
      Number.isFinite(stored.fetchedAt) &&
      stored.fetchedAt >= 0 &&
      stored.fetchedAt <= Date.now() &&
      (!cachedStars || stored.fetchedAt > cachedStars.fetchedAt)
    ) {
      cachedStars = { count: stored.count, fetchedAt: stored.fetchedAt };
    }
  } catch {
    // Browsers can block storage; the in-memory cache still works.
  }
}

export function getGitHubStars(): Promise<number | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  readStoredStars();
  const age = cachedStars ? Date.now() - cachedStars.fetchedAt : -1;
  if (cachedStars && age >= 0 && age < CACHE_DURATION_MS) {
    return Promise.resolve(cachedStars.count);
  }

  githubStarsRequest ??= fetch(GITHUB_STARS_URL, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("GitHub stars request failed");

      const payload = await response.json();
      if (!isStarCount(payload?.stargazers_count)) {
        throw new Error("Invalid GitHub star count");
      }

      cachedStars = { count: payload.stargazers_count, fetchedAt: Date.now() };
      try {
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(cachedStars));
      } catch {
        // Keep the successful response in memory if storage is unavailable.
      }
      return cachedStars.count;
    })
    .catch(() => cachedStars?.count ?? null)
    .finally(() => {
      githubStarsRequest = undefined;
    });

  return githubStarsRequest;
}
