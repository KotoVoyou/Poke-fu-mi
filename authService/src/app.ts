import express from "express";
import * as routes from './routes'

const app = express();
app.use(
    express.json({
        limit: "50mb",
        verify(req: any, res, buf, encoding) {
            req.rawBody = buf;
        },
    })
);

routes.register(app);

export { app };
