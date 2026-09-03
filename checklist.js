const checklistForm =
    document.getElementById(
        "checklistForm"
    );

const dadosExistentes =
    JSON.parse(
        sessionStorage.getItem(
            "cadastroMotorista"
        ) || "{}"
    );

if (!dadosExistentes.nome) {
    window.location.href =
        "index.html";
}


// ============================================================
// ENVIO
// ============================================================

checklistForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const formData =
            new FormData(
                checklistForm
            );

        const dadosChecklist = {

            limpo:
                formData.get("limpo"),

            odores:
                formData.get("odores"),

            umidade:
                formData.get("umidade"),

            objetos:
                formData.get("objetos"),

            piso:
                formData.get("piso"),

            reguas:
                formData.get("reguas"),

            laterais:
                formData.get("laterais"),

            teto:
                formData.get("teto"),

            vigas:
                formData.get("vigas"),

            farois:
                formData.get("farois"),

            luzes:
                formData.get("luzes"),

            sirene:
                formData.get("sirene"),

            madeirites:
                formData.get("madeirites"),

            extintor:
                formData.get("extintor"),

            paralamas:
                formData.get("paralamas"),

            pneus:
                formData.get("pneus"),

            espelhos:
                formData.get("espelhos"),

            parachoque:
                formData.get("parachoque")
        };

        const dadosCompletos = {
            ...dadosExistentes,
            ...dadosChecklist
        };

        sessionStorage.setItem(
            "cadastroMotorista",
            JSON.stringify(
                dadosCompletos
            )
        );

        window.location.href =
            "confirmacao.html";
    }
);
