import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

interface DeploymentConfig {
  name: string;
  image: string;
  replicas?: number;
  namespace?: string;
  storeId?: string;
}

const ARVAN_API_BASE = 'https://napi.arvancloud.ir/caas/v2/zones/ir-thr-ba1';

export async function createDeployment(config: DeploymentConfig): Promise<{
  message: string;
  config?: { host: string };
}> {
  const namespace = config.namespace || 'complex';

  // Validate required fields
  if (!config.name || !config.image) {
    return { message: 'Name and image are required fields' };
  }

  // Read YAML template
  const yamlPath = path.join(process.cwd(), 'mamad.yaml');
  let yamlContent = fs.readFileSync(yamlPath, 'utf8');

  // Replace placeholders in the template
  yamlContent = yamlContent
    .replace(/{name-of-the-deployment}/g, config.name)
    .replace(/username\/image:version/g, config.image)
    .replace(/replicas: 2/g, `replicas: ${config.replicas || 2}`)
    .replace(
      /{name-of-the-deployment}-5aab14d2ac-complex.apps.ir-central1.arvancaas.ir/g,
      `${config.name}-5aab14d2ac-complex.apps.ir-central1.arvancaas.ir`
    )
    .replace(/name-of-the-deployment-free-ingress/g, `${config.name}-ingress`);

  // Parse the modified YAML
  const documents = yaml.loadAll(yamlContent) as any[];
  const results = [];
  const errors = [];

  for (const doc of documents) {
    try {
      let endpoint = '';

      // Inject STORE_ID env var into Deployment
      if (doc.kind === 'Deployment' && config.storeId) {
        const containers = doc?.spec?.template?.spec?.containers;
        if (Array.isArray(containers) && containers.length > 0) {
          containers[0].env = containers[0].env || [];
          containers[0].env.push({
            name: 'STORE_ID',
            value: config.storeId,
          });
        }
      }

      // Determine API endpoint based on resource kind
      switch (doc.kind) {
        case 'Deployment':
          endpoint = `${ARVAN_API_BASE}/apis/apps/v1/namespaces/${namespace}/deployments`;
          break;
        case 'Service':
          endpoint = `${ARVAN_API_BASE}/api/v1/namespaces/${namespace}/services`;
          break;
        case 'Ingress':
          endpoint = `${ARVAN_API_BASE}/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;
          break;
        default:
          continue;
      }

      // Send the resource to Arvan
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ARVAN_API_TOKEN}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(doc),
      });

      if (!response.ok) {
        const errorText = await response.text();
        errors.push({ resource: doc.kind, error: errorText, status: response.status });
        console.error(`Error creating ${doc.kind}:`, errorText);
        continue;
      }

      const result = await response.json();
      console.log(result, 'this is result');
      results.push({ resource: doc.kind, result, status: response.status });
    } catch (error) {
      console.error(`Error processing ${doc.kind}:`, error);
      errors.push({
        resource: doc.kind,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    message: errors.length > 0
      ? 'Some resources were not created successfully'
      : 'All resources created successfully',
    config: {
      host: `${config.name}-5aab14d2ac-complex.apps.ir-central1.arvancaas.ir`,
    },
  };
}
