// SCRIPT APENAS PARA O PAINEL DE CONTROLE (UI)
var resourceName = "ws_cinema"; // Fallback
try { resourceName = GetParentResourceName(); } catch (e) { }

function updateBadge(screen, isActive) {
    const el = $(`#badge-${screen}`);
    if (isActive) {
        el.text("ONLINE").css({
            "background": "rgba(0, 255, 128, 0.2)",
            "color": "#00ff80",
            "border": "1px solid rgba(0, 255, 128, 0.3)"
        });
    } else {
        el.text("OFFLINE").css({
            "background": "rgba(255, 255, 255, 0.1)",
            "color": "rgba(255, 255, 255, 0.5)",
            "border": "none"
        });
    }
}

$(document).ready(function () {
    window.currentScreen = "Cinema"; // Padrão

    window.addEventListener('message', function (event) {
        var item = event.data;
        // TICKET POPUP
        if (item.type === 'ticket' || item.action === 'showTicket') {
            var p = document.getElementById("ticket-popup");
            if (p) {
                p.classList.add("visible");
                setTimeout(() => p.classList.remove("visible"), 10000);
            }
        }
        // PAINEL OPEN
        else if (item.type === 'open') {
            $("#panel-container").fadeIn(300).css('display', 'flex');
            if (item.status) {
                updateBadge("Cinema", item.status.Cinema);
                updateBadge("Praia", item.status.Praia);
            }
            if (item.volumes) {
                window.screenVolumes = item.volumes; // Salvar para troca de tela
                const currentVol = item.volumes[window.currentScreen] || 100;
                $("#volume-slider").val(currentVol);
                $("#volume-value").text(currentVol + "%");
            }
        }
        // PAINEL CLOSE
        else if (item.type === 'close') {
            closePanel();
        }
    });

    document.onkeyup = function (data) {
        if (data.which == 27) { // ESC
            closePanel();
        }
    };
});

function selectScreen(name, element) {
    if (!name) return;
    window.currentScreen = name;
    $(".screen-card").removeClass("active");
    $(element).addClass("active");

    // Atualizar Slider com Volume da Tela Selecionada
    if (window.screenVolumes) {
        const vol = window.screenVolumes[name] || 100;
        $("#volume-slider").val(vol);
        $("#volume-value").text(vol + "%");
    }
}

function action(type) {
    const url = $("#video-url").val();
    const screen = window.currentScreen || "Cinema";

    // Validação para play
    if (type === 'play') {
        if (!url || url.trim() === "") {
            alert("Digite uma URL de vídeo válida!");
            return;
        }
        $(".btn-play").css("transform", "scale(0.95)");
        setTimeout(() => $(".btn-play").css("transform", ""), 100);
        // Atualiza badge para ONLINE
        updateBadge(screen, true);
    }

    if (type === 'stop') {
        // Atualiza badge para OFFLINE
        updateBadge(screen, false);
    }

    $.post(`https://${resourceName}/action`, JSON.stringify({
        type: type,
        screen: screen,
        url: url
    }));
}

function closePanel() {
    $("#panel-container").fadeOut(200);
    $.post(`https://${resourceName}/close`, JSON.stringify({}));
}

// Wrapper Functions para o novo HTML
function playVideo() { action('play'); }
function sendAction(type) { action(type); }

function updateVolume(val) {
    const screen = window.currentScreen || "Cinema";

    // Atualiza visual (garantia)
    $("#volume-value").text(val + "%");

    $.post(`https://${resourceName}/action`, JSON.stringify({
        type: 'volume',
        screen: screen,
        volume: parseInt(val)
    }));
}
