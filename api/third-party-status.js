function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

const PROVIDERS = {
  vercel: { id: 'vercel', name: 'Vercel', endpoint: 'https://www.vercel-status.com/api/v2/status.json', type: 'statuspage' },
  netlify: { id: 'netlify', name: 'Netlify', endpoint: 'https://www.netlifystatus.com/api/v2/status.json', type: 'statuspage' },
  cloudflare: { id: 'cloudflare', name: 'Cloudflare DNS', endpoint: 'https://www.cloudflarestatus.com/api/v2/status.json', type: 'statuspage' },
  aws: { id: 'aws', name: 'AWS', endpoint: 'https://status.aws.amazon.com/data.json', type: 'aws' },
  gcp: { id: 'gcp', name: 'Google Cloud', endpoint: 'https://status.cloud.google.com/incidents.json', type: 'gcp' },
  github: { id: 'github', name: 'GitHub', endpoint: 'https://www.githubstatus.com/api/v2/status.json', type: 'statuspage' },
};

function mapIndicatorToStatus(indicator) {
  const value = String(indicator || '').toLowerCase();
  if (!value || value === 'none' || value === 'ok' || value === 'operational' || value === '0') return 'operational';
  if (value === 'minor' || value === 'degraded' || value === 'maintenance' || value === '1') return 'degraded';
  if (value === 'major' || value === 'critical' || value === 'down' || value === '2' || value === '3') return 'down';
  return 'degraded';
}

async function fetchProviderStatus(provider) {
  const started = Date.now();
  try {
    const response = await fetch(provider.endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    const latencyMs = Date.now() - started;
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        id: provider.id,
        name: provider.name,
        mainEndpoint: provider.endpoint,
        status: 'down',
        indicator: 'http_error',
        description: `HTTP ${response.status}`,
        httpStatus: response.status,
        latencyMs,
        lastUpdated: null,
      };
    }

    if (provider.type === 'statuspage') {
      const indicator = data?.status?.indicator || 'unknown';
      return {
        id: provider.id,
        name: provider.name,
        mainEndpoint: provider.endpoint,
        status: mapIndicatorToStatus(indicator),
        indicator,
        description: data?.status?.description || 'Status data available',
        httpStatus: response.status,
        latencyMs,
        lastUpdated: data?.page?.updated_at || data?.status?.updated_at || null,
      };
    }

    if (provider.type === 'aws') {
      const services = Array.isArray(data?.archive) ? data.archive : [];
      const hasServiceIssue = services.some((entry) => String(entry?.summary || '').trim().length > 0);
      const indicator = data?.current?.status ?? data?.status ?? (hasServiceIssue ? '1' : '0');
      const description = data?.current?.summary || data?.current?.description || (hasServiceIssue ? 'Service events reported' : 'Service is operating normally');
      return {
        id: provider.id,
        name: provider.name,
        mainEndpoint: provider.endpoint,
        status: mapIndicatorToStatus(indicator),
        indicator: String(indicator ?? ''),
        description,
        httpStatus: response.status,
        latencyMs,
        lastUpdated: data?.current?.date || data?.current?.time || null,
      };
    }

    if (provider.type === 'gcp') {
      const incidents = Array.isArray(data) ? data : [];
      const activeIncidents = incidents.filter((incident) => !incident?.end || String(incident.end).trim() === '');
      const activeCount = activeIncidents.length;
      return {
        id: provider.id,
        name: provider.name,
        mainEndpoint: provider.endpoint,
        status: activeCount === 0 ? 'operational' : 'degraded',
        indicator: activeCount === 0 ? 'none' : 'minor',
        description: activeCount === 0 ? 'No active incidents reported' : `${activeCount} active incident${activeCount > 1 ? 's' : ''} reported`,
        httpStatus: response.status,
        latencyMs,
        lastUpdated: activeIncidents[0]?.modified || incidents[0]?.modified || null,
      };
    }

    return {
      id: provider.id,
      name: provider.name,
      mainEndpoint: provider.endpoint,
      status: 'degraded',
      indicator: 'unknown',
      description: 'Unknown provider format',
      httpStatus: response.status,
      latencyMs,
      lastUpdated: null,
    };
  } catch (error) {
    return {
      id: provider.id,
      name: provider.name,
      mainEndpoint: provider.endpoint,
      status: 'down',
      indicator: 'fetch_error',
      description: error instanceof Error ? error.message : 'Failed to fetch provider status',
      httpStatus: null,
      latencyMs: null,
      lastUpdated: null,
    };
  }
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (req.method !== 'GET') return json(res, 405, { ok: false, message: 'Method not allowed' });

  const requestedProvider = String(req.query?.provider || '').trim().toLowerCase();
  const selectedProviders = requestedProvider
    ? (PROVIDERS[requestedProvider] ? [PROVIDERS[requestedProvider]] : [])
    : Object.values(PROVIDERS);

  if (requestedProvider && selectedProviders.length === 0) {
    return json(res, 400, { ok: false, message: 'Invalid provider' });
  }

  const statuses = await Promise.all(selectedProviders.map(fetchProviderStatus));
  return json(res, 200, {
    ok: true,
    checkedAt: Date.now(),
    providers: statuses,
  });
};
