const puppeteer = require('puppeteer');
const slack = require('./slack');
const UserAgent = require("user-agents");
const userAgent = new UserAgent({
   deviceCategory: "desktop",
   platform: "Win32"
 });

const mainFunc = async () => {

    const args = [
        '--auto-open-devtools-for-tabs',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        "--user-agent=" + userAgent + ""
    ];

    const browser = await puppeteer.launch({
        args,
        headless: false,
        ignoreHTTPSErrors: false
    });
  
    const page = await browser.newPage();
    await page.setViewport({
        width: 1024,
        height: 768,
        deviceScaleFactor: 1,
    });

    let resultCollector = {}


    async function checkCenter(number,plz) {
        await page.goto('https://'+number+'-iz.impfterminservice.de/impftermine/service?plz='+plz);

        //Intercept Terminservice Rest Call
        page.on('response', response => {
            const re = /termincheck/i;
            let found = response.url().match(re);
            if (found) {
                response.text().then(function (textBody) {
                    resultCollector[plz] = {}
                    resultCollector[plz].status = response.status();
                    resultCollector[plz].result = textBody;
                })
            }
        })
        
        try {
            await page.waitForSelector("input[value='0']",{
                timeout: 5000
            });
        }
        catch {
            console.log(plz+': Warteraum / Error');
            return false;
        }

        await page.click("label:nth-of-type(2)");

        await page.waitForTimeout(3000);

        try {
            await page.waitForSelector("div.alert-danger",{
                timeout: 5000
            });
            console.log(plz+': Keine Termine');
            return false;
        }
        catch {
            console.log(plz+': Hooray!');
            return true;
        }
    }

    const centers = process.env.CENTER_LIST.split(',');

    let check = false;
    
    for (let i of centers) {
        center_fragments = i.split(':');
        if(!check) {
            check = await checkCenter(center_fragments[0],center_fragments[1]);
        }
    }

    console.log(resultCollector);
    
    if(!check) {
        await browser.close();
    }
    else {
        if(process.env.SLACK_WEBHOOK) slack.sendMessage('Check Browser: Codes might be available - ' + JSON.stringify(resultCollector));
    }
}

mainFunc();

/*setInterval(function(){
    mainFunc();
}, 60000);*/