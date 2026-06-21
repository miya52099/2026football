import mockData from "../../../data/mock-worldcup.json";
import { WorldCupData } from "../../types";

export function getMockData(): WorldCupData {
  return {
    ...(mockData as WorldCupData),
    source: "mock-worldcup.json",
    isMock: true,
    isFallback: true,
    errorMessage: "football-data.org 暫時無法取得 2026 世界盃資料，已切換為備援資料"
  };
}
