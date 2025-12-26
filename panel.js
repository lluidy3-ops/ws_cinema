// SCRIPT APENAS PARA O PAINEL DE CONTROLE (UI)
var resourceName = "ws_cinema"; // Fallback
try { resourceName = GetParentResourceName(); } catch (e) { }

$(document).ready(function () {
    window.currentScreen = "Cinema"; // Padrão

    window.addEventListener('message', function (event) {
        if (event.data.action === 'showTicket') {
            var p = document.getElementById("ticket-popup");
            if (p) {
                p.classList.add("visible");
                setTimeout(() => p.classList.remove("visible"), 10000);
            }
        }

        if (event.data.action === 'open') {
            $("#panel-container").fadeIn(300);
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
}

function action(type) {
    const url = $("#video-url").val();
    const screen = window.currentScreen || "Cinema";

    // Feedback visual simples
    if (type === 'play') {
        $(".btn-play").css("transform", "scale(0.95)");
        setTimeout(() => $(".btn-play").css("transform", ""), 100);
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
