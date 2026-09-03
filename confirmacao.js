/* ============================================================
   CONFIRMAÇÃO DO CADASTRO
   Portal do Motorista - Suzano Maracanaú

   Fluxo:
   Motorista → Caminhão → Checklist → Confirmação → Finalização

   A assinatura é representada por um carimbo digital.
   O carimbo SOMENTE aparece depois que o motorista clica
   na área de assinatura.
============================================================ */

const URL_PLANILHA =
    "https://script.google.com/macros/s/AKfycbwl2NEFu2qYpUetza9PNy13GXIrdh3GcTkhYpOmTnMZVn13HxaEI8tqPy6quYFXvTYJaw/exec";


/* ============================================================
   ESTADO DA PÁGINA
============================================================ */

let dadosCadastro = {};
let assinaturaConfirmada = false;


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    inicializarPagina();
});


function inicializarPagina() {
    carregarDadosCadastro();

    configurarBotoes();

    renderizarPagina();

    atualizarBotaoEnviar();
}


/* ============================================================
   CARREGAR DADOS DO SESSION STORAGE
============================================================ */

function carregarDadosCadastro() {

    const chaves = [
        "dadosCadastro",
        "cadastro",
        "dadosMotorista",
        "motoristaCadastro",
        "formularioCadastro"
    ];

    let encontrado = null;

    for (const chave of chaves) {

        const valor = sessionStorage.getItem(chave);

        if (!valor) {
            continue;
        }

        try {

            const objeto = JSON.parse(valor);

            if (
                objeto &&
                typeof objeto === "object" &&
                (
                    objeto.nome ||
                    objeto.cpf ||
                    objeto.placaCavalo ||
                    objeto.dt
                )
            ) {
                encontrado = objeto;
                break;
            }

        } catch (erro) {
            console.warn(
                `Não foi possível interpretar ${chave}:`,
                erro
            );
        }
    }


    /*
       Caso não tenha encontrado pelas chaves conhecidas,
       procura automaticamente entre os itens do sessionStorage.
    */

    if (!encontrado) {

        for (let i = 0; i < sessionStorage.length; i++) {

            const chave = sessionStorage.key(i);

            if (!chave) {
                continue;
            }

            try {

                const valor = sessionStorage.getItem(chave);

                if (!valor) {
                    continue;
                }

                const objeto = JSON.parse(valor);

                if (
                    objeto &&
                    typeof objeto === "object" &&
                    (
                        objeto.nome ||
                        objeto.cpf ||
                        objeto.placaCavalo ||
                        objeto.dt
                    )
                ) {
                    encontrado = objeto;
                    break;
                }

            } catch (erro) {
                // Ignora valores que não sejam JSON.
            }
        }
    }


    if (encontrado) {
        dadosCadastro = normalizarDados(encontrado);
    } else {
        dadosCadastro = {};
    }
}


/* ============================================================
   NORMALIZAÇÃO DOS DADOS
============================================================ */

function normalizarDados(dados) {

    dados = dados || {};

    return {

        /* MOTORISTA */

        nome: dados.nome || "",

        celular:
            dados.celular ||
            dados.telefone ||
            "",

        cpf:
            dados.cpf ||
            "",

        cnh:
            dados.cnh ||
            "",

        validadeCnh:
            dados.validadeCnh ||
            dados.validadeCNH ||
            "",

        calcado:
            normalizarSimNao(dados.calcado),

        trajes:
            normalizarSimNao(dados.trajes),

        colete:
            normalizarSimNao(dados.colete),

        comprovei:
            normalizarSimNao(dados.comprovei),


        /* CAMINHÃO */

        dt:
            dados.dt ||
            "",

        transportadora:
            dados.transportadora ||
            dados.nomeTransportadora ||
            "",

        placaCavalo:
            dados.placaCavalo ||
            dados.placa ||
            "",

        placaCarreta01:
            dados.placaCarreta01 ||
            "",

        placaCarreta02:
            dados.placaCarreta02 ||
            "",

        tipoVeiculo:
            dados.tipoVeiculo ||
            "",

        empilhadeira:
            normalizarSimNao(dados.empilhadeira),


        /* CHECKLIST */

        limpo:
            normalizarSimNao(dados.limpo),

        odores:
            normalizarSimNao(
                dados.odores ||
                dados.odores
            ),

        umidade:
            normalizarSimNao(dados.umidade),

        objetos:
            normalizarSimNao(dados.objetos),

        piso:
            normalizarSimNao(dados.piso),

        reguas:
            normalizarSimNao(dados.reguas),

        laterais:
            normalizarSimNao(dados.laterais),

        teto:
            normalizarSimNao(dados.teto),

        vigas:
            normalizarSimNao(dados.vigas),

        farois:
            normalizarSimNao(dados.farois),

        luzes:
            normalizarSimNao(dados.luzes),

        sirene:
            normalizarSimNao(dados.sirene),

        madeirites:
            normalizarSimNao(dados.madeirites),

        extintor:
            normalizarSimNao(dados.extintor),

        paralamas:
            normalizarSimNao(dados.paralamas),

        pneus:
            normalizarSimNao(dados.pneus),

        espelhos:
            normalizarSimNao(dados.espelhos),

        parachoque:
            normalizarSimNao(dados.parachoque),


        /* CONTROLE */

        assinatura:
            dados.assinatura || "",

        assinaturaPontos:
            dados.assinaturaPontos || null,

        dataHora:
            dados.dataHora || "",

        dataAssinatura:
            dados.dataAssinatura || "",

        linha:
            dados.linha || null
    };
}


