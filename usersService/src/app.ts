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
            url: 'http://localhost:5000/player',
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

// // Récupére la liste des matchs
// app.get("/match", (req, res) => {
//     const matchs = db.getMatchs();
//     res.status(200).json(matchs);
// });

// // Créer un nouveau match
// app.put("/match", (req, res) => {
//     const newMatch: Match = req.body
//     const { idP1, idP2 } = newMatch

//     if (db.getMatchs().filter((m) => m.idP1 === idP1 || m.idP2 === idP1).length > 2) {
//         res.status(400).write("Player 1 is playing too many matches");
//         return res.end();
//     }

//     if (db.getMatchs().filter((m) => m.idP1 === idP2 || m.idP2 === idP2).length > 2) {
//         res.status(400).write("Player 2 is playing too many matches");
//         return res.end();
//     }

//     db.addMatch({ ...newMatch, status: "CREATED" });
//     res.status(200).send("OK");
// });

// // Modifie un match ?
// app.post("/match", (req, res) => {
//     res.status(500).send("TODO")
// })

export { app };
