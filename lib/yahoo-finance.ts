import yahooFinance from "yahoo-finance2";
import { DASHBOARD_STOCKS, DashboardStock } from "./constants";

const getYahooSymbol = (symbol: string, exchange: "BSE" | "NSE") => {
  return exchange === "BSE" ? `${symbol}.BO` : `${symbol}.NS`;
};

export const fetchLiveStockData = async (): Promise<DashboardStock[]> => {
  const symbols = DASHBOARD_STOCKS.map((stock) =>
    getYahooSymbol(stock.symbol, stock.exchange),
  );

  try {
    const quotes = await yahooFinance.quote(symbols);
    
    // Map quotes back to DASHBOARD_STOCKS format
    const quoteMap = new Map(quotes.map(q => [q.symbol, q]));

    return DASHBOARD_STOCKS.map((stock) => {
      const yahooSymbol = getYahooSymbol(stock.symbol, stock.exchange);
      const liveData = quoteMap.get(yahooSymbol);

      if (!liveData) return stock; // Fallback to mock data if not found

      const price = liveData.regularMarketPrice ?? stock.price;
      const previousClose = liveData.regularMarketPreviousClose ?? stock.price;
      const changePercent = liveData.regularMarketChangePercent ?? stock.changePercent;
      
      const marketCapValue = liveData.marketCap ? liveData.marketCap / 1e12 : stock.marketCapValue;
      const marketCapLabel = liveData.marketCap 
        ? `INR ${marketCapValue.toFixed(2)}T` 
        : stock.marketCapLabel;

      return {
        ...stock,
        price,
        changePercent,
        marketCapValue,
        marketCapLabel,
        peRatio: liveData.trailingPE ?? stock.peRatio,
      };
    });
  } catch (error) {
    console.error("Error fetching live stock data:", error);
    return DASHBOARD_STOCKS; // Fallback on error
  }
};