/* ============================================================
   BOTÕES
============================================================ */

function configurarBotoes() {

    const btnEditar =
        document.getElementById("btnEditarRespostas");

    const btnCancelar =
        document.getElementById("btnCancelarEdicao");

    const btnSalvar =
        document.getElementById("btnSalvarEdicao");

    const btnVoltar =
        document.getElementById("btnVoltar");

    const btnEnviar =
        document.getElementById("btnEnviar");

    const btnRemover =
        document.getElementById("removerAssinatura");


    if (btnEditar) {
        btnEditar.addEventListener(
            "click",
            ativarModoEdicao
        );
    }


    if (btnCancelar) {
        btnCancelar.addEventListener(
            "click",
            cancelarEdicao
        );
    }


    if (btnSalvar) {
        btnSalvar.addEventListener(
            "click",
            salvarEdicao
        );
    }


    if (btnVoltar) {
        btnVoltar.addEventListener(
            "click",
            voltarPagina
        );
    }


    if (btnEnviar) {
        btnEnviar.addEventListener(
            "click",
            finalizarCadastro
        );
    }


    if (btnRemover) {
        btnRemover.addEventListener(
            "click",
            removerAssinatura
        );
    }


    /*
       Configura a assinatura separadamente.
       Isso substitui a antiga chamada inexistente
       "configurarAssinatura()".
    */

    configurarCarimbo();
}


/* ============================================================
   CONFIGURAÇÃO DO CARIMBO
============================================================ */

function configurarCarimbo() {

    const stampBox =
        document.getElementById("stampBox");

    const carimbo =
        document.getElementById("carimbo");

    const placeholder =
        document.getElementById("stampPlaceholder");

    const assinaturaRealizada =
        document.getElementById("assinaturaRealizada");

    const remover =
        document.getElementById("removerAssinatura");


    if (!stampBox || !carimbo) {
        console.warn(
            "Área de assinatura não encontrada."
        );

        return;
    }


    /*
       Estado inicial:
       NÃO existe assinatura.
       O carimbo fica escondido.
    */

    assinaturaConfirmada = false;

    carimbo.classList.add("hidden");
    carimbo.style.display = "none";


    if (placeholder) {
        placeholder.classList.remove("hidden");
        placeholder.style.display = "";
    }


    if (assinaturaRealizada) {
        assinaturaRealizada.classList.add("hidden");
    }


    if (remover) {
        remover.classList.add("hidden");
    }


    /*
       Remove listeners antigos para evitar
       múltiplos disparos caso a função seja chamada novamente.
    */

    const novoStampBox =
        stampBox.cloneNode(true);

    stampBox.parentNode.replaceChild(
        novoStampBox,
        stampBox
    );


    const area =
        document.getElementById("stampBox");


    /*
       Clique do mouse / toque.
    */

    area.addEventListener(
        "click",
        () => {
            confirmarAssinatura();
        }
    );


    /*
       Permite também usar Enter ou Espaço
       quando a área estiver focada.
    */

    area.addEventListener(
        "keydown",
        (evento) => {

            if (
                evento.key === "Enter" ||
                evento.key === " "
            ) {

                evento.preventDefault();

                confirmarAssinatura();
            }
        }
    );
}


/* ============================================================
   CONFIRMAR ASSINATURA
============================================================ */

