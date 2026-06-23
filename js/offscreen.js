let audioPlayer = document.getElementById('radio-player');
let hls = null;
let currentUrl = '';
let isPlaying = false;

const stations = {
  'vov1': 'https://audio-lss.vov.vn/han/live/vov1/audio/haudio-eng.m3u8',
  'vov2': 'https://audio-lss.vov.vn/han/live/vov2/audio/haudio-eng.m3u8',
  'vov3': 'https://audio-lss.vov.vn/han/live/vov3/audio/haudio-eng.m3u8',
  'vov4': 'https://audio-lss.vov.vn/han/live/vov4/audio/haudio-eng.m3u8',
  'vov5': 'https://media-audio.vov.vn/vov5.sdp_aac/playlist.m3u8',
  'vov6': 'https://audio-lss.vov.vn/han/live/vov6/audio/haudio-eng.m3u8',
  'vov247': 'https://audio-lss.vov.vn/han/live/vov24_7/audio/haudio-eng.m3u8',
  'vovgt': 'https://media-audio.vov.vn/vovGTHN.sdp_aac/playlist.m3u8'
};

function setupAudio(url) {
  currentUrl = url;
  if (Hls.isSupported()) {
    if (hls) {
      hls.destroy();
    }
    // Using simple options to ensure robust playback
    hls = new Hls({ enableWorker: false });
    hls.loadSource(url);
    hls.attachMedia(audioPlayer);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      if (isPlaying) {
         audioPlayer.play().catch(e => console.log('Autoplay prevented', e));
      }
    });
    hls.on(Hls.Events.ERROR, function(evt, data) {
       console.error("HLS Error:", data);
       if (data.fatal) {
           hls.destroy();
       }
    });
  } else if (audioPlayer.canPlayType('application/vnd.apple.mpegurl')) {
    audioPlayer.src = url;
    audioPlayer.addEventListener('loadedmetadata', function() {
      if (isPlaying) {
         audioPlayer.play();
      }
    });
  }
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.target !== 'offscreen') return;

  if (req.action === 'play') {
    let url = stations[req.channel] || stations['vov1'];
    isPlaying = true;
    if (url !== currentUrl || !hls) {
      setupAudio(url);
    } else {
      audioPlayer.play();
    }
    sendResponse({status: 'playing'});
  } 
  else if (req.action === 'pause') {
    isPlaying = false;
    audioPlayer.pause();
    sendResponse({status: 'paused'});
  }
  else if (req.action === 'setVolume') {
    audioPlayer.volume = req.volume;
    sendResponse({status: 'vol_set'});
  }
  else if (req.action === 'status') {
    sendResponse({
      isPlaying: !audioPlayer.paused && currentUrl !== '',
      currentVolume: audioPlayer.volume,
      channelUrl: currentUrl
    });
  }
});
