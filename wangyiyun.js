const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
const {TimeoutError} = require('puppeteer/Errors');
var account  = "18017752220";
var passwd   = "tl111222";
var courpage = "https://study.163.com/course/introduction.htm?courseId=1004720008#/courseDetail?tab=1";
function crawl(){
    (async () => {
        try {
            console.log("如果20S未弹出已登录，再启动一下");
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.goto('https://study.163.com/member/login.htm');
            await page.waitFor(10000);
            let frame = page.frames()[5];
            await frame.type("#phoneipt",account);
            await frame.type(".j-inputtext.dlemail",passwd);
            await frame.click("#submitBtn");
            console.log("登录成功");
            await page.waitForNavigation({
                waitUntil: 'load'
            });
            await page.goto(courpage);
            await page.waitFor(".m-chapterList .section");
            let chaplist = await page.$$(".m-chapterList .section");
            let num = chaplist.length;
            console.log(num);
            for (var i = 0; i < num; i++) {
                console.log("第"+i+"个");
                await page.goto(courpage);
                await page.waitFor(".m-chapterList .section");
                //await page.click(".m-chapterList .section");
                let chaplistson = await page.$$(".m-chapterList .section");
                chaplistson[i].click();
                //await page.waitFor(2000);
                //await page.goto(page.url());
                let finalResponse = await page.waitForResponse(response => response.url() === 'https://vod.study.163.com/eds/api/v1/vod/video' && response.status() === 200);
                let test = await finalResponse.text();
                let jsonTest = JSON.parse(test);
                console.log("下载");
                //同步

                //downloadFile(jsonTest.result.videos[5].videoUrl,"./go/"+ jsonTest.result.name.replace(".mov", "")+"."+jsonTest.result.videos[5].format,function(){
                   // console.log('okokok');
                //});
                await downloadFile(jsonTest.result.videos[5].videoUrl,"./go/"+ jsonTest.result.name.replace(".mov", "")+"-"+i+"."+jsonTest.result.videos[5].format);
                console.log(jsonTest.result.videos[5].videoUrl,jsonTest.result.name.replace(".mov", "")+"."+jsonTest.result.videos[5].format+"下载成功\n");
                console.log("等待会5s 防被禁止");
                await page.waitFor(5000);
            }
            await browser.close();
        }catch (e) {
            if (e instanceof TimeoutError) {
                console.log('错误了')
                console.log(e);
            }
        }
    })();
}
async function downloadFile(uri,filename){

    // var stream = fs.createWriteStream(filename);
    // request(uri).pipe(stream).on('close', callback);
    return new Promise((resolve, reject) => {
        try {
            var stream = fs.createWriteStream(filename);
            request(uri).pipe(stream).on('close', resolve);
        }catch (e) {
            reject()
        }
    });
}
crawl();