const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';

async function setupOffscreenDocument(path) {
  if (await chrome.offscreen.hasDocument()) return;
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Background radio playback for VOV Extension'
  });
}

// Intercept messages to forward to offscreen document if necessary or init it
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target === 'background' && message.action === 'init') {
    setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      console.error('Failed to create offscreen document:', err);
      sendResponse({ success: false });
    });
    return true; // Keep channel open for async response
  }
});
