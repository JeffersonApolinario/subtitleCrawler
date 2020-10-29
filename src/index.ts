// import puppeteer from 'puppeteer';
// import fs from 'fs'
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


// import subtitlesModel from './database/schemas/subtitles'


// (async () => {
//     const {
//         LEGENDAS_TV_USERNAME = 'fliperapp',
//         LEGENDAS_TV_PASSWORD = '123456',
//         SIMPSON_ONLY
//     } = process.env

//     const SUB_TITLE_URI = 'http://legendas.tv'

//     if (!LEGENDAS_TV_USERNAME || !LEGENDAS_TV_PASSWORD) throw new Error('É necessario configurar o usuario e senha do site')

//     const browser = await puppeteer.launch({ 
//         // headless: false,
//     })

//     try {
//         const page = await browser.newPage();
//         await page.goto(SUB_TITLE_URI)
        
//         await page.click('#help-box #help-box-close')
//         await page.waitFor(2000)
    
//         await page.click('.js_entrar')
//         await page.waitFor(2000);

//         await page.focus('#UserIndexForm input:nth-child(3)')
//         await page.type('#UserIndexForm > input[type=text]:nth-child(3)', LEGENDAS_TV_USERNAME, { delay: 50 })
//         await page.type('#UserIndexForm > input[type=password]:nth-child(4)', LEGENDAS_TV_PASSWORD, { delay: 50 })

//         await page.click('#UserIndexForm > div.clearfix > input[type=submit]')
//         await page.waitForNavigation()

//         await page.focus('#search-box')
//         await page.type('#search-box', 'Os Simpsons', { delay: 100 })
//         await page.keyboard.press('Enter')

//         await page.waitForSelector('.f_left')
//         const language = await page.$eval('.tbselect option[selected="selected"]', el => el.textContent)

//         const items = await page.$$('.f_left')

//         const links: Array<any> = []
//         const subtitles: any = []
//         const onlySimpsons = SIMPSON_ONLY === 'true'

//         for (const item of items) {
            
//             const subTitleName = await item.$eval('p', el => el.textContent)
//             const linkRelative = await item.$eval('p a', el => el.getAttribute('href'))

//             console.log(onlySimpsons, subTitleName, !subTitleName?.includes('Simpsons'), !subTitleName?.includes('simpsons'))
//             if (onlySimpsons && !subTitleName?.includes('Simpsons') && !subTitleName?.includes('simpsons')) continue

//             const link = `http://legendas.tv/${linkRelative}`
//             links.push(link)

//             const dataText = await item.$eval('.data', el => el.textContent)
//             const [ downloadsText, ratingText, otherInfos ] = dataText?.split(', ')

//             const totalDownloads = downloadsText.substr(0,4)
//             const rating = ratingText.substr(5)
            
//             const dateAndUserInfo = otherInfos.split(" ")
//             const username = dateAndUserInfo[2]
//             const date = dateAndUserInfo[4]
//             const time = dateAndUserInfo[6]


//             const year = date.substr(6)
//             const month = date.substr(3,2)
//             const day = date.substr(0,2)

//             const dateTransformed = `${year}-${month}-${day}`

//             subtitles.push({
//                 link,
//                 subTitleName,
//                 username,
//                 language,
//                 totalDownloads,
//                 rating,
//                 sendedAt: new Date(`${dateTransformed}T${time}`),
//             })

//             // links.push(linkValue)
//         }


//         for (const link of links) {
//             await page.goto(link)
//             await page.waitFor(5000)

//             const subTitleIndex = subtitles.findIndex((subtitle: any) => subtitle.link === link)

//             const like: any = Number(await page.$eval('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) p:nth-child(1)', el => el.textContent))
//             const dislike: any = Number(await page.$eval('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) p:nth-child(2)', el => el.textContent))

//             const buttonDownload = await page.$('.icon_arrow')

//             let downloadLink = ''

//             if (buttonDownload) {
//                 const onclickValue: any = await page.$eval('.icon_arrow', el => el.getAttribute('onclick'))
//                 downloadLink = 'http://legendas.tv' + onclickValue.split("'")[1]
//             }

//             const totalLikes = parseInt(like) + parseInt(dislike)
//             const likeRatio = Number(((like/totalLikes) * 100).toFixed(2))

//             const subtitle = subtitles[subTitleIndex]
//             subtitles[subTitleIndex] = { ...subtitle, totalLikes, like, dislike, likeRatio, downloadLink }
            
//             await page.goBack()
//         }

//         console.log(`Foram encontradas ${subtitles.length} legendas`)
//         fs.writeFileSync('data.json', JSON.stringify(subtitles, null, 2))
        
//         setTimeout(async () => await browser.close() , 5000)
//     } catch (error) {
//         console.error(error)
//         setTimeout(async () => await browser.close() , 5000)
//     }
// })()