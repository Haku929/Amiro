import type { Big5Vector, SaveSlotRequest, Slot } from "@/lib/types";

export function isBig5Vector(v: unknown): v is Big5Vector {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.o === "number" &&
    typeof o.c === "number" &&
    typeof o.e === "number" &&
    typeof o.a === "number" &&
    typeof o.n === "number"
  );
}

export function parseSaveSlotBody(body: unknown): SaveSlotRequest | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (!isBig5Vector(b.selfVector) || !isBig5Vector(b.resonanceVector))
    return null;
  if (
    typeof b.personaIcon !== "string" ||
    typeof b.personaSummary !== "string"
  )
    return null;
  return {
    selfVector: b.selfVector,
    resonanceVector: b.resonanceVector,
    personaIcon: b.personaIcon,
    personaSummary: b.personaSummary,
  };
}

export function buildSlot(
  slotIndex: 1 | 2 | 3,
  req: SaveSlotRequest,
  createdAt: string
): Slot {
  return {
    slotIndex,
    selfVector: req.selfVector,
    resonanceVector: req.resonanceVector,
    personaIcon: req.personaIcon,
    personaSummary: req.personaSummary,
    createdAt,
  };
}
