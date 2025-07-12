import { NextRequest, NextResponse } from "next/server";
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// sample request:

// {
//   "name": "gholam",
//   "image": "wolfix1245/dashboard-complex:1.1",
//   "replicas": 1,
//   "namespace": "complex"
// }

interface DeploymentConfig {
  name: string;
  image: string;
  replicas?: number;
  namespace?: string;
}

const ARVAN_API_BASE = 'https://napi.arvancloud.ir/caas/v2/zones/ir-thr-ba1';

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentConfig = await request.json();
    const namespace = body.namespace || 'complex';
    
    // Validate required fields
    if (!body.name || !body.image) {
      return NextResponse.json(
        { error: "Name and image are required fields" },
        { status: 400 }
      );
    }

    // Read the YAML template
    const yamlPath = path.join(process.cwd(), 'app/api/test/mamad.yaml');
    let yamlContent = fs.readFileSync(yamlPath, 'utf8');

    // Replace all placeholders
    yamlContent = yamlContent
      .replace(/{name-of-the-deployment}/g, body.name)
      .replace(/username\/image:version/g, body.image)
      .replace(/replicas: 2/g, `replicas: ${body.replicas || 2}`)
      .replace(
        /{name-of-the-deployment}-5aab14d2ac-complex.apps.ir-central1.arvancaas.ir/g,
        `${body.name}.apps.ir-central1.arvancaas.ir`
      )
      .replace(/name-of-the-deployment-free-ingress/g, `${body.name}-ingress`);

    // Parse YAML to get individual documents
    const documents = yaml.loadAll(yamlContent) as any[];
    
    // Create resources in order: Deployment -> Service -> Ingress
    const results = [];
    const errors = [];

    for (const doc of documents) {
      try {
        let endpoint = '';

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
          errors.push({
            resource: doc.kind,
            error: errorText,
            status: response.status
          });
          console.error(`Error creating ${doc.kind}:`, errorText);
          continue;
        }

        const result = await response.json();
        results.push({
          resource: doc.kind,
          result: result,
          status: response.status
        });

      } catch (error) {
        console.error(`Error processing ${doc.kind}:`, error);
        errors.push({
          resource: doc.kind,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          message: "Some resources were not created successfully",
          created: results,
          errors: errors,
          config: {
            name: body.name,
            image: body.image,
            replicas: body.replicas || 2,
            host: `${body.name}.apps.ir-central1.arvancaas.ir`,
            namespace: namespace
          }
        },
        { status: 207 }
      );
    }

    return NextResponse.json({
      message: "All resources created successfully",
      results: results,
      config: {
        name: body.name,
        image: body.image,
        replicas: body.replicas || 2,
        host: `${body.name}.apps.ir-central1.arvancaas.ir`,
        namespace: namespace
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}