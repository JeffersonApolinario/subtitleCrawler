# Subtitle Crawler
This worker get informations about the subtitles on site legendas.tv, the subtitles searched is about the simpsons

## Dependencies
- NodeJS 12+
- NPM
- Docker
- Docker Compose

## Environments
- MONGO_URI // mongo uri to connect on mongodb
- LEGENDAS_TV_USERNAME // login username
- LEGENDAS_TV_PASSWORD // login password
- ONLY_KEYWORD // define if subtitle need to contains simpsons, values true or false

## How to Execute
To run the worker you need configure your .env in the folder config, exists one example to do your .env, the file is .env-sample in the folder config

### Execute local with database external
'''
npm install
npm run start:dev
'''

### Execute container
'''
chmod +x run-docker.sh
./run-docker.sh
'''
