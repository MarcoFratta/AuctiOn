# AuctiOn

AuctiOn is a real-time auction game platform built with a microservices architecture. Players can participate in
strategic auctions where they buy and sell items, aiming to accumulate the most virtual currency by the end of the game.

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)](https://kafka.apache.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

A `live` demo is hosted at:
🌐 **[AuctiOn](https://auctionlinegame.netlify.app/)**

## Documentation

📚 **[View Documentation on GitHub Pages](https://marcofratta.github.io/AuctiOn/)**

## Using the Releases

Each release provides three downloadable assets:

### 1. Frontend Application

- Download `frontend.zip` from the latest release
- Extract the files to a web server or hosting service (like Netlify, Vercel, or GitHub Pages)
- For local testing, you can serve it with a simple HTTP server:
  ```bash
  npx serve -s /path/to/extracted/frontend
  ```

### 2. Documentation

- Download `docs.zip` from the latest release
- Extract and host on a web server, or browse locally by opening `index.html`

### 3. Microservices Deployment

- Download `auction-services.zip` from the latest release
- Extract the package to your server
- Navigate to the extracted directory
- Copy `env.template` to `.env` and configure your environment variables
- Run the services with Docker Compose:
  ```bash
  docker-compose up -d
  ```
- The services will be available at their configured ports (default: API Gateway on port 3000)

For detailed deployment instructions, refer to
the [documentation](https://marcofratta.github.io/AuctiOn/report/deployment).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

