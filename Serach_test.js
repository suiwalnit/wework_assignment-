
import wd from 'wd';
import assert from 'assert';
import axios from 'axios';
import https from 'https';


const driverConfig = {
    platformName: 'Android',
    deviceName: 'Redmi 13C',
    appPackage: 'com.example.wework',
    appActivity: 'com.example.wework.MainActivity',
    automationName: 'UiAutomator2'
};

const driver = wd.promiseChainRemote("http://localhost:4723/wd/hub");

// Initialize driver and handle notifications
async function initializeDriver() {
    await driver.init(driverConfig);
    await driver.sleep(5000);
    try {
        const allowNotificationButton = await driver.elementById('com.android.permissioncontroller:id/permission_allow_foreground_only_button');
        await allowNotificationButton.click();
        console.log('Allowed Notification');
    } catch (err) {
        console.log('Notification permission popup not found, continuing...');
    }
    await driver.sleep(3000);
}

// Common search function
async function searchMovie(movieTitle) {
    await driver.sleep(3000);
    const searchBar = await driver.elementByXPath("/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.FrameLayout/android.view.View/android.view.View/android.view.View/android.view.View/android.view.View[2]/android.widget.ScrollView/android.widget.ImageView");
    await searchBar.click();
    await driver.sleep(2000);
    await driver.keys(movieTitle);
    await driver.execute('mobile: shell', { command: 'input', args: ['keyevent', '66'] }); // Simulate Enter key
    await driver.sleep(2000);
}

// Verify results function
async function verifyResults(expectedNowPlaying, expectedTopRated) {
    const nowPlayingElement = await driver.elementByXPath('(//android.view.View[@content-desc="No results found."])[1]');
    const topRatedElement = await driver.elementByXPath('(//android.view.View[@content-desc="No results found."])[2]');
    
    const nowPlayingContentDesc = await nowPlayingElement.getAttribute('content-desc');
    const topRatedContentDesc = await topRatedElement.getAttribute('content-desc');

    assert.strictEqual(nowPlayingContentDesc, expectedNowPlaying, `Expected "${expectedNowPlaying}" in Now Playing`);
    assert.strictEqual(topRatedContentDesc, expectedTopRated, `Expected "${expectedTopRated}" in Top Rated`);

    console.log('Test passed: Results are as expected.');
}

// Test cases
async function testproperwithpropername() {
    console.log('Running test: Search with proper characters');
    await initializeDriver();
    await searchMovie('The Substance');
    const nowPlayingFound = await driver.hasElementByXPath('(//android.view.View[@content-desc="No results found."])[1]');
    const topRatedFound = await driver.hasElementByXPath('(//android.view.View[@content-desc="No results found."])[2]');
    
    console.log(nowPlayingFound ? "Movie not present in Now Playing section" : "Movie present in Now Playing section");
    console.log(topRatedFound ? "Movie not present in Top Rated section" : "Movie present in Top Rated section");
    driver.quit();
}
async function testSpecialCharacterSearch() {
    console.log('Running test: Search with special characters');
    await initializeDriver();
    await searchMovie('&^%$#@');
    await verifyResults('No results found.', 'No results found.');
    driver.quit();
}

async function testSingleCharacterSearch() {
    console.log('Running test: Single character search');
    await initializeDriver();
    await driver.sleep(3000)
    await searchMovie('A');
    const nowPlayingFound = await driver.hasElementByXPath('(//android.view.View[@content-desc="No results found."])[1]');
    
    console.log(nowPlayingFound ? "Movie not present in Now Playing section" : "Movie present for single Character");
    driver.quit();
}

async function testRandomIntegerSearch() {
    console.log('Running test: Random integer search');
    await initializeDriver();
    await driver.sleep(3000)
    await searchMovie('2023');
    await verifyResults('No results found.', 'No results found.');
    driver.quit();
}

async function testTopRatedMovieSearch() {
    console.log('Running test: Search for a movie in Top Rated only');
    await initializeDriver();
    await searchMovie('The GodFather');
    
    const nowPlayingFound = await driver.hasElementByXPath('(//android.view.View[@content-desc="No results found."])[1]');
    const topRatedFound = await driver.hasElementByXPath('(//android.view.View[@content-desc="No results found."])[2]');
    
    console.log(nowPlayingFound ? "Movie not present in Now Playing section" : "Movie present in Now Playing section");
    console.log(topRatedFound ? "Movie not present in Top Rated section" : "Movie present in Top Rated section");
    driver.quit();
}

// Execute test cases
(async () => {
    await testproperwithpropername();
    await testSpecialCharacterSearch();
    await testSingleCharacterSearch();
    await testRandomIntegerSearch();
    await testTopRatedMovieSearch();

    await driver.quit();
})();
