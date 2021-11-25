import express from "express";
import * as routes from './routes'

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for Poke-fu-mi',
        version: '1.0.0',
        description:
            'This is a REST API application made with Express. It is designed to allow playing Poke-fu-mi, a Rock-paper-scissors game '
        + 'which uses Pokemon cards. The API allows to manage player accounts and matchs.'
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Player accounts, including names, scores etc.',
        },
        {
            url: 'http://localhost:5000/matchs',
            description: 'Matchs created between two players.',
        }
    ],
};

const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['**/*.ts'],
};
const swaggerSpec = swaggerJSDoc(options);


app.use(
    express.json({
        limit: "50mb",
        verify(req: any, res, buf, encoding) {
            req.rawBody = buf;
        },
    })
);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

routes.register(app);

export { app };
