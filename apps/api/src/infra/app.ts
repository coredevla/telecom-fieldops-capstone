import express from "express";
import cors from "cors";
import inventarioRoutes from "./routes/inventario.routes";

const app = express();

// Permite que frontend en otro puerto haga fetch
app.use(cors());

app.use(express.json());
app.use(inventarioRoutes);

export default app;