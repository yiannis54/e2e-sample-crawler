"use strict";
const { Builder, By, Key, until, WebElement } = require("selenium-webdriver");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const cssNextPageSelector = "#categories_show main section ol.paginator > li:last-child > a";
const productPicSelector = "li.cf.card a.pic";
// const baseUrl = "https://www.skroutz.gr/c/1009/andrika-mpoufan/m/10056/Superdry/f/602704/parka.html";
const baseUrl = "https://www.skroutz.gr/c/1009/andrika-mpoufan/m/10056/Superdry/f/259230/palto.html";
const productPricesWrapper = ".prices";
const lowestPriceSelector = "#prices li.cf.card .price .final-price > a";
var productsArray = [];

const csvWriter = createCsvWriter({
  path: "productsJS.csv",
  header: [
    { id: "title", title: "TITLE" },
    { id: "href", title: "HREF" },
    { id: "sku", title: "SKU" },
    { id: "lowestPrice", title: "LowestPrice" },
  ],
});

function handleFailure(err, driver) {
	console.error("Something went wrong!\n", err.stack, "\n");
	driver.quit();
}

async function wait(ms) {
	var start = new Date().getTime();
	var end = start;
	while (end < start + ms) {
		end = new Date().getTime();
	}
}

async function getPageProducts(driver) {
	try {
		let allProducts = await driver.findElements(By.css(productPicSelector));

		for (let product of allProducts) {
			let productTitle = await product.getAttribute("title");
			let href = await product.getAttribute("href");
			productsArray.push({ title: productTitle, href });
		}
	} catch (err) {
		handleFailure(err, driver);
	}
}

async function getSkroutzProducts() {
  console.time('Crawler');
	const driver = await new Builder().forBrowser("chrome").build();

	try {
		// await driver.manage().setTimeouts({ implicit: 3000, explicit: 3000 });
		await driver.get(baseUrl);
		await wait(1000);
		await driver.findElement(By.id("accept-essential")).click();
		const actions = driver.actions({ async: true });

		while (true) {
			await actions.move({ y: 600 }).perform();

			await getPageProducts(driver);

			var nextPage = await driver.findElements(By.css(cssNextPageSelector));
			if (nextPage < 1) {
				break;
			} else {
				let element = await driver.wait(until.elementLocated(By.css(cssNextPageSelector)), 2000);
				element.click();
			}
		}

		for (let product of productsArray) {
			await getProductDetails(product, driver);
		}
	} catch (err) {
		handleFailure(err, driver);
	} finally {
		driver.quit();
	}

	console.log("Total products in category: ", productsArray.length);
	writeToCsv(productsArray);
}

async function getProductDetails(product, driver) {
	try {
		await driver.get(product.href);
		// await wait(500);
		await driver.wait(until.elementLocated(By.css(productPricesWrapper)), 1000);

		let sku = "";
		let lowestPrice = "";
		if ((await driver.findElements(By.className("sku-primary-pn"))).length > 0) {
			sku = await driver.findElement(By.className("sku-primary-pn")).getAttribute("textContent");
		}
		if ((await driver.findElements(By.className(lowestPriceSelector))).length > 0) {
			lowestPrice = await driver.findElement(By.className(lowestPriceSelector)).getAttribute("textContent");
		}
		product.sku = sku;
		product.lowestPrice = lowestPrice;
	} catch (err) {
		handleFailure(err, driver);
	}
}

function writeToCsv(productsArray) {
	csvWriter.writeRecords(productsArray).then(() => {
    console.timeEnd('Crawler');
	});
}

getSkroutzProducts();
