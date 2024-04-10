# Products microservice

##

1. Clone repo
2. Install deps
3. Create .env file based on .env.template
4. Run prisma migrations `npx prisma migrate dev`
5. Levantar el servidor NATS
```
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
6. Run `npm run start:dev`