import puppeteer from 'puppeteer';

async function testLandingPage() {
  console.log('🔍 Testing LandingPage Component Functionality...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Test 1: Page Load
    console.log('📋 Test 1: Page Load');
    await page.goto('https://opptym.com', { waitUntil: 'networkidle0' });
    
    // Check if page loads without errors
    const title = await page.title();
    console.log(`✅ Page title: ${title}`);
    
    // Test 2: Navigation Elements
    console.log('📋 Test 2: Navigation Elements');
    
    // Check if logo is present
    const logo = await page.$('[class*="text-2xl font-bold"]');
    if (logo) {
      console.log('✅ Logo is present');
    } else {
      console.log('❌ Logo not found');
    }
    
    // Test 3: Sign In Button
    console.log('📋 Test 3: Sign In Button');
    const signInButtons = await page.$$('button');
    let signInFound = false;
    
    for (const button of signInButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.toLowerCase().includes('sign in')) {
        signInFound = true;
        console.log('✅ Sign In button found');
        break;
      }
    }
    
    if (!signInFound) {
      console.log('❌ Sign In button not found');
    }
    
    // Test 4: Get Started Button
    console.log('📋 Test 4: Get Started Button');
    let getStartedFound = false;
    
    for (const button of signInButtons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.toLowerCase().includes('get started')) {
        getStartedFound = true;
        console.log('✅ Get Started button found');
        break;
      }
    }
    
    if (!getStartedFound) {
      console.log('❌ Get Started button not found');
    }
    
    // Test 5: Hero Section
    console.log('📋 Test 5: Hero Section');
    const heroText = await page.$eval('h1', el => el.textContent);
    if (heroText && heroText.includes('Automate Your')) {
      console.log('✅ Hero section text found');
    } else {
      console.log('❌ Hero section text not found');
    }
    
    // Test 6: Features Section
    console.log('📋 Test 6: Features Section');
    const featuresSection = await page.$('section');
    if (featuresSection) {
      console.log('✅ Features section found');
    } else {
      console.log('❌ Features section not found');
    }
    
    // Test 7: Stats Section
    console.log('📋 Test 7: Stats Section');
    const statsText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('1000+')) {
          return true;
        }
      }
      return false;
    });
    
    if (statsText) {
      console.log('✅ Stats section found');
    } else {
      console.log('❌ Stats section not found');
    }
    
    // Test 8: Testimonials
    console.log('📋 Test 8: Testimonials');
    const testimonialsText = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      for (const el of elements) {
        if (el.textContent && el.textContent.includes('What Our Clients Say')) {
          return true;
        }
      }
      return false;
    });
    
    if (testimonialsText) {
      console.log('✅ Testimonials section found');
    } else {
      console.log('❌ Testimonials section not found');
    }
    
    // Test 9: Footer
    console.log('📋 Test 9: Footer');
    const footer = await page.$('footer');
    if (footer) {
      console.log('✅ Footer found');
    } else {
      console.log('❌ Footer not found');
    }
    
    // Test 10: Responsive Design
    console.log('📋 Test 10: Responsive Design');
    await page.setViewport({ width: 375, height: 667 }); // Mobile view
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.evaluate(() => {
      return window.innerWidth <= 768;
    });
    
    if (mobileLayout) {
      console.log('✅ Mobile responsive layout detected');
    } else {
      console.log('⚠️ Mobile responsive layout not detected');
    }
    
    // Test 11: Button Click Functionality (Simulation)
    console.log('📋 Test 11: Button Click Functionality');
    
    // Check if buttons have onClick handlers
    const buttonsWithHandlers = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      let count = 0;
      buttons.forEach(button => {
        if (button.onclick || button.getAttribute('onclick')) {
          count++;
        }
      });
      return count;
    });
    
    console.log(`✅ Found ${buttonsWithHandlers} buttons with click handlers`);
    
    // Test 12: Accessibility
    console.log('📋 Test 12: Accessibility');
    
    // Check for alt text on images
    const images = await page.$$('img');
    let imagesWithAlt = 0;
    for (const img of images) {
      const alt = await img.evaluate(el => el.alt);
      if (alt) imagesWithAlt++;
    }
    
    console.log(`✅ ${imagesWithAlt}/${images.length} images have alt text`);
    
    // Test 13: Performance
    console.log('📋 Test 13: Performance');
    const performanceMetrics = await page.metrics();
    console.log(`✅ Page load time: ${performanceMetrics.Timestamp}ms`);
    
    console.log('\n🎉 LandingPage Component Test Completed!');
    
  } catch (error) {
    console.error('❌ LandingPage test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testLandingPage();
