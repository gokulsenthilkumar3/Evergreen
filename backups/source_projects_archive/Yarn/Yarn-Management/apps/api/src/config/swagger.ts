import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Yarn Management System API',
        version: '1.0.0',
        description: 'Public API for 3rd party integrations and developer access.',
        contact: {
            name: 'API Support',
            email: 'support@yarnmanagement.com',
        },
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 4000}`,
            description: 'Development Server',
        },
    ],
    components: {
        securitySchemes: {
            ApiKeyAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'X-API-KEY',
            },
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        },
    },
    security: [
        {
            ApiKeyAuth: [],
        },
    ],
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
