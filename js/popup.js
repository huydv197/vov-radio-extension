let isPlaying = false;

const playBtn = document.getElementById('play-pause-btn');
const iconPlay = document.getElementById('icon-play');
const iconPause = document.getElementById('icon-pause');
const volumeSlider = document.getElementById('volume-slider');
const channelSelect = document.getElementById('channel-select');
const visualizer = document.getElementById('visualizer');
const statusText = document.getElementById('status-text');
const statusDot = document.getElementById('status-dot');

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const donateBtn = document.getElementById('donate-btn');
const donateModal = document.getElementById('donate-modal');
const closeDonateBtn = document.getElementById('close-donate-btn');
const donateCopy = document.getElementById('donate-copy');

const savedTheme = localStorage.getItem('vov-theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.dataset.theme = 'dark';
  updateThemeIcon('dark');
} else {
  updateThemeIcon('light');
}

function updateThemeIcon(theme) {
  if (theme === 'dark') {
     themeIcon.innerHTML = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>';
  } else {
     themeIcon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
  }
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.dataset.theme;
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  if (newTheme === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  } else {
    delete document.documentElement.dataset.theme;
  }
  localStorage.setItem('vov-theme', newTheme);
  updateThemeIcon(newTheme);
});

donateBtn.addEventListener('click', () => {
  donateModal.classList.remove('hidden');
});

closeDonateBtn.addEventListener('click', () => {
  donateModal.classList.add('hidden');
});

donateModal.addEventListener('click', (e) => {
  if (e.target === donateModal) {
    donateModal.classList.add('hidden');
  }
});

donateCopy.addEventListener('click', () => {
  const txt = donateCopy.dataset.copy;
  navigator.clipboard.writeText(txt).then(() => {
    const original = donateCopy.innerHTML;
    donateCopy.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => { donateCopy.innerHTML = original; }, 1500);
  });
});

async function init() {
  await chrome.runtime.sendMessage({ target: 'background', action: 'init' });
  
  try {
     const res = await chrome.runtime.sendMessage({ target: 'offscreen', action: 'status' });
     if (res) {
         isPlaying = res.isPlaying;
         volumeSlider.value = res.currentVolume;
         // Note: Mapping the exact URL back to the select dropdown can be done via local storage state in a full app.
         // Here we just restore UI state.
         updateUI();
     }
  } catch(e) {
     console.log('Offscreen not ready', e);
  }
}

function updateUI() {
  if (isPlaying) {
    iconPlay.classList.add('hidden');
    iconPause.classList.remove('hidden');
    visualizer.classList.add('active');
    statusText.textContent = `Đang phát (${channelSelect.options[channelSelect.selectedIndex].text})`;
    statusDot.classList.add('playing');
  } else {
    iconPlay.classList.remove('hidden');
    iconPause.classList.add('hidden');
    visualizer.classList.remove('active');
    statusText.textContent = 'Đang dừng';
    statusDot.classList.remove('playing');
  }
}

playBtn.addEventListener('click', async () => {
  if (isPlaying) {
    await chrome.runtime.sendMessage({ target: 'offscreen', action: 'pause' });
    isPlaying = false;
  } else {
    await chrome.runtime.sendMessage({ 
      target: 'offscreen', 
      action: 'play', 
      channel: channelSelect.value 
    });
    isPlaying = true;
  }
  updateUI();
});

channelSelect.addEventListener('change', async () => {
  if (isPlaying) {
    statusText.textContent = 'Đang tải...';
    await chrome.runtime.sendMessage({ 
      target: 'offscreen', 
      action: 'play', 
      channel: channelSelect.value 
    });
    updateUI();
  }
});

volumeSlider.addEventListener('input', async () => {
  try {
    await chrome.runtime.sendMessage({ 
      target: 'offscreen', 
      action: 'setVolume', 
      volume: parseFloat(volumeSlider.value)
    });
  } catch(err) {}
});

init();