function confirmarAssinatura() {

    const dados =
        obterDadosCadastro();


    if (!dados.nome) {

        mostrarMensagem(
            "Não foi possível identificar o nome do motorista.",
            "error"
        );

        return;
    }


    if (assinaturaConfirmada) {
        return;
    }


    assinaturaConfirmada = true;


    const agora =
        new Date();


    const dataAssinatura =
        formatarDataAtual(agora);


    const carimbo =
        document.getElementById("carimbo");

    const placeholder =
        document.getElementById("stampPlaceholder");

    const nome =
        document.getElementById("carimboNome");

    const cpf =
        document.getElementById("carimboCPF");

    const data =
        document.getElementById("carimboData");

    const realizada =
        document.getElementById("assinaturaRealizada");

    const remover =
        document.getElementById("removerAssinatura");

    const stampBox =
        document.getElementById("stampBox");


    /*
       Preenche o carimbo SOMENTE agora.
    */

    if (nome) {
        nome.textContent =
            dados.nome || "Nome do motorista";
    }


    if (cpf) {
        cpf.textContent =
            dados.cpf
                ? `CPF: ${dados.cpf}`
                : "CPF não informado";
    }


    if (data) {
        data.textContent =
            dataAssinatura;
    }


    /*
       Esconde o texto inicial.
    */

    if (placeholder) {
        placeholder.classList.add("hidden");
    }


    /*
       Mostra o carimbo.
    */

    if (carimbo) {

        carimbo.classList.remove("hidden");

        carimbo.style.display = "block";


        /*
           Reinicia a animação.
        */

        carimbo.style.animation = "none";

        void carimbo.offsetWidth;

        carimbo.style.animation =
            "baterCarimbo 0.18s ease-out forwards";
    }


    /*
       Mostra confirmação.
    */

    if (realizada) {
        realizada.classList.remove("hidden");
    }


    /*
       Mostra botão de remoção.
    */

    if (remover) {
        remover.classList.remove("hidden");
    }


    /*
       Marca visualmente a área.
    */

    if (stampBox) {
        stampBox.classList.add(
            "assinatura-confirmada"
        );
    }


    /*
       Guarda o estado somente na memória.
       A data oficial será gerada pelo Apps Script
       no momento do cadastro.
    */

    dadosCadastro.assinatura =
        "ASSINADO DIGITALMENTE";

    dadosCadastro.assinaturaConfirmada =
        true;


    atualizarBotaoEnviar();


    mostrarMensagem(
        "Assinatura confirmada. Você já pode finalizar o cadastro.",
        "success"
    );
}


/* ============================================================
   REMOVER ASSINATURA
============================================================ */

function removerAssinatura() {

    assinaturaConfirmada = false;


    const carimbo =
        document.getElementById("carimbo");

    const placeholder =
        document.getElementById("stampPlaceholder");

    const realizada =
        document.getElementById("assinaturaRealizada");

    const remover =
        document.getElementById("removerAssinatura");

    const stampBox =
        document.getElementById("stampBox");


    if (carimbo) {

        carimbo.classList.add("hidden");

        carimbo.style.display = "none";
    }


    if (placeholder) {

        placeholder.classList.remove("hidden");

        placeholder.style.display = "";
    }


    if (realizada) {
        realizada.classList.add("hidden");
    }


    if (remover) {
        remover.classList.add("hidden");
    }


    if (stampBox) {
        stampBox.classList.remove(
            "assinatura-confirmada"
        );
    }


    dadosCadastro.assinatura =
        "";

    dadosCadastro.assinaturaConfirmada =
        false;


    atualizarBotaoEnviar();


    mostrarMensagem(
        "Assinatura removida. Clique novamente na área para assinar.",
        "info"
    );
}


/* ============================================================
   RENDERIZAÇÃO GERAL
============================================================ */

function renderizarPagina() {

    renderizarResumo();

    preencherFormularioEdicao();

    configurarCarimbo();

    atualizarBotaoEnviar();
}


/* ============================================================
   RESUMO
============================================================ */

