// Build-time env (prefixed with REACT_APP_) and sensible browser defaults

const envHost = process.env.REACT_APP_API_HOST;
const envPort = process.env.REACT_APP_API_PORT;
const envProtocol = process.env.REACT_APP_API_PROTOCOL;

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
    return window.location?.port || '';
  }
  return '';
}

const protocol = (envProtocol || getDefaultProtocol()).replace(':', '');
const host = envHost || getDefaultHost();
const port = envPort ?? getDefaultPort();

export const API_BASE_URL = `${protocol}://${host}${port ? `:${port}` : ''}`;

