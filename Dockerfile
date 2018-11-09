FROM node:8-slim

ENV VERSION 0.1.3

RUN apt-get update && apt-get install -yq libgconf-2-4

RUN apt-get update && apt-get install -y wget --no-install-recommends \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable ttf-freefont --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get purge --auto-remove -y curl \
    && rm -rf /src/*.deb

RUN apt-get update && apt-get install -y curl

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /sbin/dumb-init
RUN chmod +x /sbin/dumb-init

WORKDIR /app
COPY . .
RUN ["yarn", "install"]

EXPOSE 8025
EXPOSE 8085

ENTRYPOINT ["dumb-init", "--"]
CMD ["yarn", "start"]
