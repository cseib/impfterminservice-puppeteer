const puppeteer = require('puppeteer');
const UserAgent = require("user-agents");
const userAgent = new UserAgent({
   deviceCategory: "desktop",
   platform: "Win32"
 });
const slack = require('./slack');

console.log(userAgent.data.userAgent);

(async () => {

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
        headless: false
    });
  
    const page = await browser.newPage();
    await page.setViewport({
        width: 1024,
        height: 768,
        deviceScaleFactor: 1,
    });
    await page.setUserAgent(userAgent.data.userAgent);


    async function checkAppoints(url,plz) {
        
        await page.goto(url);
        
        try {
            await page.waitForSelector("button[data-target='#itsSearchAppointmentsModal']",{
                timeout: 5000
            });
        }
        catch {
            try {
                await page.waitForSelector("p.text-center",{
                    timeout: 4000
                });
                console.log(plz + ': Warteraum');
                return false;
            }
            catch {
                //onsole.log(plz + ': unknown error');  
            }
        }
            
        try {
            await page.evaluate(_ => {
                // this will be executed within the page, that was loaded before
                document.querySelector("button[data-target='#itsSearchAppointmentsModal']").click();
            });
        }
        catch{
            console.log(plz+': Button nicht verfügbar');
            return false;
        }
        
        try {
            await page.waitForSelector("#itsSearchAppointmentsModal .its-slot-pair-search-no-results",{
                timeout: 20000
            });
            console.log(plz+': Keine Termine');
            return false;
        }
        catch {
            console.log(plz+': Hooray - '+url);
            return true;
        }
    }    

    let check = false;

    const codes = process.env.CODES.split(',');

    for (let i of codes) {
        code_fragments = i.split(':');
        if(!check) {
            check = await checkAppoints('https://'+code_fragments[2]+'-iz.impfterminservice.de/impftermine/suche/'+code_fragments[0]+'/'+code_fragments[1],code_fragments[1]);
        }
    }

    if(!check) {
        await browser.close();
    }
    else {
        if(process.env.SLACK_WEBHOOK) slack.sendMessage('Check Brower: Appointment Scheduling');
    }
    
})();