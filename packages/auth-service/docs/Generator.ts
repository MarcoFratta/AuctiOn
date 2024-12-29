import {
    OpenApiGeneratorV31,
    OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'

export const registry = new OpenAPIRegistry()

export function generateOpenAPI() {
    const config = {
        openapi: '3.1.0',
        info: {
            version: '1.0.0',
            title: 'Auth service',
            description: 'Auth service API',
        },
    } // your config comes here

    return new OpenApiGeneratorV31(registry.definitions).generateDocument(
        config
    )
}
