export interface LoadHorseInfoParam {
  num: number;
  url: string;
}

export type PastRaceData = string[];

export interface HorseInfo {
  num: number;
  pastRaceDataArray: PastRaceData[];
}

export interface LoadedData {
  horseInfoAll: HorseInfo[];
}
