export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem extends MacroNutrients {
  name: string;
  portionSize: string;
  calories: number;
}

export interface AnalysisResult extends MacroNutrients {
  items: FoodItem[];
  totalCalories: number;
  healthTip: string;
  confidenceScore: number; // 0-100
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
