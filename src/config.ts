// Runtime config loaded from /config.json

export type RuntimeConfig = {
  apiProtocol?: string;
  apiHost?: string;
  apiPort?: string | number;
};

let runtimeConfig: RuntimeConfig | undefined;

export async function loadRuntimeConfig(): Promise<void> {
  if (runtimeConfig) return;
  try {
    const res = await fetch('/config.json', { cache: 'no-store' as const });
    if (!res.ok) throw new Error(`Failed to load config.json (${res.status})`);
    const json = (await res.json()) as RuntimeConfig;
    runtimeConfig = json;
  } catch (error) {
    // As a fallback, use window location to build API base URL
    runtimeConfig = {};
    // Re-throw so callers know config failed to load
    throw error;
  }
}

function getDefaultProtocol() {
  if (typeof window !== 'undefined' && window.location?.protocol) {
    return window.location.protocol.replace(':', '');
  }
  return 'http';
}

function getDefaultHost() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
}

function getDefaultPort() {
  if (typeof window !== 'undefined') {
    return 8000;
  }
  return '';
}

export function getApiBaseUrl(): string {
  const protocol = (runtimeConfig?.apiProtocol || getDefaultProtocol()).replace(':', '');
  const host = runtimeConfig?.apiHost || getDefaultHost();
  const port = runtimeConfig?.apiPort !== undefined ? String(runtimeConfig.apiPort) : getDefaultPort();
  return `${protocol}://${host}${port ? `:${port}` : ''}`;
}

