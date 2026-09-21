const GITHUB_REPOSITORY_API_URL = "https://api.github.com/repos/andongmin94/neobrutal-ui";

export async function loader() {
  try {
    const response = await fetch(GITHUB_REPOSITORY_API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "neobrutal-ui-build",
      },
    });

    if (!response.ok) return Response.json({ count: null });

    const payload = await response.json();
    const count = typeof payload.stargazers_count === "number" ? payload.stargazers_count : null;

    return Response.json({ count });
  } catch {
    return Response.json({ count: null });
  }
}
