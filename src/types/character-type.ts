import { Location } from "../engines/objection-godot-xml-engine";

export interface Character {
  name: string;
  animations: string[];
  gender: "male" | "female";
  objection?: string;
  position?: Location; // center by default
}
