import fetch from 'node-fetch';

interface EnvVariable {
    key: string;
    value: string;
}

export async function addEnvironmentVariablesToVercel(
    projectId: string, 
    envVariables: EnvVariable[]
) {
    if (!process.env.VERCEL_TOKEN) {
        throw new Error("Vercel token is missing");
    }

    const VERCEL_API_BASE = "https://api.vercel.com";

    try {
        const addEnvPromises = envVariables.map(async (env) => {
            const response = await fetch(`${VERCEL_API_BASE}/v9/projects/${projectId}/env`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    key: env.key,
                    value: env.value,
                    type: 'encrypted',
                    target: ['production', 'preview', 'development']  // Add this line
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add env variable ${env.key}: ${errorText}`);
            }

            return response.json();
        });

        const results = await Promise.all(addEnvPromises);
        
        return {
            success: true,
            message: 'Environment variables added successfully',
            details: results
        };
    } catch (error) {
        console.error('Error adding environment variables:', error);
        throw error;
    }
}
