<<<<<<< HEAD
import app from './App'
import { config } from './configs/config'

const port = config.port

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`)
})
=======
import app from './App';
import { config } from './configs/config';

const port = config.port;

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
>>>>>>> c774751 (chore: fix project structure bug)
