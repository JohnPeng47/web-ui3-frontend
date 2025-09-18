type MockAgentEvent =
  | { type: "accept"; id: string }
  | { type: "deny"; id: string };

type Listener = (event: MockAgentEvent) => void;

const listeners = new Set<Listener>();

export function subscribeMockAgents(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function acceptMockAgent(id: string): void {
  const event: MockAgentEvent = { type: "accept", id };
  listeners.forEach((l) => l(event));
}

export function denyMockAgent(id: string): void {
  const event: MockAgentEvent = { type: "deny", id };
  listeners.forEach((l) => l(event));
}


