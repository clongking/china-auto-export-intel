import { refreshIntel } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    const data = await refreshIntel({ force: true });
    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "刷新失败" },
      { status: 500 },
    );
  }
}
