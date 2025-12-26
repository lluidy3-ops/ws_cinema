// V3 - FIXED ENGLISH VERSION - DO NOT TRANSLATE TO PORTUGUESE
// Este arquivo deve permanecer em inglês para funcionar corretamente.

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const initialUrl = urlParams.get('url');
    if (initialUrl) loadVideo(initialUrl);

    // Initial check for volume
    checkHashVolume();
});

// DETECTOR DE MUDANÇA DE VOLUME (HASH)
window.addEventListener("hashchange", function () {
    checkHashVolume();
});

function checkHashVolume() {
    // Lê o que está depois do # (ex: #vol=50)
    var hash = window.location.hash.substring(1);
    if (hash.startsWith('vol=')) {
        var volPercent = parseInt(hash.split('=')[1]);
        if (!isNaN(volPercent)) {
            setVolume(volPercent);
        }
    }
}

function setVolume(volPercent) {
    // 1. Vídeo nativo
    var vid = document.querySelector('video');
    if (vid) vid.volume = volPercent / 100;

    // 2. YouTube / Twitch API
    var frames = document.getElementsByTagName('iframe');
    for (var i = 0; i < frames.length; i++) {
        try {
            // YouTube
            frames[i].contentWindow.postMessage(JSON.stringify({
                "event": "command",
                "func": "setVolume",
                "args": [volPercent]
            }), '*');
        } catch (e) { }
    }
}

function loadVideo(url) {
    const display = document.getElementById('player-wrapper');
    if (!display) return;
    display.innerHTML = '<div style="color:white; font-family:sans-serif; height:100%; display:flex; align-items:center; justify-content:center;">Carregando Player...</div>';

    const youtubeId = extractYouTubeId(url);
    const twitchChannel = extractTwitchChannel(url);

    // --- YOUTUBE NO-COOKIE ---
    if (youtubeId) {
        display.innerHTML = `
            <iframe 
                src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=0&disablekb=1&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${youtubeId}&enablejsapi=1&origin=${window.location.origin}" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
                style="background: black;"
            ></iframe>`;
    }
    // --- TWITCH ---
    else if (twitchChannel) {
        display.innerHTML = `
            <iframe 
                src="https://player.twitch.tv/?channel=${twitchChannel}&parent=localhost&autoplay=true&muted=false" 
                width="100%" height="100%" frameborder="0" 
                allowfullscreen
            ></iframe>`;
    }
    // --- MP4 ---
    else {
        display.innerHTML = `
            <video autoplay loop style="width:100%; height:100%; object-fit:cover;">
            <source src="${url}" type="video/mp4">
            </video>`;
    }
}

function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
function extractVimeoId(url) { return null; }
function extractTwitchChannel(url) {
    if (!url) return null;
    const regExp = /twitch\.tv\/([a-zA-Z0-9_]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}
