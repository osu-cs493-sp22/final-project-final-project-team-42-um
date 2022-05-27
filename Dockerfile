FROM node:16
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE ${PORT}
CMD [ "npm", "start" ]
