const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();

    // Navigate to the URL
    await page.goto("https://www.startupindia.gov.in/content/sih/en/startupgov/regulatory_updates.html", {
      waitUntil: "networkidle2",  // Wait for the network to be idle
    });

    // Wait for the specific element to be present
    await page.waitForSelector('body > div.market-research.onload > div:nth-child(2) > div > div > div > div > div > div > div > div > table > tbody > tr');



    // Debug: Log the page content
    const content = await page.content();
    console.log(content);

    // Scrape the data
    const result = await page.$$eval(
      'body > div.market-research.onload > div:nth-child(2) > div > div > div > div > div > div > div > div > table > tbody > tr', 
      rows => {
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, column => column.innerText);
        });
      }
    );

    // Print the result
    console.log(`Scraped data: ${JSON.stringify(result)}`);
    res.send({ policy: result });

  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
