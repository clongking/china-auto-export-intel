import { getIntel } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getIntel();
    return Response.json(data, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "情报读取失败" },
      { status: 500 },
    );
  }
}
