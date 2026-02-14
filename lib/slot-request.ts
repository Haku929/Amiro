import type { Big5Vector, ChatMessage, SaveSlotRequest, Slot, SlotConversation } from "@/lib/types";

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

function isValidMessages(messages: unknown): messages is ChatMessage[] {
  if (!Array.isArray(messages)) return false;
  return messages.every(
    (m) =>
      m != null &&
      typeof m === "object" &&
      ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "model") &&
      typeof (m as ChatMessage).content === "string"
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
  const conversation =
    b.conversation === undefined
      ? undefined
      : typeof b.conversation === "object" &&
        b.conversation !== null &&
        isValidMessages((b.conversation as Record<string, unknown>).messages)
      ? { messages: (b.conversation as { messages: ChatMessage[] }).messages }
      : undefined;
  return {
    selfVector: b.selfVector,
    resonanceVector: b.resonanceVector,
    personaIcon: b.personaIcon,
    personaSummary: b.personaSummary,
    ...(conversation !== undefined && { conversation }),
  };
}

export function buildSlot(
  slotIndex: 1 | 2 | 3,
  req: SaveSlotRequest,
  createdAt: string,
  conversation?: SlotConversation
): Slot {
  return {
    slotIndex,
    selfVector: req.selfVector,
    resonanceVector: req.resonanceVector,
    personaIcon: req.personaIcon,
    personaSummary: req.personaSummary,
    createdAt,
    ...(conversation !== undefined && { conversation }),
  };
}
