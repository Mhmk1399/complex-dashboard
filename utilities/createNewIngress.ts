interface DeploymentConfig {
  namespace?: string;
  storeId?: string;
}

const ARVAN_API_BASE = 'https://napi.arvancloud.ir/caas/v2/zones/ir-thr-ba1';

export async function createIngress(config: DeploymentConfig): Promise<{
  message: string;
  config?: { host: string };
}> {
  const namespace = config.namespace || 'mamad';

  if (!config.storeId) {
    return { message: 'StoreId is required' };
  }

  try {
    const ingressDoc = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'Ingress',
      metadata: {
        name: `${config.storeId}-ingress`,
        namespace: namespace,
      },
      spec: {
        rules: [{
          // host: `${config.storeId}-9ddcd5133c-mamad.apps.ir-central1.arvancaas.ir`,
          host: `${config.storeId}.tomakdigitalagency.ir`,
          http: {
            paths: [{
              path: '/',
              pathType: 'Prefix',
              backend: {
                service: {
                  name: 'userwebsite-app',
                  port: { number: 80 }
                }
              }
            }]
          }
        }]
      }
    };

    const endpoint = `${ARVAN_API_BASE}/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ARVAN_API_TOKEN}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(ingressDoc),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating ingress:', errorText);
      return { message: 'Failed to create ingress' };
    }

    const result = await response.json();
    console.log('Ingress created:', result);

    return {
      message: 'Ingress created successfully',
      config: {
        // host: `https://${config.storeId}-9ddcd5133c-mamad.apps.ir-central1.arvancaas.ir`,
        host: `https://${config.storeId}.tomakdigitalagency.ir`,
      },
    };
  } catch (error) {
    console.error('Error creating ingress:', error);
    return { message: 'Error creating ingress' };
  }
}
