import { BuddyPersona } from "./buddy";
import { CoachPersona } from "./coach";

export { CoachPersona } from "./coach";
export { BuddyPersona } from "./buddy";

export const personas = {
  coach: CoachPersona,
  buddy: BuddyPersona
};

export type PersonaType = "coach" | "buddy";
