const audio = document.getElementById("backgroundMusic");

window.addEventListener("load", function () {

    audio.play().catch(function (error) {
    console.log("La reproducción automática fue bloqueada: ", error);

    document.addEventListener(
        "click",

        function () {
        audio.play().catch(function (error) {
                console.log("Error al reproducir después del click: ", error);
        });
    },
    { once: true }
    );
});
});

document.addEventListener("click", function () {
    if (audio.paused) {
    audio.play().catch(function (error) {
        console.log("Error al reproducir después del click: ", error);
    });
}
});
