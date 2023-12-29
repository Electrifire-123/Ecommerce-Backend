FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENV NEW_RELIC_APP_NAME=CEQ-PRODUCT-APPLICATION

ENV NEW_RELIC_LICENSE_KEY=306fbf27d1aedc5151b8035e9d50cbbeFFFFNRAL

EXPOSE 7001

# CMD [ "node", "index.js" ]

CMD [ "node", "-r", "newrelic",  "index.js" ]