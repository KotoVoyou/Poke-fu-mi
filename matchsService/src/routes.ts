import * as express from 'express'
import * as MatchController from './matchController'

export const register = (app: express.Application) => {
    // Récupérer des matchs
    // Query param player pour récupérer les matchs d'un joueur
    // Query param current pour récupérer uniquement les matchs en cours

    /**
    * @swagger
    * /:
    *   get:
    *     summary: Retrieve a list of matchs.
    *     description: |
    *       Retrieve a list of all registered matchs between players.
    *       Two query params can optionally be used to retrieve:
    *       - matchs from a specific player,
    *       - matchs currently being played.
    *     parameters:
    *       - in: query
    *         name: player
    *         description: The unique ID of the player whose match history is wanted.
    *         example: 12345
    *         schema:
    *           type: integer
    *       - in: query
    *         name: current
    *         description: Set to true to get matchs that are not finished yet.
    *         schema:
    *           type: boolean
    *     responses:
    *       200:
    *         description: A list of matchs. See query params for more details.
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                 type: object
    *                 properties:
    *                  id:
    *                    type: integer
    *                    description: The match ID.
    *                    example: 1
    *                  idP1:
    *                    type: integer
    *                    description: The ID of the Player 1 of the match.
    *                    example: 1
    *                  idP2:
    *                    type: integer
    *                    description: The ID of the Player 2 of the match.
    *                    example: 2
    *                  status:
    *                    type: string
    *                    description: A string describing the state of the match (created, finished etc.).
    *                    example: CREATED
    */
    app.get("/matchs", (req, res) => {    
        if (req.query.player) {
            let current = req.query.current === "true" ? true : false
            return res.status(200).json(
                MatchController.getCurrentMatchPlayer(parseInt(req.query.player.toString()), current)
            )
        }

        res.status(200).json(MatchController.listMatchs())
    })

    // Create match
    /**
    * @swagger
    * /:
    *   post:
    *     summary: Create a new match.
    *     description: |
    *       Create and register a new match between two players.
    *       Match creation fails if either of the players already has 3 or more active matches.
    *     requestBody:
    *       description: IDs of the players taking part in the match.
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             properties:
    *                idP1:
    *                  type: integer
    *                  description: The ID of the Player 1 of the match.
    *                  example: 1
    *                idP2:
    *                  type: integer
    *                  description: The ID of the Player 2 of the match.
    *                  example: 2
    *     responses:
    *       200:
    *         description: A list of all registered matchs, including the new one.
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                 type: object
    *                 properties:
    *                  id:
    *                    type: integer
    *                    description: The match ID.
    *                    example: 1
    *                  idP1:
    *                    type: integer
    *                    description: The ID of the Player 1 of the match.
    *                    example: 1
    *                  idP2:
    *                    type: integer
    *                    description: The ID of the Player 2 of the match.
    *                    example: 2
    *                  status:
    *                    type: string
    *                    description: A string describing the state of the match (created, finished etc.).
    *                    example: CREATED
    *       400:
    *         description: Match creation failed. One of the player already has 3 or more active matchs.
    */
    app.post("/matchs", (req, res) => {
        const newMatch: Match = req.body
        const { idP1, idP2 } = newMatch
    
        if (MatchController.getCurrentMatchPlayer(idP1, true).length > 2) {
            return res.status(400).send("Player 1 is playing too many matches");
        }
    
        if (MatchController.getCurrentMatchPlayer(idP2, true).length > 2) {
            return res.status(400).send("Player 2 is playing too many matches");
        }
    
        res.status(200).send(MatchController.createMatch(newMatch))
    });

    /**
    * @swagger
    * /{id_match}:
    *   get:
    *     summary: Retrieve a single match.
    *     description: |
    *       Retrieve a match by its ID from the list of registered matchs.
    *     parameters:
    *       - in: path
    *         name: id_match
    *         description: The unique ID of the searched match.
    *         example: 12345
    *         schema:
    *           type: integer
    *     responses:
    *       200:
    *         description: A single match, whose ID matches the path param.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                id:
    *                  type: integer
    *                  description: The match ID.
    *                  example: 1
    *                idP1:
    *                  type: integer
    *                  description: The ID of the Player 1 of the match.
    *                  example: 1
    *                idP2:
    *                  type: integer
    *                  description: The ID of the Player 2 of the match.
    *                  example: 2
    *                status:
    *                  type: string
    *                  description: A string describing the state of the match (created, finished etc.).
    *                  example: CREATED
    *       404:
    *         description: There is not match with the provided ID.
    */
    app.get('/matchs/:id_match', (req, res) => {
        const match = MatchController.getMatchById(parseInt(req.params.id_match))

        if (match) {
            return res.status(200).json(match)
        }

        return res.status(404).send("No match with this id")
    })

    // Update match
    /**
    * @swagger
    * /{id_match}:
    *   put:
    *     summary: Update a match.
    *     description: |
    *       Update the informations of an existing match.
    *       It is possible to edit the second player's ID, or the status of the match (or both).
    *     parameters:
    *       - in: path
    *         name: id_match
    *         description: The unique ID of the searched match.
    *         example: 12345
    *         schema:
    *           type: integer
    */
    app.put("/matchs/:id_match", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const update: UpdateMatch = req.body
        res.status(200).send(MatchController.updateMatch(idMatch, update))
    })

    /**
    * @swagger
    * /{id_match}/round:
    *   get:
    *     summary: Get rounds from a match.
    *     description: |
    *       Get informations about all rounds that have already been played in the specified match.
    *     parameters:
    *       - in: path
    *         name: id_match
    *         description: The unique ID of the searched match.
    *         example: 12345
    *         schema:
    *           type: integer
    *     responses:
    *       200:
    *         description: A list of round objects describing the rounds played.
    *         content:
    *           application/json:
    *             schema:
    *               type: array
    *               items:
    *                 type: object
    *                 properties:
    *                  matchId:
    *                    type: integer
    *                    description: The ID of the corresponding match.
    *                    example: 1
    *                  roundNumber:
    *                    type: integer
    *                    description: The round number, between 1 and 6.
    *                    example: 3
    *                  pokemonP1:
    *                    type: integer
    *                    description: The Pokemon used by Player 1 this round.
    *                  pokemonP2:
    *                    type: integer
    *                    description: The Pokemon used by Player 2 this round.
    *                  status:
    *                    type: string
    *                    description: The status of the round, either "STARTED" or "TERMINATED".
    *                    example: "STARTED"
    *                  winner:
    *                    type: integer
    *                    description: The winner of the round, either 1 for Player 1, or 2 for Player 2.
    *       500:
    *         description: Unknown error.
    */
    app.get("/matchs/:id_match/round", (req, res) => {
        const idMatch = parseInt(req.params.id_match)

        MatchController.getRounds(idMatch)
            .then(rounds => res.status(200).json(rounds))
            .catch(err => res.status(500).send(err.message || "Error"))
    })

    app.put("/matchs/:id_match/round", (req, res) => {
        const idMatch = parseInt(req.params.id_match)
        const round: RoundPlayer = req.body

        MatchController.getRounds(idMatch)
            .then(rounds => res.status(200).json(round))
            .catch(err => res.status(500).send(err.message || "Error"))

        // get all rounds
        // valid rounds
        // Check if created
        // Create
        // or update
    })
}