
import * as dotenv from "dotenv";
import mongoConnection from './database/mongo-connection';
import crawler from './crawler'


(async () => {
    dotenv.config({ path: './config/.env' })

    const {
        LEGENDAS_TV_USERNAME,
        LEGENDAS_TV_PASSWORD,
        ONLY_KEYWORD,
        MONGO_URI
    } = process.env

    if (!LEGENDAS_TV_USERNAME || !LEGENDAS_TV_PASSWORD) throw new Error('É necessario configurar o usuario e senha do site')
    if (!MONGO_URI) throw new Error('É necessario configurar o endereço de conexão do mongo db')

    try {
        await mongoConnection.bootstrap(MONGO_URI)

        const onlyKeywordBool = ONLY_KEYWORD === 'true'

        console.log(onlyKeywordBool)
        await crawler
            .bootstrap(LEGENDAS_TV_USERNAME, LEGENDAS_TV_PASSWORD, onlyKeywordBool)
            .run()

        await mongoConnection.closeConnection()
    } catch (error) {
        console.error(error)
        process.exit(126)
    }
})()