export interface TavilyResult {
  title: string;
  url: string;
  content: string;
}

export async function searchReferences(
  query: string
): Promise<TavilyResult[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results: 5,
        search_depth: "basic",
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map(
      (r: Record<string, string>) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })
    );
  } catch {
    return [];
  }
}
