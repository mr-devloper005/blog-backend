// const puppeteer = require("puppeteer");
// const xlsx = require("xlsx");

// import puppeteer from "puppeteer";

// async function readExcel(filePath) {
//   const workbook = xlsx.readFile(filePath);
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];
//   return xlsx.utils.sheet_to_json(sheet);
// }

// async function postOnPinterest(data) {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   // Go to Pinterest login
//   await page.goto("https://www.pinterest.com/login/");

//   // Login
//   await page.type("input[name=email]", data.email);
//   await page.type("input[name=password]", data.password);
//   await page.click("button[type=submit]");
//   await page.waitForNavigation();

//   // Go to create pin page
//   await page.goto("https://www.pinterest.com/pin-builder/");

//   // Fill details
//   await page.type("textarea[placeholder='Add your title']", data.title);
//   await page.type(
//     "textarea[placeholder='Tell everyone what your Pin is about']",
//     data.description
//   );
//   await page.type("input[placeholder='Add a destination link']", data.link);

//   // Click publish
//   await page.click("button[aria-label='Publish']");

//   console.log(`Pin posted for ${data.email}`);

//   await browser.close();
// }

// (async () => {
//   const records = await readExcel("data.xlsx");

//   for (const record of records) {
//     try {
//       await postOnPinterest(record);
//     } catch (err) {
//       console.error(`Error posting for ${record.email}:`, err.message);
//     }
//   }
// })();

// import fs from "fs";

// // Read JSON file
// const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

// async function postOnPinterest(record) {
//   const browser = await puppeteer.launch({ headless: false }); // headless:false => browser dikhai dega
//   const page = await browser.newPage();

//   try {
//     // Go to Pinterest login page
//     await page.goto("https://www.pinterest.com/login/", {
//       waitUntil: "networkidle2",
//     });

//     // Email
//     await page.type("input#email", record.email, { delay: 100 });

//     // Password
//     await page.type("input#password", record.password, { delay: 100 });

//     // Click Login
//     await page.click("button[type=submit]");

//     // Wait for navigation
//     await page.waitForNavigation({ waitUntil: "networkidle2" });

//     console.log(`✅ Logged in as: ${record.email}`);

//     // Open create pin page
//     await page.goto("https://www.pinterest.com/pin-builder/", {
//       waitUntil: "networkidle2",
//     });

//     // Fill pin details
//     await page.type("textarea[placeholder='Add your title']", record.title, {
//       delay: 50,
//     });
//     await page.type(
//       "textarea[placeholder='Tell everyone what your Pin is about']",
//       record.description,
//       { delay: 50 }
//     );
//     await page.type(
//       "input[placeholder='Add a destination link']",
//       record.link,
//       { delay: 50 }
//     );

//     // Click Publish button
//     await page.click("button[aria-label='Publish']");

//     console.log(`🎉 Post created for: ${record.title}`);
//   } catch (err) {
//     console.error(`❌ Error for ${record.email}:`, err.message);
//   } finally {
//     await browser.close();
//   }
// }

// // Loop through all records
// (async () => {
//   for (const record of data) {
//     await postOnPinterest(record);
//   }
// })();

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

