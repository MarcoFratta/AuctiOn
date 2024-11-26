import {OpenApiGeneratorV31, OpenAPIRegistry} from "@asteasolutions/zod-to-openapi";
import {UserID, UserSchema} from "../src/schemas/User";

export const registry = new OpenAPIRegistry();

export function generateOpenAPI() {
    const config = {
        openapi: '3.1.0',
        info: {
            version: '1.0.0',
            title: 'User service',
            description: 'User service API',
        }
    }; // your config comes here
    registry.register("user", UserSchema);
    registry.register("userId", UserID);
    return new OpenApiGeneratorV31(registry.definitions).generateDocument(config);
}