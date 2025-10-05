interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
}

const reportWebVitals = async (
  onPerfEntry?: (metric: WebVitalsMetric) => void
): Promise<void> => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    const vitals = await import("web-vitals");
    const { getCLS, getFID, getFCP, getLCP, getTTFB } = vitals as any;

    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getFCP(onPerfEntry);
    getLCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
