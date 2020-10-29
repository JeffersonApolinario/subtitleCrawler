import os from 'os'
import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import { SubtitleModel } from '../database/schemas/subtitles'


class CrawlerSimpsons {

    SITE_URI = 'http://legendas.tv'

    loginUsername = ''
    loginPassword = ''
    onlyKeyword = false
    
    bootstrap(loginUsername: string, loginPassword: string, onlyKeyword: boolean) {
        this.loginUsername = loginUsername
        this.loginPassword = loginPassword 
        this.onlyKeyword = onlyKeyword
        return this
    }   

    async run () {
        const launchOptions: LaunchOptions = {
            // headless: false,
        }

        if (os.platform() !== 'win32') {
            launchOptions.args = [
                '--no-sandbox',
                '--disable-gpu"'
            ]
        }

        const { PUPPETEER_SKIP_CHROMIUM_DOWNLOAD  } = process.env
        if (PUPPETEER_SKIP_CHROMIUM_DOWNLOAD) launchOptions.executablePath = '/usr/bin/chromium-browser'

        console.log(launchOptions)
        const browser = await puppeteer.launch(launchOptions)

        const page = await this.initializePage(browser)

        await this.closePrimaryModal(page)
        await this.login(page)
        await this.inputSearch(page)

        const { links, subtitles } = await this.getSubtitlesList(page)
        const subtitlesCompleted = await this.findMoreInformationOfSubtitle(page, links, subtitles)

        await this.createOrUpdateInDatabase(subtitlesCompleted)
        console.log(`Foram encontradas ${subtitlesCompleted.length} legendas`)
        await browser.close()


    }

    async initializePage (browser: Browser) {
        const page = await browser.newPage();
        await page.goto(this.SITE_URI)
        return page
    }

    async login (page: Page) {
        await page.click('.js_entrar')
        await page.waitFor(2000);

        await page.focus('#UserIndexForm input:nth-child(3)')
        await page.type('#UserIndexForm > input[type=text]:nth-child(3)', this.loginUsername, { delay: 50 })
        await page.type('#UserIndexForm > input[type=password]:nth-child(4)', this.loginPassword, { delay: 50 })

        await page.click('#UserIndexForm > div.clearfix > input[type=submit]')
        await page.waitForNavigation()
    }

    async closePrimaryModal (page: Page) {
        await page.click('#help-box #help-box-close')
        await page.waitFor(2000)
    }

    async inputSearch(page: Page) {
        await page.focus('#search-box')
        await page.type('#search-box', 'Os Simpsons', { delay: 100 })
        await page.keyboard.press('Enter')
    }

    async getSubtitlesList (page: Page) {
        await page.waitForSelector('.f_left')
        const language = await page.$eval('.tbselect option[selected="selected"]', el => el.textContent)

        const items = await page.$$('.f_left')

        const links: Array<string> = []
        const subtitles: any = []
        
        for (const item of items) {
            
            const name = await item.$eval('p', el => el.textContent)
            const linkRelative = await item.$eval('p a', el => el.getAttribute('href'))

            // console.log(this.onlySimpsons, name, !name?.includes('Simpsons'), !name?.includes('simpsons'))
            if (this.onlyKeyword && !name?.includes('Simpsons') && !name?.includes('simpsons')) continue

            const link = `http://legendas.tv/${linkRelative}`
            links.push(link)

            const dataText = await item.$eval('.data', el => el.textContent)
            const [ downloadsText, ratingText, otherInfos ] = dataText?.split(', ')

            const totalDownloads = parseInt(downloadsText.replace(/\D/g,''))
            const rating = parseInt(ratingText.replace(/\D/g,''))
            
            const dateAndUserInfo = otherInfos.split(" ")
            const username = dateAndUserInfo[2]
            const date = dateAndUserInfo[4]
            const time = dateAndUserInfo[6]

            const year = date.substr(6)
            const month = date.substr(3,2)
            const day = date.substr(0,2)

            const dateTransformed = `${year}-${month}-${day}`

            subtitles.push({
                link,
                name,
                username,
                language,
                totalDownloads,
                rating,
                sendedAt: new Date(`${dateTransformed}T${time}`),
            })
        }

        return { links, subtitles }
    }

    async findMoreInformationOfSubtitle (page: Page, links: Array<string>, subtitles: Array<any>) {

        const subtitlesCompleted = []

        for (const link of links) {
            await page.goto(link)
            await page.waitForSelector('.icon_arrow')

            const subtitle = subtitles.find((subtitle: any) => subtitle.link === link)
            const details = await this.getSubtitleDetail(page)

            subtitlesCompleted.push({ ...subtitle, ...details })
            await page.goBack()
        }

        return subtitlesCompleted
    }

    async getSubtitleDetail(page: Page) {
        const like: any = Number(await page.$eval('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) p:nth-child(1)', el => el.textContent))
        const dislike: any = Number(await page.$eval('body > div.container > div.middle.download > section:nth-child(2) > aside:nth-child(4) p:nth-child(2)', el => el.textContent))

        const buttonDownload = await page.$('.icon_arrow')

        let downloadLink = ''

        if (buttonDownload) {
            const onclickValue: any = await page.$eval('.icon_arrow', el => el.getAttribute('onclick'))
            downloadLink = 'http://legendas.tv' + onclickValue.split("'")[1]
        }

        const totalLikes = parseInt(like) + parseInt(dislike)
        const likeRatio = Number(((like/totalLikes) * 100).toFixed(2))

        return { like, dislike, downloadLink, totalLikes, likeRatio}
    }
    
    async createOrUpdateInDatabase(subtitlesCompleted: Array<any>) {
        const subtitlesNames = subtitlesCompleted.map(subtitle => subtitle.name)
        const subtitlesFoundDB = await SubtitleModel.find({ name: { $in: subtitlesNames} })
        
        const subtitlesToUpdate = []
        const subtitlesToCreate = []

        for (const subtitle of subtitlesCompleted) {
            const { name } = subtitle
            const subtitleFoundDB = subtitlesFoundDB.find((subtitleDB: any) => subtitleDB.name === name)
            
            if (subtitleFoundDB) {
                subtitle.updatedAt = new Date()
                const filter = { name }
                const update = { $set: { ...subtitle } }

                subtitlesToUpdate.push({ updateOne: { filter, update } })
            } else {
                subtitle.createdAt = new Date()
                subtitlesToCreate.push({ insertOne: subtitle })
            }
        }

        await SubtitleModel.collection.bulkWrite([...subtitlesToUpdate, ...subtitlesToCreate])
    }
}

export default new CrawlerSimpsons()