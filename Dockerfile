FROM mhart/alpine-node:12

RUN mkdir -p /usr/crawler

RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
        chromium \
        harfbuzz \
        "freetype>2.8" \
        ttf-freefont \
        nss

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ADD package.json /usr/crawler
ADD package-lock.json /usr/crawler

WORKDIR /usr/crawler

RUN npm install --production

ADD dist /usr/crawler/src

EXPOSE 3000

CMD ["npm", "start"]