function renderizarResumo() {

    const container =
        document.getElementById("resumoCadastro");


    if (!container) {
        return;
    }


    const dados =
        obterDadosCadastro();


    container.innerHTML = `

        <div class="review-panels">

            <!-- MOTORISTA -->

            <div class="review-panel">

                <div class="review-panel-header">
                    <h3>Motorista</h3>
                </div>

                <div class="review-grid">

                    ${gerarCardResposta(
                        "Nome completo",
                        dados.nome
                    )}

                    ${gerarCardResposta(
                        "Celular",
                        dados.celular
                    )}

                    ${gerarCardResposta(
                        "CPF",
                        dados.cpf
                    )}

                    ${gerarCardResposta(
                        "CNH",
                        dados.cnh
                    )}

                    ${gerarCardResposta(
                        "Validade CNH",
                        formatarDataExibicao(
                            dados.validadeCnh
                        )
                    )}

                    ${gerarCardSimNao(
                        "Calçado de Segurança",
                        dados.calcado
                    )}

                    ${gerarCardSimNao(
                        "Trajes",
                        dados.trajes
                    )}

                    ${gerarCardSimNao(
                        "Colete Refletivo",
                        dados.colete
                    )}

                    ${gerarCardSimNao(
                        "App Comprovei",
                        dados.comprovei
                    )}

                </div>

            </div>


            <!-- CAMINHÃO -->

            <div class="review-panel">

                <div class="review-panel-header">
                    <h3>Caminhão</h3>
                </div>

                <div class="review-grid">

                    ${gerarCardResposta(
                        "DT",
                        dados.dt
                    )}

                    ${gerarCardResposta(
                        "Transportadora",
                        dados.transportadora
                    )}

                    ${gerarCardResposta(
                        "Placa Cavalo / Truck",
                        dados.placaCavalo
                    )}

                    ${gerarCardResposta(
                        "Placa Carreta 01",
                        dados.placaCarreta01
                    )}

                    ${gerarCardResposta(
                        "Placa Carreta 02",
                        dados.placaCarreta02
                    )}

                    ${gerarCardResposta(
                        "Tipo de Veículo",
                        dados.tipoVeiculo
                    )}

                    ${gerarCardSimNao(
                        "Autoriza Entrada de Empilhadeira",
                        dados.empilhadeira
                    )}

                </div>

            </div>


            <!-- CHECKLIST -->

            <div class="review-panel review-panel-full">

                <div class="review-panel-header">
                    <h3>Checklist do veículo</h3>
                </div>

                <div class="review-grid">

                    ${gerarCardSimNao(
                        "Limpo e sem resíduo",
                        dados.limpo
                    )}

                    ${gerarCardSimNao(
                        "Isento de odores estranhos",
                        dados.odores
                    )}

                    ${gerarCardSimNao(
                        "Isento de umidade ou vazamento",
                        dados.umidade
                    )}

                    ${gerarCardSimNao(
                        "Isento de objetos pontiagudos",
                        dados.objetos
                    )}

                    ${gerarCardSimNao(
                        "Piso reto e sem furos",
                        dados.piso
                    )}

                    ${gerarCardSimNao(
                        "Réguas retas sem protuberância",
                        dados.reguas
                    )}

                    ${gerarCardSimNao(
                        "Laterais sem furos ou rasgos",
                        dados.laterais
                    )}

                    ${gerarCardSimNao(
                        "Teto sem furo ou rasgos",
                        dados.teto
                    )}

                    ${gerarCardSimNao(
                        "Vigas do teto sem risco de corte",
                        dados.vigas
                    )}

                    ${gerarCardSimNao(
                        "Faróis",
                        dados.farois
                    )}

                    ${gerarCardSimNao(
                        "Luzes e lanternas",
                        dados.luzes
                    )}

                    ${gerarCardSimNao(
                        "Sirene de ré",
                        dados.sirene
                    )}

                    ${gerarCardSimNao(
                        "Madeirites e Lona",
                        dados.madeirites
                    )}

                    ${gerarCardSimNao(
                        "Extintor de Incêndio",
                        dados.extintor
                    )}

                    ${gerarCardSimNao(
                        "Paralamas",
                        dados.paralamas
                    )}

                    ${gerarCardSimNao(
                        "Pneus de rodagem e step",
                        dados.pneus
                    )}

                    ${gerarCardSimNao(
                        "Espelhos retrovisores",
                        dados.espelhos
                    )}

                    ${gerarCardSimNao(
                        "Para-choque",
                        dados.parachoque
                    )}

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   CARDS DO RESUMO
============================================================ */

function gerarCardResposta(
    titulo,
    valor
) {

    const valorFinal =
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ""
            ? escapeHTML(String(valor))
            : "Não informado";


    return `

        <div class="review-card">

            <span class="review-label">
                ${escapeHTML(titulo)}
            </span>

            <strong class="review-value">
                ${valorFinal}
            </strong>

        </div>
    `;
}


function gerarCardSimNao(
    titulo,
    valor
) {

    const normalizado =
        normalizarSimNao(valor);


    let classe = "nao-informado";

    let texto = "Não informado";


    if (normalizado === "Sim") {

        classe = "sim";

        texto = "Sim";

    } else if (normalizado === "Não") {

        classe = "nao";

        texto = "Não";
    }


    return `

        <div class="review-card">

            <span class="review-label">
                ${escapeHTML(titulo)}
            </span>

            <strong
                class="review-value resposta-sim-nao ${classe}"
            >
                ${texto}
            </strong>

        </div>
    `;
}


/* ============================================================
   MODO DE EDIÇÃO
============================================================ */

function ativarModoEdicao() {

    const resumo =
        document.getElementById("resumoCadastro");

    const modo =
        document.getElementById("modoEdicao");


    if (!modo) {
        return;
    }


    preencherFormularioEdicao();


    if (resumo) {
        resumo.style.display = "none";
    }


    modo.classList.add("ativo");


    modo.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* ============================================================
   PREENCHER FORMULÁRIO DE EDIÇÃO
============================================================ */

function preencherFormularioEdicao() {

    const dados =
        obterDadosCadastro();


    definirValor(
        "editNome",
        dados.nome
    );

    definirValor(
        "editCelular",
        dados.celular
    );

    definirValor(
        "editCPF",
        dados.cpf
    );

    definirValor(
        "editCNH",
        dados.cnh
    );

    definirValor(
        "editValidadeCnh",
        converterDataParaInput(
            dados.validadeCnh
        )
    );


    definirSelect(
        "editCalcado",
        dados.calcado
    );

    definirSelect(
        "editTrajes",
        dados.trajes
    );

    definirSelect(
        "editColete",
        dados.colete
    );

    definirSelect(
        "editComprovei",
        dados.comprovei
    );


    definirValor(
        "editDt",
        dados.dt
    );

    definirValor(
        "editTransportadora",
        dados.transportadora
    );

    definirValor(
        "editPlacaCavalo",
        dados.placaCavalo
    );

    definirValor(
        "editPlacaCarreta01",
        dados.placaCarreta01
    );

    definirValor(
        "editPlacaCarreta02",
        dados.placaCarreta02
    );

    definirValor(
        "editTipoVeiculo",
        dados.tipoVeiculo
    );


    definirSelect(
        "editEmpilhadeira",
        dados.empilhadeira
    );


    renderizarCamposChecklistEdicao();
}


/* ============================================================
   CAMPOS DO CHECKLIST
============================================================ */

function renderizarCamposChecklistEdicao() {

    const container =
        document.getElementById(
            "camposChecklistEdicao"
        );


    if (!container) {
        return;
    }


    const dados =
        obterDadosCadastro();


    const campos = [

        ["limpo", "Limpo e sem resíduo?"],

        [
            "odores",
            "Isento de odores estranhos?"
        ],

        [
            "umidade",
            "Isento de umidade ou vazamento?"
        ],

        [
            "objetos",
            "Isento de objetos pontiagudos?"
        ],

        [
            "piso",
            "Piso reto e sem furos?"
        ],

        [
            "reguas",
            "Réguas retas sem protuberância?"
        ],

        [
            "laterais",
            "Laterais sem furos ou rasgos?"
        ],

        [
            "teto",
            "Teto sem furo ou rasgos?"
        ],

        [
            "vigas",
            "Vigas do teto sem risco de corte?"
        ],

        [
            "farois",
            "Faróis?"
        ],

        [
            "luzes",
            "Luzes e lanternas?"
        ],

        [
            "sirene",
            "Sirene de ré?"
        ],

        [
            "madeirites",
            "Madeirites e Lona?"
        ],

        [
            "extintor",
            "Extintor de Incêndio?"
        ],

        [
            "paralamas",
            "Paralamas?"
        ],

        [
            "pneus",
            "Pneus de rodagem e step?"
        ],

        [
            "espelhos",
            "Espelhos retrovisores?"
        ],

        [
            "parachoque",
            "Para-choque?"
        ]
    ];


    container.innerHTML = `

        <div class="grid-edicao">

            ${campos.map(
                ([chave, label]) => {

                    const valor =
                        normalizarSimNao(
                            dados[chave]
                        );


                    return `

                        <div class="campo-edicao">

                            <label for="edit_${chave}">
                                ${escapeHTML(label)}
                            </label>

                            <select id="edit_${chave}">

                                <option value="">
                                    Selecione
                                </option>

                                <option
                                    value="Sim"
                                    ${
                                        valor === "Sim"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Sim
                                </option>

                                <option
                                    value="Não"
                                    ${
                                        valor === "Não"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Não
                                </option>

                            </select>

                        </div>
                    `;
                }
            ).join("")}

        </div>
    `;
}


/* ============================================================
   CANCELAR EDIÇÃO
============================================================ */

function cancelarEdicao() {

    const resumo =
        document.getElementById("resumoCadastro");

    const modo =
        document.getElementById("modoEdicao");


    if (modo) {
        modo.classList.remove("ativo");
    }


    if (resumo) {
        resumo.style.display = "";
    }
}


/* ============================================================
   SALVAR EDIÇÃO
============================================================ */

function salvarEdicao() {

    const nome =
        obterValor("editNome");

    const celular =
        obterValor("editCelular");

    const cpf =
        obterValor("editCPF");

    const cnh =
        obterValor("editCNH");

    const validadeCnh =
        obterValor("editValidadeCnh");


    if (!nome) {

        mostrarMensagem(
            "Informe o nome completo.",
            "error"
        );

        return;
    }


    if (!celular) {

        mostrarMensagem(
            "Informe o celular.",
            "error"
        );

        return;
    }


    if (!cpf) {

        mostrarMensagem(
            "Informe o CPF.",
            "error"
        );

        return;
    }


    if (!validarCPF(cpf)) {

        mostrarMensagem(
            "Informe um CPF válido.",
            "error"
        );

        return;
    }


    /*
       A edição representa uma nova alteração dos dados.
       A assinatura anterior precisa ser removida,
       pois o motorista deverá confirmar novamente.
    */

    const novosDados = {

        ...dadosCadastro,

        nome: nome.trim(),

        celular:
            formatarCelular(celular),

        cpf:
            formatarCPF(cpf),

        cnh:
            cnh.trim(),

        validadeCnh:
            validadeCnh,

        calcado:
            obterValor("editCalcado"),

        trajes:
            obterValor("editTrajes"),

        colete:
            obterValor("editColete"),

        comprovei:
            obterValor("editComprovei"),


        dt:
            obterValor("editDt"),

        transportadora:
            obterValor("editTransportadora"),

        placaCavalo:
            formatarPlaca(
                obterValor("editPlacaCavalo")
            ),

        placaCarreta01:
            formatarPlaca(
                obterValor("editPlacaCarreta01")
            ),

        placaCarreta02:
            formatarPlaca(
                obterValor("editPlacaCarreta02")
            ),

        tipoVeiculo:
            obterValor("editTipoVeiculo"),

        empilhadeira:
            obterValor("editEmpilhadeira")
    };


    const camposChecklist = [

        "limpo",
        "odores",
        "umidade",
        "objetos",
        "piso",
        "reguas",
        "laterais",
        "teto",
        "vigas",
        "farois",
        "luzes",
        "sirene",
        "madeirites",
        "extintor",
        "paralamas",
        "pneus",
        "espelhos",
        "parachoque"
    ];


    for (const campo of camposChecklist) {

        novosDados[campo] =
            obterValor(`edit_${campo}`);
    }


    dadosCadastro =
        normalizarDados(novosDados);


    /*
       A assinatura é invalidada porque os dados
       foram alterados depois da assinatura.
    */

    assinaturaConfirmada = false;

    dadosCadastro.assinatura = "";

    dadosCadastro.assinaturaConfirmada = false;


    salvarDadosSessionStorage();


    /*
       Atualiza o resumo.
    */

    renderizarResumo();


    cancelarEdicao();


    /*
       Reconfigura o carimbo para o estado inicial.
    */

    configurarCarimbo();


    atualizarBotaoEnviar();


    mostrarMensagem(
        "Respostas atualizadas. Clique novamente na área de assinatura para confirmar.",
        "success"
    );
}


/* ============================================================
   SALVAR NO SESSION STORAGE
============================================================ */

function salvarDadosSessionStorage() {

    const chaves = [
        "dadosCadastro",
        "cadastro",
        "dadosMotorista",
        "motoristaCadastro",
        "formularioCadastro"
    ];


    let chaveExistente = null;


    for (const chave of chaves) {

        if (sessionStorage.getItem(chave)) {

            chaveExistente = chave;

            break;
        }
    }


    const chaveFinal =
        chaveExistente || "dadosCadastro";


    sessionStorage.setItem(
        chaveFinal,
        JSON.stringify(dadosCadastro)
    );
}


/* ============================================================
   FINALIZAR CADASTRO
============================================================ */

async function finalizarCadastro() {

    if (!assinaturaConfirmada) {
        mostrarMensagem(
            'Clique no carimbo para confirmar a assinatura digital.',
            'erro'
        );

        destacarAreaAssinatura();
        return;
    }

    const dados = obterDadosCadastro();

    if (!dados || !dados.nome) {
        mostrarMensagem(
            'Os dados do motorista não foram encontrados.',
            'erro'
        );

        return;
    }

    const btnEnviar = document.getElementById('btnEnviar');

    if (btnEnviar) {
        btnEnviar.disabled = true;
        btnEnviar.textContent = 'Enviando...';
    }

    try {

        const parametros = new URLSearchParams();

        parametros.append(
            'action',
            'cadastrar'
        );

        parametros.append(
            'dados',
            JSON.stringify({
                ...dados,
                assinaturaConfirmada: true
            })
        );

        const resposta = await fetch(
            URL_PLANILHA,
            {
                method: 'POST',
                body: parametros,
                redirect: 'follow'
            }
        );

        const texto = await resposta.text();

        let resultado;

        try {

            resultado = JSON.parse(texto);

        } catch (erro) {

            console.error(
                'Resposta recebida do Apps Script:',
                texto
            );

            throw new Error(
                'O servidor não retornou uma resposta válida.'
            );
        }

        console.log(
            'Resposta do Apps Script:',
            resultado
        );

        /*
         * O Code.gs utiliza "sucesso",
         * e não "success".
         */
        if (
            resultado.sucesso !== true
        ) {

            throw new Error(
                resultado.mensagem ||
                'Não foi possível realizar o cadastro.'
            );
        }

        /*
         * Cadastro realizado com sucesso.
         */

        try {

            sessionStorage.removeItem(
                'dadosCadastro'
            );

            sessionStorage.removeItem(
                'cadastro'
            );

            sessionStorage.removeItem(
                'dadosMotorista'
            );

            sessionStorage.removeItem(
                'motoristaCadastro'
            );

            sessionStorage.removeItem(
                'formularioCadastro'
            );

        } catch (erro) {

            console.warn(
                'Não foi possível limpar o sessionStorage:',
                erro
            );
        }

        mostrarSucesso(
            resultado
        );

    } catch (erro) {

        console.error(
            'Erro ao finalizar cadastro:',
            erro
        );

        mostrarMensagem(
            erro.message ||
            'Não foi possível realizar o cadastro.',
            'erro'
        );

        if (btnEnviar) {

            btnEnviar.disabled = false;

            btnEnviar.textContent =
                'Finalizar cadastro';

        }
    }
}

/* ============================================================
   SUCESSO
============================================================ */

function mostrarSucesso(resultado) {

    const main =
        document.querySelector("main");


    if (!main) {
        return;
    }


    const dados =
        obterDadosCadastro();


    const dataResultado =
        resultado?.dataHora ||
        resultado?.timestamp ||
        formatarDataAtual(
            new Date()
        );


    main.innerHTML = `

        <section class="card">

            <div class="sucesso-cadastro">

                <div
                    style="
                        font-size: 54px;
                        margin-bottom: 10px;
                    "
                >
                    ✓
                </div>

                <h2>
                    Cadastro realizado com sucesso!
                </h2>

                <p
                    style="
                        margin-top: 10px;
                        line-height: 1.6;
                    "
                >
                    Seus dados foram registrados
                    digitalmente.
                </p>


                <div
                    style="
                        margin: 25px auto;
                        max-width: 420px;
                        padding: 20px;
                        border: 3px double #bd2929;
                        border-radius: 6px;
                        color: #bd2929;
                        background: white;
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        text-transform: uppercase;
                    "
                >

                    <div
                        style="
                            font-size: 13px;
                            margin-bottom: 8px;
                        "
                    >
                        ASSINADO DIGITALMENTE
                    </div>

                    <div
                        style="
                            font-size: 18px;
                            word-break: break-word;
                        "
                    >
                        ${escapeHTML(
                            dados.nome || ""
                        )}
                    </div>

                    <div
                        style="
                            font-size: 13px;
                            margin-top: 5px;
                        "
                    >
                        CPF:
                        ${escapeHTML(
                            dados.cpf || ""
                        )}
                    </div>

                    <div
                        style="
                            font-size: 12px;
                            margin-top: 8px;
                        "
                    >
                        ${escapeHTML(
                            String(dataResultado)
                        )}
                    </div>

                </div>


                <p
                    style="
                        margin-top: 15px;
                    "
                >
                    Você pode prosseguir conforme
                    orientação da unidade.
                </p>

            </div>

        </section>
    `;
}


/* ============================================================
   LIMPAR SESSION STORAGE
============================================================ */

function limparSessionStorageCadastro() {

    const chaves = [

        "dadosCadastro",

        "cadastro",

        "dadosMotorista",

        "motoristaCadastro",

        "formularioCadastro"
    ];


    chaves.forEach(
        chave => {
            sessionStorage.removeItem(chave);
        }
    );
}


/* ============================================================
   BOTÃO ENVIAR
============================================================ */

function atualizarBotaoEnviar() {

    const btn =
        document.getElementById("btnEnviar");


    if (!btn) {
        return;
    }


    btn.disabled =
        !assinaturaConfirmada;


    if (assinaturaConfirmada) {

        btn.textContent =
            "Assinar e finalizar";

    } else {

        btn.textContent =
            "Assinar e finalizar";
    }
}


/* ============================================================
   DESTACAR ASSINATURA
============================================================ */

function destacarAreaAssinatura() {

    const area =
        document.getElementById("stampBox");


    if (!area) {
        return;
    }


    area.classList.add(
        "assinatura-atencao"
    );


    area.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    setTimeout(
        () => {

            area.classList.remove(
                "assinatura-atencao"
            );

        },
        1800
    );
}


/* ============================================================
   OBTER DADOS
============================================================ */

function obterDadosCadastro() {

    if (
        !dadosCadastro ||
        typeof dadosCadastro !== "object"
    ) {
        dadosCadastro = {};
    }


    return normalizarDados(
        dadosCadastro
    );
}


/* ============================================================
   VOLTAR
============================================================ */

function voltarPagina() {

    window.location.href =
        "checklist.html";
}


/* ============================================================
   MENSAGENS
============================================================ */

function mostrarMensagem(
    mensagem,
    tipo = "info"
) {

    const elemento =
        document.getElementById(
            "mensagemEnvio"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensagem;


    elemento.className =
        "message";


    if (tipo) {
        elemento.classList.add(tipo);
    }


    elemento.style.display =
        "block";
}


/* ============================================================
   HELPERS
============================================================ */

function definirValor(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {
        elemento.value =
            valor ?? "";
    }
}


function definirSelect(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {
        elemento.value =
            normalizarSimNao(valor);
    }
}


function obterValor(id) {

    const elemento =
        document.getElementById(id);


    if (!elemento) {
        return "";
    }


    return String(
        elemento.value || ""
    ).trim();
}


function somenteNumeros(valor) {

    return String(
        valor || ""
    ).replace(/\D/g, "");
}


/* ============================================================
   CPF
============================================================ */

function formatarCPF(valor) {

    const numeros =
        somenteNumeros(valor)
            .slice(0, 11);


    if (numeros.length <= 3) {
        return numeros;
    }


    if (numeros.length <= 6) {

        return (
            numeros.slice(0, 3) +
            "." +
            numeros.slice(3)
        );
    }


    if (numeros.length <= 9) {

        return (
            numeros.slice(0, 3) +
            "." +
            numeros.slice(3, 6) +
            "." +
            numeros.slice(6)
        );
    }


    return (
        numeros.slice(0, 3) +
        "." +
        numeros.slice(3, 6) +
        "." +
        numeros.slice(6, 9) +
        "-" +
        numeros.slice(9, 11)
    );
}


function validarCPF(valor) {

    const cpf =
        somenteNumeros(valor);


    if (cpf.length !== 11) {
        return false;
    }


    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }


    let soma = 0;


    for (let i = 0; i < 9; i++) {

        soma +=
            Number(cpf.charAt(i)) *
            (10 - i);
    }


    let resto =
        (soma * 10) % 11;


    if (resto === 10) {
        resto = 0;
    }


    if (
        resto !==
        Number(cpf.charAt(9))
    ) {
        return false;
    }


    soma = 0;


    for (let i = 0; i < 10; i++) {

        soma +=
            Number(cpf.charAt(i)) *
            (11 - i);
    }


    resto =
        (soma * 10) % 11;


    if (resto === 10) {
        resto = 0;
    }


    return (
        resto ===
        Number(cpf.charAt(10))
    );
}


/* ============================================================
   CELULAR
============================================================ */

function formatarCelular(valor) {

    const numeros =
        somenteNumeros(valor)
            .slice(0, 11);


    if (numeros.length <= 2) {
        return numeros;
    }


    if (numeros.length <= 7) {

        return (
            "(" +
            numeros.slice(0, 2) +
            ") " +
            numeros.slice(2)
        );
    }


    return (
        "(" +
        numeros.slice(0, 2) +
        ") " +
        numeros.slice(2, 7) +
        "-" +
        numeros.slice(7, 11)
    );
}


/* ============================================================
   PLACA
============================================================ */

function formatarPlaca(valor) {

    const texto =
        String(valor || "")
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 7);


    if (texto.length <= 3) {
        return texto;
    }


    return (
        texto.slice(0, 3) +
        "-" +
        texto.slice(3)
    );
}


/* ============================================================
   SIM / NÃO
============================================================ */

function normalizarSimNao(valor) {

    if (
        valor === true ||
        valor === 1 ||
        String(valor).toLowerCase() === "true" ||
        String(valor).toLowerCase() === "sim"
    ) {
        return "Sim";
    }


    if (
        valor === false ||
        valor === 0 ||
        String(valor).toLowerCase() === "false" ||
        String(valor).toLowerCase() === "não" ||
        String(valor).toLowerCase() === "nao"
    ) {
        return "Não";
    }


    return valor || "";
}


/* ============================================================
   DATA
============================================================ */

function formatarDataAtual(data) {

    const d =
        data instanceof Date
            ? data
            : new Date(data);


    const dia =
        String(
            d.getDate()
        ).padStart(2, "0");


    const mes =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");


    const ano =
        d.getFullYear();


    const hora =
        String(
            d.getHours()
        ).padStart(2, "0");


    const minuto =
        String(
            d.getMinutes()
        ).padStart(2, "0");


    const segundo =
        String(
            d.getSeconds()
        ).padStart(2, "0");


    return (
        `${dia}/${mes}/${ano} ` +
        `${hora}:${minuto}:${segundo}`
    );
}


/* ============================================================
   DATAS
============================================================ */

function converterDataParaInput(valor) {

    if (!valor) {
        return "";
    }


    /*
       Se já estiver no formato yyyy-MM-dd.
    */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(valor)
        )
    ) {
        return valor;
    }


    /*
       Se estiver dd/MM/yyyy.
    */

    const match =
        String(valor).match(
            /^(\d{2})\/(\d{2})\/(\d{4})/
        );


    if (match) {

        return (
            `${match[3]}-${match[2]}-${match[1]}`
        );
    }


    return "";
}


function formatarDataExibicao(valor) {

    if (!valor) {
        return "";
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(valor)
        )
    ) {

        const partes =
            String(valor).split("-");

        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );
    }


    return String(valor);
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(valor) {

    return String(
        valor ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   EXPORTAÇÕES
============================================================ */

window.confirmarAssinatura =
    confirmarAssinatura;

window.removerAssinatura =
    removerAssinatura;

window.ativarModoEdicao =
    ativarModoEdicao;

window.cancelarEdicao =
    cancelarEdicao;

window.salvarEdicao =
    salvarEdicao;

window.finalizarCadastro =
    finalizarCadastro;
