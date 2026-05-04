export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  );
}

export function inviteUrl(slug: string): string {
  return `${siteUrl()}/friend/${slug}`;
}
