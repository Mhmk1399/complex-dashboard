interface DeploymentConfig {
  namespace?: string;
  storeId?: string;
}

const ARVAN_API_DNS_BASE = 'https://napi.arvancloud.ir/cdn/4.0/domains';
const ARVAN_MAIN_DOMAIN = 'tomakdigitalagency.ir';
const ARVAN_API_BASE = 'https://napi.arvancloud.ir/caas/v2/zones/ir-thr-ba1';

export async function createIngress(config: DeploymentConfig): Promise<{
  message: string;
  config?: { host: string };
}> {
  const namespace = config.namespace || 'mamad';

  if (!config.storeId) {
    return { message: 'StoreId is required' };
  }

  const subdomain = `${config.storeId}`;
  // FQDN = Fully Qualified Domain Name
  // It’s the complete domain name pointing to a specific host on the internet.
  const fqdn = `${subdomain}.${ARVAN_MAIN_DOMAIN}`;
  // means “the full domain name for this user’s site.”

  try {
    const dnsBody = {
      type: 'CNAME',
      name: subdomain,
      value: { host: ARVAN_MAIN_DOMAIN },
      ttl: 120,
      cloud: true
    };

    const dnsResponse = await fetch(
      `${ARVAN_API_DNS_BASE}/${ARVAN_MAIN_DOMAIN}/dns-records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${process.env.ARVAN_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dnsBody),
      }
    );

    if (!dnsResponse.ok) {
      const errorText = await dnsResponse.text();
      console.error('❌ DNS creation failed:', errorText);
      return { message: 'Failed to create DNS record' };
    }

    const dnsResult = await dnsResponse.json();
    console.log('✅ DNS record created:', dnsResult.data.name);

    await new Promise(res => setTimeout(res, 5000));

    const ingressDoc = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: `${config.storeId}-ingress`,
        namespace: namespace,
      },
      spec: {
        rules: [
          {
            host: fqdn,
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: 'userwebsite-app',
                      port: { number: 80 },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const endpoint = `${ARVAN_API_BASE}/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;

    const ingressResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARVAN_API_TOKEN}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(ingressDoc),
    });

    if (!ingressResponse.ok) {
      const errorText = await ingressResponse.text();
      console.error('❌ Error creating ingress:', errorText);
      return { message: 'Failed to create ingress' };
    }

    const ingressResult = await ingressResponse.json();
    console.log('✅ Ingress created:', ingressResult.metadata.name);

    return {
      message: 'DNS + Ingress created successfully',
      config: {
        host: `https://${fqdn}`,
      },
    };
  } catch (error) {
    console.error('💥 Error in createIngress:', error);
    return { message: 'Unexpected error during setup' };
  }
}
