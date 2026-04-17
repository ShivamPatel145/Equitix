"use client";
import { useEffect, useRef } from "react";

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const configString = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.width = "100%";
    widgetContainer.style.height = `${height}px`;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptUrl;
    script.async = true;
    script.innerHTML = configString;

    container.appendChild(widgetContainer);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [scriptUrl, configString, height]);

  return containerRef;
};
export default useTradingViewWidget;
