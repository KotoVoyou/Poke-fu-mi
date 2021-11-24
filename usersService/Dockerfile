FROM node:17.1.0

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

CMD ["node", "dist/index.js"]

EXPOSE 5000