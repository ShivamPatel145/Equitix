import yahooFinance from "yahoo-finance2";
import { DASHBOARD_STOCKS } from "./lib/constants.js"; // Wait, cannot easily import TypeScript file into simple Node script.

const symbols = [
  "RELIANCE.BO", "HDFCBANK.BO", "ICICIBANK.BO", "SBIN.BO", "TCS.BO", 
  "INFY.BO", "HCLTECH.BO", "WIPRO.BO", "BHARTIARTL.BO", "ITC.BO", 
  "HINDUNILVR.BO", "LT.BO", "NTPC.BO", "ONGC.BO", "SUNPHARMA.BO", 
  "CIPLA.BO", "TATAMOTORS.BO", "MARUTI.BO", "M&M.BO"
];

async function run() {
  try {
    const quotes = await yahooFinance.quote(symbols);
    console.log("Success! Got quotes for: ", quotes.map(q => q.symbol));
    const returnedSymbols = new Set(quotes.map(q => q.symbol));
    const missing = symbols.filter(s => !returnedSymbols.has(s));
    console.log("Missing symbols: ", missing);
  } catch (error) {
    console.error("Error fetching: ", error.message);
  }
}

run();
