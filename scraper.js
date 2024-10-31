const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');

// Set your dataset path here
const datasetPath = 'G:/myenv/dataset';

// Helper function to download an image from a URL
async function downloadImage(url, filepath) {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });
  
  return new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(filepath))
      .on('finish', () => resolve())
      .on('error', (e) => reject(e));
  });
}

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Dictionary to hold product samples for each category
  const categoryCounts = {
    table: 0,
    shelf: 0,
    sofa: 0,
    chair: 0,
    lamp: 0,
    mirror: 0
  };

  // Maximum number of samples per category
  const maxSamples = 500;
  let allProducts = [];

  // List of search queries, one for each category
  const queries = {
    table: 'https://www.amazon.com/s?k=table+furniture',
    shelf: 'https://www.amazon.com/s?k=shelf+furniture',
    sofa: 'https://www.amazon.com/s?k=sofa+furniture',
    chair: 'https://www.amazon.com/s?k=chair+furniture',
    lamp: 'https://www.amazon.com/s?k=lamp+furniture',
    mirror: 'https://www.amazon.com/s?k=mirror+furniture'
  };

  // Create the dataset directory if it doesn't exist
  fs.ensureDirSync(datasetPath);

  // Function to check if we've collected enough data for each category
  const isSamplingComplete = () => {
    return Object.values(categoryCounts).every(count => count >= maxSamples);
  };

  // Loop through each query (category)
  for (let category in queries) {
    if (categoryCounts[category] >= maxSamples) continue; // Skip if category is already done

    let hasNextPage = true;
    let pageNumber = 1;

    while (hasNextPage && categoryCounts[category] < maxSamples) {
      console.log(`Scraping page ${pageNumber} for ${category}...`);

      // Navigate to the specific search query URL for the current category
      await page.goto(`${queries[category]}&page=${pageNumber}`, {
        waitUntil: 'networkidle2', // Wait for the page to fully load
      });

      // Get the HTML content of the page
      const content = await page.content();

      // Load the HTML into Cheerio for parsing
      const $ = cheerio.load(content);

      // Select the product items in the search results
      $('.s-result-item').each(async (index, element) => {
        let title = $(element).find('h2').text().trim() || null;
        let image = $(element).find('img').attr('src') || null;
        let price = $(element).find('.a-price-whole').text().trim() || null;

        // Only collect products that match the current category
        if (title && image && categoryCounts[category] < maxSamples) {
          // Store product details
          allProducts.push({
            title,
            type: category,
            image,
            price,
          });

          // Increment the category count
          categoryCounts[category]++;

          // Ensure category folder exists in the dataset path
          const categoryPath = path.join(datasetPath, category);
          fs.ensureDirSync(categoryPath);

          // Define file path for the image
          const imageName = `${category}_${Date.now()}.jpg`;
          const imagePath = path.join(categoryPath, imageName);

          // Download the image and save it to the correct category folder
          try {
            console.log(`Downloading image for ${category}: ${title}`);
            await downloadImage(image, imagePath);
          } catch (error) {
            console.error(`Failed to download image for ${title}: ${error}`);
          }
        }
      });

      console.log(`Current count for ${category}: ${categoryCounts[category]}`);

      // Check if there is a "Next" button to click, and move to the next page
      const nextButton = await page.$('a.s-pagination-next');
      if (nextButton && categoryCounts[category] < maxSamples) {
        pageNumber++; // Move to the next page
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Add a 2-second delay between pages
      } else {
        hasNextPage = false; // No more pages left
      }

      // Stop scraping this category if we've collected enough samples
      if (categoryCounts[category] >= maxSamples) {
        console.log(`Collected 500 samples for ${category}.`);
        break;
      }
    }

    if (isSamplingComplete()) {
      console.log('Collected 500 samples for all categories.');
      break;
    }
  }

  // Save the scraped data to a JSON file
  fs.writeFileSync('all_products.json', JSON.stringify(allProducts, null, 2), 'utf-8');

  console.log(`Scraped a total of ${allProducts.length} products across all categories!`);
  console.log(`Final counts: `, categoryCounts);

  // Close Puppeteer
  await browser.close();
})();
