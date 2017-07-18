FROM bespoken/nodejs

MAINTAINER John Kelvie

EXPOSE 5000 443

WORKDIR /opt

RUN mkdir bst-server

WORKDIR /opt/bst-server

COPY bin/ ./bin/

COPY lib/ ./lib/

COPY *.json ./

RUN npm -version

RUN npm install

CMD node bin/bst-server.js start 443 5000