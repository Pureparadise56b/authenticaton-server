FROM node:20-alpine

WORKDIR /app

COPY package*.json .

RUN npm ci --production

COPY . .

RUN ls

EXPOSE 5000

CMD [ "npm", "start" ]