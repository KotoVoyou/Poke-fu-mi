CREATE TABLE IF NOT EXISTS rounds (
    matchId INTEGER NOT NULL,
    roundNumber INTEGER NOT NULL,
    pokemonP1 INTEGER,
    pokemonP2 INTEGER,
    status TEXT NOT NULL DEFAULT "STARTED",
    winner INTEGER,
    PRIMARY KEY (matchId, roundNumber),
    FOREIGN KEY (matchId) REFERENCES matchs(id) ON DELETE CASCADE
)