// This file provides API functions for fetching news data from the backend.

export async function fetchFeaturedNews() {
  // Replace the URL below with your actual API endpoint for featured news
  const res = await fetch("http://127.0.0.1:8000/news/todays_news");
  if (!res.ok) throw new Error("Failed to fetch featured news");
  return res.json();
}

// Fetch top personalized news with Bearer idToken
type FetchPersonalisedNewsParams = { idToken: string };

export async function fetchTopPersonalisedNews({
  idToken,
}: FetchPersonalisedNewsParams) {
  const res = await fetch("http://localhost:8000/news/top_personalised_news", {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch personalized news");
  return res.json();
}
