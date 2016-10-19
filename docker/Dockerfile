FROM xappmedia/bst-server:baseline

MAINTAINER John Kelvie

ENV env ${env}

ENV PATH="/opt/node/bin:${PATH}"

EXPOSE 4000

EXPOSE 5000

WORKDIR /opt/bst

RUN echo Test: $CI_BRANCH_ID

RUN echo Test2: ${CI_BRANCH_ID}