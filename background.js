// State management
let hasShownBreakAlert = false;
let lastUrl = location.href;

// Configuration
const CONFIG = {
  userSubscriptions: "https://www.youtube.com/feed/subscriptions",
  scrollThreshold: 200,
  gridItemsPerRow: 2,
  gridItemMaxWidth: '550px'
};

const ALLOWED_PATHS = [
  'https://www.youtube.com/watch',
  'https://www.youtube.com/account',
  'https://www.youtube.com/reporthistory',
  'https://www.youtube.com/paid_memberships?',
  'https://www.youtube.com/feed/playlist',
  'https://www.youtube.com/feed/history',
  'https://www.youtube.com/feed/you',
  'https://www.youtube.com/results?',
  'https://www.youtube.com/feed/channels',
  'https://www.youtube.com/@',
  'https://www.youtube.com/feed/downloads',
  'https://www.youtube.com/playlist?list=WL',
  'https://www.youtube.com/playlist?list=LL',
  CONFIG.userSubscriptions
];

// Check for URLs that do not connect to the user's subscriptions feed and redirect them accordingly. This is to prevent users from getting distracted by other content they might not want to see.
function checkAndRedirect() {
  const currentUrl = window.location.href;
  const isAllowed = ALLOWED_PATHS.some(path => currentUrl.startsWith(path));

  if (window.location.hostname === "www.youtube.com" && !isAllowed) {
    window.location.href = CONFIG.userSubscriptions;
  }
}

// A simple function that displays a page alert when the user has scrolled over 200 videos, notifies them to take a break and refreshes the page.
function disableInfiniteScroll() {
  const displayedVideos = document.querySelectorAll('ytd-rich-item-renderer').length;
  
  if (displayedVideos > CONFIG.scrollThreshold && !hasShownBreakAlert) {
    hasShownBreakAlert = true;
    // Disable scrolling on page and alert user it's time to take a break.
    document.body.style.overflow = 'hidden';
    alert("You've been scrolling for awhile! Now is a good time to take a break. \n\nYour feed will be refreshed once this popup is closed. ");

    // Redirect after alert is dismissed
    window.location.href = CONFIG.userSubscriptions;
  }
}

// A method that removes various elements from the DOM using XPath queries.
function removeDomElements() {
  // A helper method containing the standard payload formatting for sending an item to the DOM via XPath
  function removeByXPath(xpath) {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );

    for (let i = 0; i < result.snapshotLength; i++) {
      result.snapshotItem(i)?.remove();
    }
  }

  // Removes Shorts in search Results and on homepage
  removeByXPath("//span[contains(., 'Shorts')]/ancestor::div[@id='title-container']/ancestor::div[@id='dismissible']");
  removeByXPath("//span[contains(., 'Recently uploaded Shorts')]/ancestor::grid-shelf-view-model"); 

  // Removes some navigational elements in the "You" box in the sidebar
  removeByXPath("//a[contains(., 'Your videos')]");
  removeByXPath("//a[contains(., 'Downloads')]");
  removeByXPath("//div[@id='section-items']//a[contains(., 'Show more')]");

  // Removes the "Subscriptions" box and its sub content from the sidebar
  removeByXPath("//a[contains(., 'Subscriptions')]/ancestor::ytd-guide-section-renderer");

  // Removes the Create button and Notification bell from the overhead navbar
  removeByXPath("//div[@id='end']//span[contains(., 'Create')]/ancestor::button");
  removeByXPath("//button[@id='avatar-btn']/../preceding-sibling::ytd-notification-topbar-button-renderer");

  // Removes the "footer" box and it's sub content from the sidebar
  removeByXPath("//a[contains(., 'Copyright')]/ancestor::div[@id='footer']");
  
  // Removes the hamburger menu from the overhead navbar
  removeByXPath("//div[@id='start']//yt-icon-button[@id='guide-button']");

  // Removes the box containing "Home" and "Shorts" navagational elements from the overhead navbar
  removeByXPath("//a[contains(., 'Home')]/ancestor::ytd-guide-section-renderer");

  // Removes the "Shorts" results field on the search page, as well as individual shorts from the search results.
  removeByXPath("//span[contains(., 'Shorts')]/ancestor::ytd-item-section-renderer//grid-shelf-view-model");
  removeByXPath("//div[contains(., 'SHORTS')]/ancestor::div[@id='dismissible']");

  // Removes the "Explore" box and its sub content from the sidebar
  removeByXPath("//a[contains(., 'Shopping')]/ancestor::ytd-guide-section-renderer");

  // Removes the "More from YouTube" and its sub content from the sidebar
  removeByXPath("//a[contains(., 'YouTube Premium')]/ancestor::ytd-guide-section-renderer");

  // Removes the the comments and watch next sections viewing a video
  removeByXPath("//div[@id='columns']//div[@id='secondary']");
  removeByXPath("//ytd-comments");

  // Sets how many videos are displayed on one line and styles them accordingly in the browsing grind. 
  const gridElement = document.querySelector("#primary ytd-rich-grid-renderer");
  if (gridElement) {
    gridElement.style.setProperty('--ytd-rich-grid-items-per-row', CONFIG.gridItemsPerRow.toString()); // Videos per row is set to 2, which reduces the overall amount of items shown to the viewer.
    gridElement.style.setProperty('--ytd-rich-grid-item-max-width', CONFIG.gridItemMaxWidth); // Scale video thumbnais
  }
}

// Handle URL changes and apply modifications
function handleUrlChange() {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    console.log("URL changed to:", currentUrl);
    checkAndRedirect();
  }
  
  // Call modifying functions.
  removeDomElements();
  disableInfiniteScroll();
}

// Initialize extension
function initialize() {
  checkAndRedirect();
  
  // Initial removal attempt
  removeDomElements();

  // A mutation observer that listens for changes in the DOM and checks if the URL has changed. If it has, the productivity and focus-encouraging commands are run.
  new MutationObserver(handleUrlChange).observe(document, {
    subtree: true, 
    childList: true
  });

  // Event listeners for YouTube navigation
  window.addEventListener('yt-navigate-finish', () => {
    checkAndRedirect();
    removeDomElements();
  });

  window.addEventListener('popstate', () => {
    checkAndRedirect();
    removeDomElements();
  });
}

// Start the extension
initialize();