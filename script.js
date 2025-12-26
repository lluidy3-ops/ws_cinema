document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const initialUrl = urlParams.get('url');
    if (initialUrl) loadVideo(initialUrl);
});

function loadVideo(url) {
    const display = document.getElementById('player-wrapper');
    if (!display) return;
    display.innerHTML = '<div style="color:white; font-family:sans-serif; height:100%; display:flex; align-items:center; justify-content:center;">Carregando Player...</div>';

    const youtubeId = extractYouTubeId(url);
    const vimeoId = extractVimeoId(url);
    const twitchChannel = extractTwitchChannel(url);

    // --- YOUTUBE (MODO DESBLOQUEIO) ---
    // --- YOUTUBE (MODO NO-COOKIE - BURLA ERRO 153) ---
    if (youtubeId) {
        // Usamos o domínio 'youtube-nocookie.com' que é menos restritivo com embeds bloqueados.
        // Adicionamos 'origin' para satisfazer validações básicas de API.
        display.innerHTML = `
            <iframe 
                src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=0&disablekb=1&rel=0&iv_load_policy=3&modestbranding=1&loop=1&playlist=${youtubeId}&enablejsapi=1&origin=https://www.youtube.com" 
                width="100%" 
                height="100%" 
                frameborder="0" 
                allow="autoplay; encrypted-media; gyroscope; picture-in-picture" 
                style="background: black;"
            ></iframe>`;
    }
    // --- VIMEO ---
    else if (vimeoId) {
        display.innerHTML = `
            <iframe 
                src="https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=0&loop=1&autopause=0&background=1" 
                width="100%" height="100%" frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture" 
                allowfullscreen
            ></iframe>`;
    }
    // --- TWITCH ---
    else if (twitchChannel) {
        // Correção Twitch: parent=localhost é o padrão para FiveM
        display.innerHTML = `
            <iframe 
                src="https://player.twitch.tv/?channel=${twitchChannel}&parent=localhost&autoplay=true&muted=false" 
                width="100%" height="100%" frameborder="0" 
                allowfullscreen
            ></iframe>`;
    }
    // --- MP4 / OUTROS ---
    else {
        display.innerHTML = `
            <video autoplay loop style="width:100%; height:100%; object-fit:cover;">
                <source src="${url}" type="video/mp4">
            </video>`;
    }
}

// --- COMUNICAÇÃO COM FIVEM (DUI MESSAGE) ---
window.addEventListener('message', function (event) {
    var data = event.data;

    // Se a mensagem for para mudar volume
    if (data.type === 'setVolume') {
        var volPercent = data.volume; // 0 a 100

        // --- DEBUG VISUAL ---
        document.body.style.border = "10px solid red";
        setTimeout(function () { document.body.style.border = "none"; }, 200);

        // 1. Tenta mudar volume de vídeo nativo (MP4)
        var vid = document.querySelector('video');
        if (vid) vid.volume = volPercent / 100;

        // 2. Tenta mudar volume do YouTube / Twitch via API
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            try {
                // YouTube API
                frames[i].contentWindow.postMessage(JSON.stringify({
                    "event": "command",
                    "func": "setVolume",
                    "args": [volPercent]
                }), '*');

                // Twitch API (eles usam setVolume(0.5))
                // Nota: Twitch embed pode ter restrições, mas tentamos mesmo assim
            } catch (e) { }
        }
    }
});

function extractYouTubeId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
function extractVimeoId(url) {
    if (!url) return null;
    const regExp = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}
function extractTwitchChannel(url) {
    if (!url) return null;
    const regExp = /twitch\.tv\/([a-zA-Z0-9_]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}
