FROM node:17.1.0

WORKDIR /usr/src/app

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "start"]

EXPOSE 5000