async function postOnPinterest(record) {
  const browser = await puppeteer.launch({
    headless: false, // headless:false = browser visible
    args: ["--start-maximized"], // full screen
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    // 🔹 Check if cookies exist (to avoid login every time)
    if (fs.existsSync("cookies.json")) {
      const cookies = JSON.parse(fs.readFileSync("cookies.json"));
      await page.setCookie(...cookies);
      console.log("✅ Cookies loaded, skipping login...");
      await page.goto("https://www.pinterest.com/", {
        waitUntil: "networkidle2",
      });
    } else {
      // Go to login
      await page.goto("https://www.pinterest.com/login/", {
        waitUntil: "networkidle2",
      });

      // Email
      await page.type("input#email", record.email, { delay: 100 });

      // Password
      await page.type("input#password", record.password, { delay: 100 });

      // Click Login
      await page.click("button[type=submit]");

      // await page.waitFor(2000); // small delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await page.click("button[type=submit]");
      await page.waitForNavigation({ waitUntil: "networkidle2" });

      console.log(`✅ Logged in as ${record.email}`);

      // Save cookies for next run
      const cookies = await page.cookies();
      fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
      console.log("💾 Cookies saved!");
    }

    // Go to Create Pin Page
    await page.goto("https://www.pinterest.com/pin-builder/", {
      waitUntil: "networkidle2",
    });

    // Add human-like scrolling
    await page.mouse.wheel({ deltaY: 300 });
    // await page.waitFor(2000);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Title
    await page.type("div[data-test-id='title'] textarea", record.title, {
      delay: 80,
    });

    // Description
    await page.type(
      "div[data-test-id='description'] textarea",
      record.description,
      { delay: 80 }
    );

    // Link
    await page.type("div[data-test-id='website-link'] input", record.link, {
      delay: 80,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Click Publish
    await page.click("button[aria-label='Publish']");
    console.log(`🎉 Post created: ${record.title}`);
  } catch (err) {
    console.error(`❌ Error for ${record.email}:`, err.message);
    await page.screenshot({ path: "debug.png", fullPage: true });
    console.log("📸 Debug screenshot saved as debug.png");
  } finally {
    await browser.close();
  }
}

// Run automation for each record
(async () => {
  for (const record of data) {
    await postOnPinterest(record);
  }
})();

// const puppeteer = require("puppeteer-extra");
// const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const fs = require("fs");

// puppeteer.use(StealthPlugin());

// const data = JSON.parse(fs.readFileSync("data.json", "utf-8"));

// async function postOnReddit(record) {
//   const browser = await puppeteer.launch({
//     headless: false,
//     args: ["--start-maximized"],
//     defaultViewport: null,
//   });

//   const page = await browser.newPage();

//   try {
//     // 🔹 Go to Reddit login page
//     await page.goto("https://www.reddit.com/login/", {
//       waitUntil: "networkidle2",
//     });

//     // await page.waitForSelector(
//     //   'input[type="email"], input[name="id"], input[name="usernameOrEmail"]'
//     // );
//     await page.type(
//       'input[type="email"], input[name="id"], input[name="usernameOrEmail"]',
//       "tumhara_email"
//     );

//     // await page.waitForSelector('input[type="password"]');
//     await page.type('input[type="password"]', "tumhara_password");

//     await page.click(
//       'button[type="submit"], button[data-test-id="registerFormSubmitButton"]'
//     );

//     await page.waitForNavigation({ waitUntil: "networkidle2" });
//     console.log(`✅ Logged in as ${record.email}`);

//     // Go to subreddit submit page
//     await page.goto(`https://www.reddit.com/r/${record.subreddit}/submit`, {
//       waitUntil: "networkidle2",
//     });

//     // Wait little
//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     // Title
//     await page.type("textarea[name=title]", record.title, { delay: 80 });

//     // Link (switch to link post)
//     const linkButton = await page.$("button[role=tab][id*='link']");
//     if (linkButton) {
//       await linkButton.click();
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       await page.type("input[name=url]", record.url, { delay: 80 });
//     }

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     // Click Post button
//     await page.click("button[type=submit]");
//     console.log(`🎉 Post created in r/${record.subreddit}: ${record.title}`);
//   } catch (err) {
//     console.error(`❌ Error for ${record.email}:`, err.message);
//     await page.screenshot({ path: "debug.png", fullPage: true });
//     console.log("📸 Debug screenshot saved as debug.png");
//   } finally {
//     await browser.close();
//   }
// }

// // Run automation for each record
// (async () => {
//   for (const record of data) {
//     await postOnReddit(record);
//   }
// })();
