/**
 * @author Mario Kurzweil
 */

var webdriver = require('selenium-webdriver');
var assert = require('assert');

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    build();

driver.get('http://localhost/web/flightgraph-web');
driver.findElement(webdriver.By.name('search-term')).sendKeys('PGT322');
driver.findElement(webdriver.By.name('search-term')).sendKeys(webdriver.Key.chord(webdriver.Key.RETURN));


driver.quit();



