export type Location = 'left' | 'center' | 'right' | 'judge' | 'counsel' | 'zoom';

export interface Character {
  name: string;
  animations: string[];
  gender: "male" | "female";
  objection?: string;
  position?: Location; // center by default
}
