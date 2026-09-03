const params =
    new URLSearchParams(
        window.location.search
    );

const motorista =
    params.get("driver");

if (motorista === "true") {

    window.location.href =
        "index.html";

}
