import { NextResponse } from "next/server";
import { fetchLiveStockData } from "@/lib/yahoo-finance";

// Cache for 60 seconds to avoid hitting rate limits too frequently
export const revalidate = 60;

export async function GET() {
  try {
    const liveData = await fetchLiveStockData();
    return NextResponse.json({ success: true, data: liveData });
  } catch (error) {
    console.error("Failed to fetch live stock data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch live stock data" },
      { status: 500 }
    );
  }
}
