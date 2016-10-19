FROM xappmedia/bst-server:baseline

MAINTAINER John Kelvie

ENV env ${env}

ENV PATH="/opt/node/bin:${PATH}"

EXPOSE 4000

EXPOSE 5000

WORKDIR /opt/bst

RUN git pull

RUN npm install

RUN node node_modules/typings/dist/bin.js install

RUN tsc

CMD node bin/bst-server.js start 4000 5000