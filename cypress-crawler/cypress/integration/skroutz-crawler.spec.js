/// <reference types="cypress" />
import { selectors } from "../selectors";
var productsArray = [];

describe("Skroutz Crawler", () => {
	it("should get product urls", () => {
		cy.clock();
		cy.visit(selectors.url);
		cy.tick(1000);
		cy.get("#accept-essential")
			.click()
			.then(() => {
				let iterate = true;
				// do {
          cy.wait(500);
					cy.get(".cross-categories").scrollIntoView({ offset: { top: -150, left: 0 } });
					cy.get(selectors.productPicSelector)
						.each(($prod, index, $list) => {
							cy.get($prod).then((elem) => {
                let title = elem.attr("title");
                let href = elem.attr("href");
								productsArray.push({ title, href });
							})
						})
            .then(() => {
              cy.log("----OK----")
            })
						.then(() => {
							cy.get(selectors.cssNextPageSelector).then((nextPage) => {
								if (nextPage) {
									cy.log("next");
									cy.get(selectors.cssNextPageSelector).last().click();
								} else {
									cy.log("into false");
									iterate = false;
								}
							});
						})
            .then(() => {
              cy.log(iterate)
            })
				// } while (iterate);
			});
	});

	// it("should get all products details", () => {
	// 	for (let product of productsArray) {
	// 		cy.get(product.href);
	// 		let sku = "";
	// 		let lowestPrice = "";
	// 		cy.get("sku-primary-pn").then(($sku) => {
	// 			sku = $sku.its("textContent");
	// 		});
	// 		cy.get(selectors.lowestPriceSelector).then(($price) => {
	// 			lowestPrice = $price.its("textContent");
	// 		});
	// 		product.sku = sku;
	// 		product.lowestPrice = lowestPrice;
	// 	}
	// });

	// it("should save all data to csv", () => {
	// 	const csvWriter = createCsvWriter({
	// 		path: "productsJS.csv",
	// 		header: [
	// 			{ id: "title", title: "TITLE" },
	// 			{ id: "href", title: "HREF" },
	// 			{ id: "sku", title: "SKU" },
	// 			{ id: "lowestPrice", title: "LowestPrice" },
	// 		],
	// 	});
	// 	csvWriter.writeToCsv(productsArray).then(() => {
	// 		cy.log("ok");
	// 	});
	// });
});
