from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.common.by import By
import time
import csv


baseUrl = "https://www.skroutz.gr/c/1009/andrika-mpoufan/m/10056/Superdry/f/259230/palto.html"
# baseUrl = "https://www.skroutz.gr/c/1009/andrika-mpoufan/m/10056/Superdry/f/602704/parka.html"

cssNextPageSelector = '#categories_show main section ol.paginator > li:last-child > a'
productPicSelector = 'li.cf.card a.pic'
productPricesWrapper = '.prices'
lowestPriceSelector = '#prices li.cf.card .price .final-price > a'
productsArray = []

# Create new csv and write first line of Titles
with open('products.csv', 'w', newline='') as csvfile:
    spamwriter = csv.writer(csvfile)
    spamwriter.writerow(["Title", "href", "SKU", "Lower Price"])

chrome_options = webdriver.ChromeOptions()
## Use a proxy when Skroutz bans you ##
# PROXY = "PROXY_IP:PROXY_PORT"
# chrome_options.add_argument('--proxy-server=http://%s' % PROXY)

driver = webdriver.Chrome('./chromedriver', options=chrome_options)
# driver = webdriver.Firefox(executable_path='./geckodriver') # FIREFOX
wait = WebDriverWait(driver, 5) # Shortcut to wait 5sec

def getSkroutzProducts():
  start_time = time.time()
  driver.get(baseUrl)
  time.sleep(1) #wait for cookie msg to appear
  driver.find_element_by_id('accept-essential').click()

  while True:
      lenOfPage = driver.execute_script(
          "window.scrollTo(0, document.body.scrollHeight);var lenOfPage=document.body.scrollHeight;return lenOfPage;")
      match = False
      while(match == False):
          lastCount = lenOfPage
          time.sleep(1)
          lenOfPage = driver.execute_script(
              "window.scrollTo(0, document.body.scrollHeight);var lenOfPage=document.body.scrollHeight;return lenOfPage;")
          if lastCount == lenOfPage:
              match = True

      allProducts = driver.find_elements_by_css_selector(productPicSelector)
      for product in allProducts:
          productTitle = product.get_attribute('title')
          href = product.get_attribute('href')
          productsArray.append({"title": productTitle, "href": href})

      next_page_btn = driver.find_elements_by_css_selector(cssNextPageSelector)
      if not next_page_btn:
          break
      else:
          element = wait.until(
              expected_conditions.element_to_be_clickable((By.CSS_SELECTOR, cssNextPageSelector)))
          element.click()

  print("Total products in category: ", len(productsArray))
  for product in productsArray:
      driver.get(product['href'])
      # time.sleep(1)
      wait.until(expected_conditions.presence_of_element_located((By.CSS_SELECTOR, productPricesWrapper)))

      sku = ''
      lowestPrice = ''
      if driver.find_elements_by_class_name('sku-primary-pn'):
          sku = driver.find_element_by_class_name('sku-primary-pn').text
      if driver.find_elements_by_css_selector(lowestPriceSelector):
          lowestPrice = driver.find_element_by_css_selector(lowestPriceSelector).text
      with open('products.csv', 'a', newline='') as csvfile:
          spamwriter = csv.writer(csvfile, delimiter=',', quotechar='"', quoting=csv.QUOTE_NONNUMERIC)
          spamwriter.writerow([product['title'], product['href'], sku, lowestPrice])

  driver.close()
  print("Crawler: %s seconds" % (time.time() - start_time))

getSkroutzProducts()