import app from "./App";
import {config} from "./configs/config";

const port = config.port;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});