import mockData from "../../data/mock-worldcup.json";
import { WorldCupData } from "../footballData";

export function getMockData(): WorldCupData {
  return {
    ...(mockData as any),
    source: "mock-worldcup.json",
    isMock: true,
    isFallback: true,
    errorMessage: "football-data.org 暫時無法取得 2026 世界盃資料，已切換為備援資料"
  } as WorldCupData;
}
