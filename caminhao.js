// ============================================================
// CAMINHÃO.JS
// Portal do Motorista
// ============================================================


// ============================================================
// RECUPERAR DADOS DO MOTORISTA
// ============================================================

const cadastroSalvo =
    sessionStorage.getItem("cadastroMotorista");


let dadosMotorista = {};


try {

    dadosMotorista =
        JSON.parse(
            cadastroSalvo || "{}"
        );

} catch (erro) {

    console.error(
        "Erro ao recuperar dados do motorista:",
        erro
    );

    dadosMotorista = {};

}


// Se não houver motorista cadastrado,
// retorna para a primeira página.

if (!dadosMotorista.nome) {

    window.location.href = "index.html";

}


// ============================================================
// ELEMENTOS
// ============================================================

const caminhaoForm =
    document.getElementById("caminhaoForm");


const dtInput =
    document.getElementById("dt");


const transportadoraInput =
    document.getElementById("transportadora");


const placaCavaloInput =
    document.getElementById("placaCavalo");


const placaCarreta01Input =
    document.getElementById("placaCarreta01");


const placaCarreta02Input =
    document.getElementById("placaCarreta02");


const btnVoltar =
    document.getElementById("btnVoltar");


const btnAvancar =
    document.getElementById("btnAvancar");


// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function somenteAlfanumericos(valor) {

    return valor
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");

}


// ============================================================
// FORMATAÇÃO DE PLACA
// ============================================================

function formatarPlaca(valor) {

    return somenteAlfanumericos(valor)
        .substring(0, 7);

}


// ============================================================
// EVENTOS DAS PLACAS
// ============================================================

[
    placaCavaloInput,
    placaCarreta01Input,
    placaCarreta02Input

].forEach(function(input) {

    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function() {

            this.value =
                formatarPlaca(
                    this.value
                );

        }
    );

});


// ============================================================
// RECUPERAR DADOS ANTERIORES
// ============================================================

if (dadosMotorista.dt) {

    dtInput.value =
        dadosMotorista.dt;

}


if (dadosMotorista.transportadora) {

    transportadoraInput.value =
        dadosMotorista.transportadora;

}


if (dadosMotorista.placaCavalo) {

    placaCavaloInput.value =
        dadosMotorista.placaCavalo;

}


if (dadosMotorista.placaCarreta01) {

    placaCarreta01Input.value =
        dadosMotorista.placaCarreta01;

}


if (dadosMotorista.placaCarreta02) {

    placaCarreta02Input.value =
        dadosMotorista.placaCarreta02;

}


// ============================================================
// RECUPERAR TIPO DE VEÍCULO
// ============================================================

if (dadosMotorista.tipoVeiculo) {

    const radioTipo =
        document.querySelector(
            `input[name="tipoVeiculo"][value="${CSS.escape(dadosMotorista.tipoVeiculo)}"]`
        );

    if (radioTipo) {

        radioTipo.checked = true;

    }

}


// ============================================================
// RECUPERAR EMPILHADEIRA
// ============================================================

if (dadosMotorista.empilhadeira) {

    const radioEmpilhadeira =
        document.querySelector(
            `input[name="empilhadeira"][value="${CSS.escape(dadosMotorista.empilhadeira)}"]`
        );

    if (radioEmpilhadeira) {

        radioEmpilhadeira.checked = true;

    }

}


// ============================================================
// VOLTAR
// ============================================================

btnVoltar.addEventListener(
    "click",
    function() {

        window.location.href =
            "index.html";

    }
);


// ============================================================
// ENVIO DO FORMULÁRIO
// ============================================================

caminhaoForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        // ----------------------------------------------------
        // VALIDAÇÃO HTML
        // ----------------------------------------------------

        if (!caminhaoForm.checkValidity()) {

            caminhaoForm.reportValidity();

            return;

        }


        // ----------------------------------------------------
        // RECUPERAR FORMULÁRIO
        // ----------------------------------------------------

        const formData =
            new FormData(
                caminhaoForm
            );


        // ----------------------------------------------------
        // DADOS DO CAMINHÃO
        // ----------------------------------------------------

        const dadosCaminhao = {

            dt:
                String(
                    formData.get("dt") || ""
                ).trim(),


            transportadora:
                String(
                    formData.get("transportadora") || ""
                ).trim(),


            placaCavalo:
                String(
                    formData.get("placaCavalo") || ""
                )
                .trim()
                .toUpperCase(),


            placaCarreta01:
                String(
                    formData.get("placaCarreta01") || ""
                )
                .trim()
                .toUpperCase(),


            placaCarreta02:
                String(
                    formData.get("placaCarreta02") || ""
                )
                .trim()
                .toUpperCase(),


            tipoVeiculo:
                String(
                    formData.get("tipoVeiculo") || ""
                ).trim(),


            empilhadeira:
                String(
                    formData.get("empilhadeira") || ""
                ).trim()

        };


        // ----------------------------------------------------
        // VALIDAÇÕES EXTRAS
        // ----------------------------------------------------

        if (!dadosCaminhao.dt) {

            alert(
                "Informe o número da DT."
            );

            dtInput.focus();

            return;

        }


        if (!dadosCaminhao.transportadora) {

            alert(
                "Informe o nome da transportadora."
            );

            transportadoraInput.focus();

            return;

        }


        if (!dadosCaminhao.placaCavalo) {

            alert(
                "Informe a placa do Cavalo / Truck."
            );

            placaCavaloInput.focus();

            return;

        }


        if (!dadosCaminhao.tipoVeiculo) {

            alert(
                "Selecione o tipo de veículo."
            );

            return;

        }


        if (!dadosCaminhao.empilhadeira) {

            alert(
                "Informe se autoriza a entrada de empilhadeira."
            );

            return;

        }


        // ----------------------------------------------------
        // VALIDAR PLACA DO CAVALO
        // ----------------------------------------------------

        if (
            dadosCaminhao.placaCavalo.length !== 7
        ) {

            alert(
                "A placa do Cavalo / Truck deve possuir 7 caracteres."
            );

            placaCavaloInput.focus();

            return;

        }


        // ----------------------------------------------------
        // VALIDAR CARRETAS, SE PREENCHIDAS
        // ----------------------------------------------------

        if (
            dadosCaminhao.placaCarreta01 &&
            dadosCaminhao.placaCarreta01.length !== 7
        ) {

            alert(
                "A Placa Carreta 01 deve possuir 7 caracteres."
            );

            placaCarreta01Input.focus();

            return;

        }


        if (
            dadosCaminhao.placaCarreta02 &&
            dadosCaminhao.placaCarreta02.length !== 7
        ) {

            alert(
                "A Placa Carreta 02 deve possuir 7 caracteres."
            );

            placaCarreta02Input.focus();

            return;

        }


        // ----------------------------------------------------
        // JUNTAR DADOS
        // ----------------------------------------------------

        const dadosCompletos = {

            ...dadosMotorista,

            ...dadosCaminhao

        };


        // ----------------------------------------------------
        // SALVAR TEMPORARIAMENTE
        // ----------------------------------------------------

        sessionStorage.setItem(
            "cadastroMotorista",
            JSON.stringify(
                dadosCompletos
            )
        );


        // ----------------------------------------------------
        // IR PARA CHECKLIST
        // ----------------------------------------------------

        btnAvancar.disabled = true;

        btnAvancar.textContent =
            "Carregando...";


        window.location.href =
            "checklist.html";

    }
);
