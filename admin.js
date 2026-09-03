/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const URL_PLANILHA =
    'https://script.google.com/macros/s/AKfycbwl2NEFu2qYpUetza9PNy13GXIrdh3GcTkhYpOmTnMZVn13HxaEI8tqPy6quYFXvTYJaw/exec';

const autoAtualizacao = 3000;

let token = null;
let registros = [];
let secaoAtual = 'dashboardSection';


/* =========================================================
   CAMPOS DA PLANILHA
   ========================================================= */

const CAMPOS = {

    dataHora: 'Data / Hora',
    nome: 'Nome Completo',
    celular: 'Celular',
    cpf: 'CPF',
    cnh: 'CNH',
    validadeCnh: 'Validade CNH',

    calcado: 'Calçado de Segurança?',
    trajes: 'Trajes (calça comprida e camisa)?',
    colete: 'Colete Refletivo?',
    comprovei: 'App Comprovei?',

    dt: 'DT',
    transportadora: 'Transportadora',
    placaCavalo: 'Placa Cavalo / Truck',
    placaCarreta01: 'Placa Carreta 01',
    placaCarreta02: 'Placa Carreta 02',
    tipoVeiculo: 'Tipo Veículo',
    empilhadeira: 'Autoriza Entrada de Empilhadeira?',

    limpo: 'Limpo e sem resíduo?',
    odores: 'Isento de odores estranhos?',
    umidade: 'Isento de umidade ou vazamento?',
    objetos: 'Isento de objetos pontiagudos?',
    piso: 'Piso reto e sem furos?',
    reguas: 'Réguas retas sem protuberância?',
    laterais: 'Laterais sem furos ou rasgos?',
    teto: 'Teto sem furo ou rasgos?',
    vigas: 'Vigas do teto sem risco de corte?',

    farois: 'Faróis?',
    luzes: 'Luzes e lanternas?',
    sirene: 'Sirene de ré?',
    madeirites: 'Madeirites e Lona?',
    extintor: 'Extintor de Incêndio?',
    paralamas: 'Paralamas?',
    pneus: 'Pneus de rodagem e step?',
    espelhos: 'Espelhos retrovisores?',
    parachoque: 'Para-choque?',

    assinatura: 'Assinatura do Motorista',
    dataAssinatura: 'Data/Hora da assinatura do motorista'
};


const CAMPOS_MOTORISTA = [
    'nome',
    'celular',
    'cpf',
    'cnh',
    'validadeCnh',
    'calcado',
    'trajes',
    'colete',
    'comprovei'
];


const CAMPOS_CAMINHAO = [
    'dt',
    'transportadora',
    'placaCavalo',
    'placaCarreta01',
    'placaCarreta02',
    'tipoVeiculo',
    'empilhadeira'
];


const CAMPOS_CHECKLIST = [
    'limpo',
    'odores',
    'umidade',
    'objetos',
    'piso',
    'reguas',
    'laterais',
    'teto',
    'vigas',
    'farois',
    'luzes',
    'sirene',
    'madeirites',
    'extintor',
    'paralamas',
    'pneus',
    'espelhos',
    'parachoque'
];


const CAMPOS_EDITAVEIS = [

    'nome',
    'celular',
    'cpf',
    'cnh',
    'validadeCnh',

    'calcado',
    'trajes',
    'colete',
    'comprovei',

    'dt',
    'transportadora',
    'placaCavalo',
    'placaCarreta01',
    'placaCarreta02',
    'tipoVeiculo',
    'empilhadeira',

    'limpo',
    'odores',
    'umidade',
    'objetos',
    'piso',
    'reguas',
    'laterais',
    'teto',
    'vigas',
    'farois',
    'luzes',
    'sirene',
    'madeirites',
    'extintor',
    'paralamas',
    'pneus',
    'espelhos',
    'parachoque'
];


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    inicializarAdmin
);


function inicializarAdmin() {

    configurarLogin();
    configurarNavegacao();
    configurarBotoesAtualizacao();
    configurarPesquisas();
    configurarModal();
    configurarLogout();
    configurarMenuMobile();
    configurarTema();

    verificarSessao();

setInterval(async () => {

    if (
        sessionStorage.getItem(
            'adminAuthenticated'
        ) === 'true'
    ) {

        try {
            await carregarDados();
        } catch (erro) {
            console.error(
                'Erro na atualização automática:',
                erro
            );
        }

    }

}, autoAtualizacao); // 3 segundos

}


/* =========================================================
   SESSÃO
   ========================================================= */

function verificarSessao() {

    const tokenSalvo =
        sessionStorage.getItem('adminToken');

    const autenticado =
        sessionStorage.getItem('adminAuthenticated');

    if (
        tokenSalvo &&
        autenticado === 'true'
    ) {

        token = tokenSalvo;

        mostrarPainel();

        carregarDados().catch(function (erro) {

            console.error(
                'Sessão inválida:',
                erro
            );

            encerrarSessao();

        });

    } else {

        mostrarLogin();

    }
}


/* =========================================================
   LOGIN
   ========================================================= */

function configurarLogin() {

    const form =
        document.getElementById('loginForm');

    if (!form) {
        console.error(
            'Formulário de login não encontrado.'
        );
        return;
    }


    form.addEventListener(
        'submit',
        async function (event) {

            event.preventDefault();


            const usuarioInput =
                document.getElementById('usuario');

            const senhaInput =
                document.getElementById('senha');

            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            const usuario =
                usuarioInput
                    ? usuarioInput.value.trim()
                    : '';

            const senha =
                senhaInput
                    ? senhaInput.value
                    : '';


            esconderLoginErro();


            if (!usuario || !senha) {

                mostrarLoginErro(
                    'Informe o usuário e a senha.'
                );

                return;
            }


            if (botao) {

                botao.disabled = true;
                botao.textContent =
                    'Entrando...';

            }


            try {

                const corpo =
                    new URLSearchParams();

                corpo.append(
                    'action',
                    'login'
                );

                corpo.append(
                    'usuario',
                    usuario
                );

                corpo.append(
                    'senha',
                    senha
                );


                const resposta =
                    await fetch(
                        URL_PLANILHA,
                        {
                            method: 'POST',
                            body: corpo,
                            cache: 'no-store'
                        }
                    );


                if (!resposta.ok) {

                    throw new Error(
                        `HTTP ${resposta.status}`
                    );

                }


                const resultado =
                    await resposta.json();


                console.log(
                    'Resposta do login:',
                    resultado
                );


                if (
                    resultado &&
                    resultado.sucesso === true &&
                    resultado.token
                ) {

                    token =
                        resultado.token;


                    sessionStorage.setItem(
                        'adminToken',
                        token
                    );

                    sessionStorage.setItem(
                        'adminAuthenticated',
                        'true'
                    );


                    mostrarPainel();


                    try {

                        await carregarDados();

                        mudarSecao(
                            'dashboardSection'
                        );

                    } catch (erroDados) {

                        console.error(
                            'Erro ao carregar dados:',
                            erroDados
                        );

                        mostrarLoginErro(
                            'Login realizado, mas não foi possível carregar os dados.'
                        );

                        encerrarSessao();

                    }

                } else {

                    mostrarLoginErro(
                        resultado?.mensagem ||
                        'Usuário ou senha incorretos.'
                    );

                }


            } catch (erroLogin) {

                console.error(
                    'Erro no login:',
                    erroLogin
                );


                mostrarLoginErro(
                    'Não foi possível conectar ao servidor. Verifique a implantação do Apps Script.'
                );


            } finally {

                if (botao) {

                    botao.disabled = false;
                    botao.textContent =
                        'Entrar';

                }

            }

        }
    );

}


/* =========================================================
   EXIBIÇÃO LOGIN / PAINEL
   ========================================================= */

function mostrarLogin() {

    const login =
        document.getElementById(
            'loginScreen'
        );

    const painel =
        document.getElementById(
            'adminPanel'
        );


    if (login) {
        login.classList.remove(
            'hidden'
        );
    }


    if (painel) {
        painel.classList.add(
            'hidden'
        );
    }

}


function mostrarPainel() {

    const login =
        document.getElementById(
            'loginScreen'
        );

    const painel =
        document.getElementById(
            'adminPanel'
        );


    if (login) {
        login.classList.add(
            'hidden'
        );
    }


    if (painel) {
        painel.classList.remove(
            'hidden'
        );
    }

}


/* =========================================================
   MENSAGEM LOGIN
   ========================================================= */

function mostrarLoginErro(mensagem) {

    const erro =
        document.getElementById(
            'loginError'
        );


    if (!erro) {
        return;
    }


    erro.textContent =
        mensagem;

    erro.classList.add(
        'visible'
    );

}


function esconderLoginErro() {

    const erro =
        document.getElementById(
            'loginError'
        );


    if (!erro) {
        return;
    }


    erro.textContent = '';

    erro.classList.remove(
        'visible'
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function configurarLogout() {

    const botao =
        document.getElementById(
            'logoutButton'
        );


    if (!botao) {
        return;
    }


    botao.addEventListener(
        'click',
        function () {

            encerrarSessao();

        }
    );

}


function encerrarSessao() {

    sessionStorage.removeItem(
        'adminToken'
    );

    sessionStorage.removeItem(
        'adminAuthenticated'
    );


    token = null;
    registros = [];


    mostrarLogin();


    const usuario =
        document.getElementById(
            'usuario'
        );

    const senha =
        document.getElementById(
            'senha'
        );


    if (usuario) {
        usuario.value = '';
    }


    if (senha) {
        senha.value = '';
    }


    esconderLoginErro();

}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function configurarNavegacao() {

    const botoes =
        document.querySelectorAll(
            '.menu-item'
        );


    botoes.forEach(
        function (botao) {

            botao.addEventListener(
                'click',
                function () {

                    const nomeSecao =
                        botao.dataset.section;


                    const mapa = {

                        dashboard:
                            'dashboardSection',

                        motoristas:
                            'motoristasSection',

                        caminhoes:
                            'caminhoesSection',

                        checklists:
                            'checklistsSection'

                    };


                    const idSecao =
                        mapa[nomeSecao];


                    if (!idSecao) {
                        return;
                    }


                    mudarSecao(
                        idSecao
                    );

                }
            );

        }
    );

}


function mudarSecao(idSecao) {

    const secoes =
        document.querySelectorAll(
            '.content-section'
        );


    secoes.forEach(
        function (secao) {

            secao.classList.add(
                'hidden'
            );

            secao.classList.remove(
                'active-section'
            );

        }
    );


    const secao =
        document.getElementById(
            idSecao
        );


    if (!secao) {
        return;
    }


    secao.classList.remove(
        'hidden'
    );

    secao.classList.add(
        'active-section'
    );


    secaoAtual =
        idSecao;


    const mapa = {

        dashboard:
            'dashboardSection',

        motoristas:
            'motoristasSection',

        caminhoes:
            'caminhoesSection',

        checklists:
            'checklistsSection'

    };


    const botoes =
        document.querySelectorAll(
            '.menu-item'
        );


    botoes.forEach(
        function (botao) {

            botao.classList.remove(
                'active'
            );


            if (
                mapa[
                    botao.dataset.section
                ] === idSecao
            ) {

                botao.classList.add(
                    'active'
                );

            }

        }
    );


    atualizarTituloSecao(
        idSecao
    );


    fecharMenuMobile();

}


function atualizarTituloSecao(idSecao) {

    const titulo =
        document.getElementById(
            'pageTitle'
        );


    const subtitulo =
        document.getElementById(
            'pageSubtitle'
        );


    const dados = {

        dashboardSection: [
            'Dashboard',
            'Visão geral dos cadastros realizados'
        ],

        motoristasSection: [
            'Motoristas',
            'Consulte e gerencie os motoristas cadastrados'
        ],

        caminhoesSection: [
            'Caminhões',
            'Consulte os dados dos veículos cadastrados'
        ],

        checklistsSection: [
            'Checklists',
            'Consulte as verificações realizadas nos veículos'
        ]

    };


    const item =
        dados[idSecao];


    if (!item) {
        return;
    }


    if (titulo) {
        titulo.textContent =
            item[0];
    }


    if (subtitulo) {
        subtitulo.textContent =
            item[1];
    }

}


/* =========================================================
   MENU MOBILE
   ========================================================= */

function configurarMenuMobile() {

    const botao =
        document.getElementById(
            'mobileMenuButton'
        );


    if (!botao) {
        return;
    }


    botao.addEventListener(
        'click',
        function () {

            const sidebar =
                document.querySelector(
                    '.sidebar'
                );


            if (sidebar) {

                sidebar.classList.toggle(
                    'open'
                );

            }

        }
    );

}


function fecharMenuMobile() {

    const sidebar =
        document.querySelector(
            '.sidebar'
        );


    if (sidebar) {

        sidebar.classList.remove(
            'open'
        );

    }

}

/* =========================================================
   Alternar entre tema claro e tema escuro
   ========================================================= */

function configurarTema() {

    const botao =
        document.getElementById(
            'themeToggle'
        );

    if (!botao) {
        return;
    }

    const temaSalvo =
        localStorage.getItem(
            'adminTheme'
        );

    if (temaSalvo === 'dark') {

        document.body.classList.add(
            'dark-mode'
        );

        botao.checked = true;
    }

    botao.addEventListener(
        'change',
        function () {

            document.body.classList.toggle(
                'dark-mode',
                botao.checked
            );

            localStorage.setItem(
                'adminTheme',
                botao.checked
                    ? 'dark'
                    : 'light'
            );

        }
    );

}

/* =========================================================
   Formatar Data para formato 00:00:00
   ========================================================= */

function formatarData(valor) {
    if (!valor) return '';

    return String(valor)
        .replace(' 00:00:00', '')
        .replace('T00:00:00.000Z', '');
}


/* =========================================================
   BOTÕES DE ATUALIZAÇÃO
   ========================================================= */

function configurarBotoesAtualizacao() {

    configurarBotaoRefresh(
        'refreshDashboardButton'
    );

    configurarBotaoRefresh(
        'refreshMotoristaButton'
    );

    configurarBotaoRefresh(
        'refreshCaminhaoButton'
    );

    configurarBotaoRefresh(
        'refreshChecklistButton'
    );

}


function configurarBotaoRefresh(id) {

    const botao =
        document.getElementById(id);


    if (!botao) {
        return;
    }


    botao.addEventListener(
        'click',
        async function () {

            botao.classList.add(
                'loading'
            );


            const textoOriginal =
                botao.textContent;


            botao.textContent =
                '↻ Atualizando...';


            try {

                await carregarDados();

            } catch (erro) {

                console.error(
                    'Erro ao atualizar:',
                    erro
                );

            } finally {

                botao.classList.remove(
                    'loading'
                );

                botao.textContent =
                    textoOriginal;

            }

        }
    );

}


/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function carregarDados() {

    if (
        !URL_PLANILHA ||
        URL_PLANILHA.includes(
            'COLE_AQUI'
        )
    ) {

        throw new Error(
            'URL_PLANILHA não configurada.'
        );

    }


    const tokenAtual =
        token ||
        sessionStorage.getItem(
            'adminToken'
        ) ||
        '';


    if (!tokenAtual) {

        throw new Error(
            'Token administrativo não encontrado.'
        );

    }


    const url =
        `${URL_PLANILHA}?action=listar&token=${encodeURIComponent(tokenAtual)}`;


    try {

        const resposta =
            await fetch(
                url,
                {
                    method: 'GET',
                    cache: 'no-store'
                }
            );


        if (!resposta.ok) {

            throw new Error(
                `HTTP ${resposta.status}`
            );

        }


        const dados =
            await resposta.json();


        console.log(
            'Dados recebidos:',
            dados
        );


        if (
            dados &&
            dados.sucesso === false
        ) {

            throw new Error(
                dados.mensagem ||
                'Não foi possível carregar os registros.'
            );

        }


        if (
            dados &&
            Array.isArray(
                dados.motoristas
            )
        ) {

            registros =
                dados.motoristas;

        } else if (
            dados &&
            Array.isArray(
                dados.registros
            )
        ) {

            registros =
                dados.registros;

        } else if (
            Array.isArray(dados)
        ) {

            registros =
                dados;

        } else {

            registros = [];

        }


        registros =
            registros.filter(
                function (registro) {

                    return !ehCabecalho(
                        registro
                    );

                }
            );


        renderizarTudo();


        return registros;


    } catch (erro) {

        console.error(
            'Erro ao carregar dados:',
            erro
        );


        renderizarTudo();

        throw erro;

    }

}


/* =========================================================
   REMOVER CABEÇALHOS
   ========================================================= */

function ehCabecalho(registro) {

    if (!registro) {
        return true;
    }


    const nome =
        String(
            obterValor(
                registro,
                'nome'
            )
        )
            .trim()
            .toLowerCase();


    const cpf =
        String(
            obterValor(
                registro,
                'cpf'
            )
        )
            .trim()
            .toLowerCase();


    const data =
        String(
            obterValor(
                registro,
                'dataHora'
            )
        )
            .trim()
            .toLowerCase();


    if (
        nome === 'nome completo' ||
        nome === 'nome' ||
        cpf === 'cpf' ||
        data === 'data / hora' ||
        data === 'data/hora'
    ) {

        return true;

    }


    return false;

}


/* =========================================================
   RENDERIZAÇÃO GERAL
   ========================================================= */

function renderizarTudo() {

    atualizarIndicadores();

    renderizarDashboard(
        obterValorInput(
            'searchDashboard'
        )
    );

    renderizarMotoristas(
        obterValorInput(
            'searchMotorista'
        )
    );

    renderizarCaminhoes(
        obterValorInput(
            'searchCaminhao'
        )
    );

    renderizarChecklists(
        obterValorInput(
            'searchChecklist'
        )
    );

}


/* =========================================================
   INDICADORES
   ========================================================= */

function atualizarIndicadores() {

    const totalMotoristas =
        document.getElementById(
            'totalMotoristas'
        );

    const totalCaminhoes =
        document.getElementById(
            'totalCaminhoes'
        );

    const totalChecklists =
        document.getElementById(
            'totalChecklists'
        );

    const totalPendencias =
        document.getElementById(
            'totalPendencias'
        );


    const motoristas =
        registros.filter(
            function (registro) {

                return Boolean(
                    obterValor(
                        registro,
                        'nome'
                    )
                );

            }
        );


    const caminhoes =
        registros.filter(
            function (registro) {

                return Boolean(
                    obterValor(
                        registro,
                        'placaCavalo'
                    ) ||
                    obterValor(
                        registro,
                        'dt'
                    )
                );

            }
        );


    const checklists =
        registros.filter(
            possuiChecklist
        );


    const pendencias =
        registros.filter(
            registroTemPendencia
        );


    if (totalMotoristas) {

        totalMotoristas.textContent =
            motoristas.length;

    }


    if (totalCaminhoes) {

        totalCaminhoes.textContent =
            caminhoes.length;

    }


    if (totalChecklists) {

        totalChecklists.textContent =
            checklists.length;

    }


    if (totalPendencias) {

        totalPendencias.textContent =
            pendencias.length;

    }

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderizarDashboard(busca = '') {

    const tabela =
        document.getElementById(
            'recentTable'
        );


    if (!tabela) {
        return;
    }


    let lista =
        filtrarRegistros(
            registros,
            busca
        );


    lista =
        lista
            .slice()
            .sort(
                function (a, b) {

                    return (
                        obterLinha(b) -
                        obterLinha(a)
                    );

                }
            )
            .slice(0, 100);


if (!lista.length) {

    tabela.innerHTML =
        gerarTabelaVazia(
            7,
            busca
                ? 'Nenhum cadastro encontrado para a pesquisa.'
                : 'Nenhum cadastro encontrado.'
        );

    const info =
        document.getElementById(
            'dashboardSearchInfo'
        );

    if (info && busca) {

        info.classList.remove('hidden');

        info.textContent =
            `0 registro(s) encontrado(s) para "${busca}".`;

    }

    return;

}


    tabela.innerHTML =
        lista
            .map(
                gerarLinhaDashboard
            )
            .join('');


    const info =
        document.getElementById(
            'dashboardSearchInfo'
        );


    if (info) {

        if (busca) {

            info.classList.remove(
                'hidden'
            );

            const textoBusca = busca.trim();

            info.textContent =
                `${lista.length} registro(s) encontrado(s) para "${busca}".`;
                
            } else {

            info.classList.add(
                'hidden'
            );

        }

    }

}


function gerarLinhaDashboard(
    registro
) {

    const linha =
        obterLinha(registro);


    const data =
        escaparHTML(
            obterValor(
                registro,
                'dataHora'
            ) || '-'
        );


    const nome =
        escaparHTML(
            obterValor(
                registro,
                'nome'
            ) || '-'
        );


    const cpf =
        escaparHTML(
            formatarCPF(
                obterValor(
                    registro,
                    'cpf'
                )
            ) || '-'
        );


    const transportadora =
        escaparHTML(
            obterValor(
                registro,
                'transportadora'
            ) || '-'
        );


    const dt =
        escaparHTML(
            obterValor(
                registro,
                'dt'
            ) || '-'
        );


    return `
        <tr>

            <td>${data}</td>

            <td>
                <strong>${nome}</strong>
            </td>

            <td>${cpf}</td>

            <td>${transportadora}</td>

            <td>${dt}</td>

            <td>
                ${gerarStatusHTML(registro)}
            </td>

            <td>
                ${gerarBotoesAcao(linha)}
            </td>

        </tr>
    `;

}


/* =========================================================
   MOTORISTAS
   ========================================================= */
function filtrarMotoristas(lista, busca) {

    if (!busca) {
        return lista.slice();
    }

    const termo = normalizarTexto(busca);

    return lista.filter(function (registro) {

        const valores = [

            obterValor(registro, 'nome'),
            obterValor(registro, 'cpf'),
            obterValor(registro, 'cnh'),
            obterValor(registro, 'celular')

        ];

        return valores.some(function (valor) {

            return normalizarTexto(valor).includes(termo);

        });

    });

}

function renderizarMotoristas(busca = '') {
    const tabela = document.getElementById('motoristasTable');

    if (!tabela) {
        return;
    }

    const lista = filtrarMotoristas(registros, busca)
        .sort((a, b) => obterLinha(b) - obterLinha(a));

    if (!lista.length) {
        tabela.innerHTML = gerarTabelaVazia(
            12,
            busca
                ? 'Nenhum motorista encontrado para a pesquisa.'
                : 'Nenhum motorista encontrado.'
        );
        return;
    }

    tabela.innerHTML = lista
        .map(gerarLinhaMotorista)
        .join('');
}


function gerarLinhaMotorista(
    registro
) {

    const linha =
        obterLinha(registro);


    return `
        <tr>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'dataHora'
                    ) || '-'
                )}
            </td>

            <td>
                <strong>
                    ${escaparHTML(
                        obterValor(
                            registro,
                            'nome'
                        ) || '-'
                    )}
                </strong>
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'celular'
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    formatarCPF(
                        obterValor(
                            registro,
                            'cpf'
                        )
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'cnh'
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    formatarData(
                        obterValor(
                            registro,
                            'validadeCnh'
                        ) 
                    )|| '-'
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'calcado'
                    )
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'trajes'
                    )
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'colete'
                    )
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'comprovei'
                    )
                )}
            </td>

            <td>
                ${gerarStatusHTML(
                    registro
                )}
            </td>

            <td>
                ${gerarBotoesAcao(
                    linha
                )}
            </td>

        </tr>
    `;

}


/* =========================================================
   CAMINHÕES
   ========================================================= */
function filtrarCaminhoes(lista, busca) {

    if (!busca) {
        return lista.slice();
    }

    const termo = normalizarTexto(busca);

    return lista.filter(function (registro) {

        const valores = [

            obterValor(registro, 'dt'),
            obterValor(registro, 'transportadora'),
            obterValor(registro, 'placaCavalo'),
            obterValor(registro, 'placaCarreta01'),
            obterValor(registro, 'placaCarreta02')

        ];

        return valores.some(function (valor) {

            return normalizarTexto(valor).includes(termo);

        });

    });

}


function renderizarCaminhoes(busca = '') {
    const tabela = document.getElementById('caminhoesTable');

    if (!tabela) {
        return;
    }

    const lista = filtrarCaminhoes(registros, busca)
        .filter(
            registro =>
                obterValor(registro, 'placaCavalo') ||
                obterValor(registro, 'dt')
        )
        .sort((a, b) => obterLinha(b) - obterLinha(a));

    if (!lista.length) {
        tabela.innerHTML = gerarTabelaVazia(
            9,
            busca
                ? 'Nenhum caminhão encontrado para a pesquisa.'
                : 'Nenhum caminhão encontrado.'
        );
        return;
    }

    tabela.innerHTML = lista
        .map(gerarLinhaCaminhao)
        .join('');
}


function gerarLinhaCaminhao(
    registro
) {

    const linha =
        obterLinha(registro);


    return `
        <tr>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'dt'
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'transportadora'
                    ) || '-'
                )}
            </td>

            <td>
                <strong>
                    ${escaparHTML(
                        obterValor(
                            registro,
                            'placaCavalo'
                        ) || '-'
                    )}
                </strong>
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'placaCarreta01'
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'placaCarreta02'
                    ) || '-'
                )}
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'tipoVeiculo'
                    ) || '-'
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'empilhadeira'
                    )
                )}
            </td>

            <td>
                ${gerarStatusHTML(
                    registro
                )}
            </td>

            <td>
                ${gerarBotoesAcao(
                    linha
                )}
            </td>

        </tr>
    `;

}


/* =========================================================
   CHECKLISTS
   ========================================================= */
function filtrarChecklist(lista, busca) {

    if (!busca) {
        return lista.slice();
    }

    const termo = normalizarTexto(busca);

    return lista.filter(function (registro) {

        const valores = [

            obterValor(registro, 'nome'),
            obterValor(registro, 'dt'),
            obterValor(registro, 'placaCavalo')

        ];

        return valores.some(function (valor) {

            return normalizarTexto(valor).includes(termo);

        });

    });

}


function renderizarChecklists(busca = '') {
    const tabela = document.getElementById('checklistsTable');

    if (!tabela) {
        return;
    }

    const lista = filtrarChecklist(registros, busca)
        .filter(possuiChecklist)
        .sort((a, b) => obterLinha(b) - obterLinha(a));

    if (!lista.length) {
        tabela.innerHTML = gerarTabelaVazia(
            8,
            busca
                ? 'Nenhum checklist encontrado para a pesquisa.'
                : 'Nenhum checklist encontrado.'
        );
        return;
    }

    tabela.innerHTML = lista
        .map(gerarLinhaChecklist)
        .join('');
}

function gerarLinhaChecklist(
    registro
) {

    const linha =
        obterLinha(registro);


    return `
        <tr>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'dataHora'
                    ) || '-'
                )}
            </td>

            <td>
                <strong>
                    ${escaparHTML(
                        obterValor(
                            registro,
                            'nome'
                        ) || '-'
                    )}
                </strong>
            </td>

            <td>
                ${escaparHTML(
                    obterValor(
                        registro,
                        'placaCavalo'
                    ) || '-'
                )}
            </td>

            <td>
                ${gerarSimNaoTabela(
                    obterValor(
                        registro,
                        'limpo'
                    )
                )}
            </td>

            <td>
                ${gerarChecklistEstrutura(
                    registro
                )}
            </td>

            <td>
                ${gerarChecklistSeguranca(
                    registro
                )}
            </td>

            <td>
                ${gerarStatusHTML(
                    registro
                )}
            </td>

            <td>
                ${gerarBotoesAcao(
                    linha
                )}
            </td>

        </tr>
    `;

}


/* =========================================================
   BOTÕES DE AÇÃO
   ========================================================= */

function gerarBotoesAcao(
    linha
) {

    if (!linha) {
        return '';
    }


    return `
        <div class="table-actions">

            <button
                type="button"
                class="action-btn primary"
                onclick="abrirDetalhesPorLinha(${Number(linha)})"
            >
                Ver detalhes
            </button>

            <button
                type="button"
                class="action-btn"
                onclick="abrirEdicaoPorLinha(${Number(linha)})"
            >
                Editar
            </button>

        </div>
    `;

}


/* =========================================================
   DETALHES
   ========================================================= */

async function abrirDetalhesPorLinha(
    linha
) {

    const registro =
        encontrarPorLinha(linha);


    if (!registro) {

        alert(
            'Registro não encontrado.'
        );

        return;

    }


    const modal =
        document.getElementById(
            'detailsModal'
        );

    const titulo =
        document.getElementById(
            'modalTitle'
        );

    const conteudo =
        document.getElementById(
            'modalContent'
        );


    if (!modal || !conteudo) {
        return;
    }


    if (titulo) {

        titulo.textContent =
            obterValor(
                registro,
                'nome'
            ) ||
            'Detalhes do cadastro';

    }


    conteudo.innerHTML =
        gerarHTMLDetalhes(
            registro
        );


    abrirModal();

}


/* =========================================================
   HTML DOS DETALHES
   ========================================================= */

function gerarHTMLDetalhes(
    registro
) {

    const nome =
        obterValor(
            registro,
            'nome'
        ) ||
        'Não informado';


    const cpf =
        formatarCPF(
            obterValor(
                registro,
                'cpf'
            )
        ) ||
        'Não informado';


    const dataHora =
        obterValor(
            registro,
            'dataHora'
        ) ||
        'Não informado';


    return `

        <div class="review-panels">

            <!-- MOTORISTA -->

            <section class="review-panel">

                <div class="review-panel-header">

                    <div class="review-panel-icon">
                        👤
                    </div>

                    <div>
                        <h3>Motorista</h3>

                        <p>
                            Informações e documentação
                        </p>
                    </div>

                </div>


                <div class="review-panel-body">

                    ${gerarReviewItem(
                        'Nome completo',
                        nome
                    )}

                    ${gerarReviewItem(
                        'Celular',
                        obterValor(
                            registro,
                            'celular'
                        )
                    )}

                    ${gerarReviewItem(
                        'CPF',
                        cpf
                    )}

                    ${gerarReviewItem(
                        'CNH',
                        obterValor(
                            registro,
                            'cnh'
                        )
                    )}

                    ${gerarReviewItem(
                        'Validade da CNH',
                        formatarData(
                            obterValor(
                                registro,
                                'validadeCnh'
                        )
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Calçado de segurança?',
                        obterValor(
                            registro,
                            'calcado'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Trajes adequados?',
                        obterValor(
                            registro,
                            'trajes'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Colete refletivo?',
                        obterValor(
                            registro,
                            'colete'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'App Comprovei?',
                        obterValor(
                            registro,
                            'comprovei'
                        )
                    )}

                </div>

            </section>


            <!-- CAMINHÃO -->

            <section class="review-panel">

                <div class="review-panel-header">

                    <div class="review-panel-icon">
                        🚛
                    </div>

                    <div>
                        <h3>Caminhão</h3>

                        <p>
                            Informações do veículo
                        </p>
                    </div>

                </div>


                <div class="review-panel-body">

                    ${gerarReviewItem(
                        'DT',
                        obterValor(
                            registro,
                            'dt'
                        )
                    )}

                    ${gerarReviewItem(
                        'Transportadora',
                        obterValor(
                            registro,
                            'transportadora'
                        )
                    )}

                    ${gerarReviewItem(
                        'Placa Cavalo / Truck',
                        obterValor(
                            registro,
                            'placaCavalo'
                        )
                    )}

                    ${gerarReviewItem(
                        'Placa Carreta 01',
                        obterValor(
                            registro,
                            'placaCarreta01'
                        )
                    )}

                    ${gerarReviewItem(
                        'Placa Carreta 02',
                        obterValor(
                            registro,
                            'placaCarreta02'
                        )
                    )}

                    ${gerarReviewItem(
                        'Tipo de veículo',
                        obterValor(
                            registro,
                            'tipoVeiculo'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Autoriza entrada de empilhadeira',
                        obterValor(
                            registro,
                            'empilhadeira'
                        )
                    )}

                </div>

            </section>


            <!-- CHECKLIST -->

            <section class="review-panel review-panel-wide">

                <div class="review-panel-header">

                    <div class="review-panel-icon">
                        ✓
                    </div>

                    <div>
                        <h3>Checklist do veículo</h3>

                        <p>
                            Verificações realizadas no cadastro
                        </p>
                    </div>

                </div>


                <div class="review-panel-body">

                    ${gerarReviewItemSimNao(
                        'Limpo e sem resíduo?',
                        obterValor(
                            registro,
                            'limpo'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Isento de odores estranhos?',
                        obterValor(
                            registro,
                            'odores'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Isento de umidade ou vazamento?',
                        obterValor(
                            registro,
                            'umidade'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Isento de objetos pontiagudos?',
                        obterValor(
                            registro,
                            'objetos'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Piso reto e sem furos?',
                        obterValor(
                            registro,
                            'piso'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Réguas retas sem protuberância?',
                        obterValor(
                            registro,
                            'reguas'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Laterais sem furos ou rasgos?',
                        obterValor(
                            registro,
                            'laterais'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Teto sem furos ou rasgos?',
                        obterValor(
                            registro,
                            'teto'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Vigas do teto sem risco de corte?',
                        obterValor(
                            registro,
                            'vigas'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Faróis?',
                        obterValor(
                            registro,
                            'farois'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Luzes e lanternas?',
                        obterValor(
                            registro,
                            'luzes'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Sirene de ré?',
                        obterValor(
                            registro,
                            'sirene'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Madeirites e lona?',
                        obterValor(
                            registro,
                            'madeirites'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Extintor de incêndio?',
                        obterValor(
                            registro,
                            'extintor'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Paralamas?',
                        obterValor(
                            registro,
                            'paralamas'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Pneus de rodagem e step?',
                        obterValor(
                            registro,
                            'pneus'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Espelhos retrovisores?',
                        obterValor(
                            registro,
                            'espelhos'
                        )
                    )}

                    ${gerarReviewItemSimNao(
                        'Para-choque?',
                        obterValor(
                            registro,
                            'parachoque'
                        )
                    )}

                </div>

            </section>


            <!-- ASSINATURA -->

            <section class="review-panel">

                <div class="review-panel-header">

                    <div class="review-panel-icon">
                        ✍
                    </div>

                    <div>

                        <h3>Assinatura</h3>

                        <p>
                            Registro da confirmação do motorista
                        </p>

                    </div>

                </div>


                <div class="review-signature-body">

                    ${gerarHTMLAssinatura(
                        registro
                    )}

                </div>

            </section>


            <!-- REGISTRO -->

            <section class="review-panel">

                <div class="review-panel-header">

                    <div class="review-panel-icon">
                        🕐
                    </div>

                    <div>

                        <h3>Registro</h3>

                        <p>
                            Informações de controle
                        </p>

                    </div>

                </div>


                <div class="review-panel-body">

                    ${gerarReviewItem(
                        'Data / Hora do cadastro',
                        dataHora
                    )}

                    ${gerarReviewItem(
                        'Data / Hora da assinatura',
                        obterValor(
                            registro,
                            'dataAssinatura'
                        )
                    )}

                    ${gerarReviewItem(
                        'Situação',
                        textoSituacao(
                            registro
                        )
                    )}

                </div>

            </section>

        </div>

    `;

}


/* =========================================================
   ITENS DO REVIEW
   ========================================================= */

function gerarReviewItem(
    label,
    valor
) {

const texto =
    valor === undefined ||
    valor === null ||
    String(valor).trim() === ''
        ? 'Não informado'
        : String(valor);

let classe = 'neutral';

if (texto === 'Pendência encontrada') {
    classe = 'situacao-pendencia';
}

if (texto === 'Conforme') {
    classe = 'situacao-conforme';
}

if (texto === 'Registrado') {
    classe = 'situacao-registrado';
}
    return `

        <div class="review-item">

            <span class="review-label">
                ${escaparHTML(label)}
            </span>

            <span class="review-value ${classe}">
                ${escaparHTML(texto)}
            </span>

        </div>

    `;

}


function gerarReviewItemSimNao(
    label,
    valor
) {

    const estado =
        normalizarSimNao(
            valor
        );


    let classe = 'neutral';
    let texto = 'Não informado';


    if (estado === 'sim') {

        classe = 'yes';
        texto = 'Sim';

    } else if (
        estado === 'nao'
    ) {

        classe = 'no';
        texto = 'Não';
        
    } else if (
        estado === 'na'
    ) {

        classe = 'na';
        texto = 'N/A';
        
    }else if (
        valor !== undefined &&
        valor !== null &&
        String(valor).trim() !== ''
    ) {

        texto =
            String(valor);

    }


    return `

        <div class="review-item">

            <span class="review-label">
                ${escaparHTML(label)}
            </span>

            <span class="review-value ${classe}">
                ${escaparHTML(texto)}
            </span>

        </div>

    `;

}


/* =========================================================
   ASSINATURA
   ========================================================= */

function gerarHTMLAssinatura(
    registro
) {

    const assinatura =
        String(
            obterValor(
                registro,
                'assinatura'
            ) || ''
        ).trim();


    const nome =
        obterValor(
            registro,
            'nome'
        ) ||
        'Motorista';


    const cpf =
        formatarCPF(
            obterValor(
                registro,
                'cpf'
            )
        );


    const data =
        obterValor(
            registro,
            'dataAssinatura'
        ) ||
        obterValor(
            registro,
            'dataHora'
        ) ||
        '';


    if (!assinatura) {

        return `

            <div class="signature-empty-admin">

                <div class="signature-empty-icon">
                    ✍
                </div>

                <strong>
                    Assinatura não registrada
                </strong>

                <small>
                    Nenhuma assinatura foi encontrada neste cadastro.
                </small>

            </div>

        `;

    }


    if (
        assinatura
            .toUpperCase()
            .startsWith('ASS-')
    ) {

        return `

            <div class="digital-stamp">

                <div class="digital-stamp-inner">

                    <div class="digital-stamp-name">
                        ${escaparHTML(nome)}
                    </div>

                    <div class="digital-stamp-cpf">
                        CPF:
                        ${escaparHTML(
                            cpf ||
                            'Não informado'
                        )}
                    </div>

                    <div class="digital-stamp-title">
                        ASSINATURA DIGITAL
                    </div>

                    <div class="digital-stamp-date">
                        ${escaparHTML(data)}
                    </div>

                </div>

            </div>

        `;

    }


    if (
        assinatura.startsWith(
            'data:image/'
        )
    ) {

        return `

            <div class="signature-image-container">

                <img
                    src="${escaparAtributo(assinatura)}"
                    class="signature-admin-image"
                    alt="Assinatura do motorista"
                >

            </div>

        `;

    }


    return `

        <div class="signature-text-admin">
            ${escaparHTML(assinatura)}
        </div>

    `;

}


/* =========================================================
   EDIÇÃO
   ========================================================= */

function abrirEdicaoPorLinha(
    linha
) {

    const registro =
        encontrarPorLinha(linha);


    if (!registro) {

        alert(
            'Registro não encontrado.'
        );

        return;

    }


    const titulo =
        document.getElementById(
            'modalTitle'
        );


    const conteudo =
        document.getElementById(
            'modalContent'
        );


    if (!conteudo) {
        return;
    }


    if (titulo) {

        titulo.textContent =
            `Editar - ${
                obterValor(
                    registro,
                    'nome'
                ) ||
                'Cadastro'
            }`;

    }


    conteudo.innerHTML =
        gerarFormularioEdicaoAdmin(
            registro
        );


    abrirModal();


    const form =
        document.getElementById(
            'formEdicaoAdmin'
        );


    if (form) {

        form.addEventListener(
            'submit',
            function (event) {

                event.preventDefault();

                salvarEdicao(
                    registro
                );

            }
        );

    }


    configurarFormatacaoCPFEdicao();

    configurarFormatacaoPlacasEdicao();

}


/* =========================================================
   FORMULÁRIO DE EDIÇÃO
   ========================================================= */

function gerarFormularioEdicaoAdmin(
    registro
) {

    return `

        <form
            id="formEdicaoAdmin"
            autocomplete="off"
        >

            <!-- MOTORISTA -->

            <div class="edit-section">

                <div class="edit-section-title">
                    Motorista
                </div>

                <div class="edit-grid">

                    ${gerarCampoEdicao(
                        'nome',
                        'Nome Completo',
                        registro,
                        'text',
                        true
                    )}

                    ${gerarCampoEdicao(
                        'celular',
                        'Celular',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'cpf',
                        'CPF',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'cnh',
                        'CNH',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'validadeCnh',
                        'Validade CNH',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'calcado',
                        'Calçado de Segurança?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'trajes',
                        'Trajes adequados?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'colete',
                        'Colete Refletivo?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'comprovei',
                        'App Comprovei?',
                        registro
                    )}

                </div>

            </div>


            <!-- CAMINHÃO -->

            <div class="edit-section">

                <div class="edit-section-title">
                    Caminhão
                </div>

                <div class="edit-grid">

                    ${gerarCampoEdicao(
                        'dt',
                        'DT',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'transportadora',
                        'Transportadora',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'placaCavalo',
                        'Placa Cavalo / Truck',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'placaCarreta01',
                        'Placa Carreta 01',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'placaCarreta02',
                        'Placa Carreta 02',
                        registro
                    )}

                    ${gerarCampoEdicao(
                        'tipoVeiculo',
                        'Tipo Veículo',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'empilhadeira',
                        'Autoriza Entrada de Empilhadeira?',
                        registro
                    )}

                </div>

            </div>


            <!-- CHECKLIST -->

            <div class="edit-section">

                <div class="edit-section-title">
                    Checklist
                </div>

                <div class="edit-grid">

                    ${gerarCampoSelectSimNao(
                        'limpo',
                        'Limpo e sem resíduo?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'odores',
                        'Isento de odores estranhos?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'umidade',
                        'Isento de umidade ou vazamento?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'objetos',
                        'Isento de objetos pontiagudos?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'piso',
                        'Piso reto e sem furos?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'reguas',
                        'Réguas retas sem protuberância?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'laterais',
                        'Laterais sem furos ou rasgos?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'teto',
                        'Teto sem furos ou rasgos?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'vigas',
                        'Vigas do teto sem risco de corte?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'farois',
                        'Faróis?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'luzes',
                        'Luzes e lanternas?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'sirene',
                        'Sirene de ré?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'madeirites',
                        'Madeirites e Lona?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'extintor',
                        'Extintor de Incêndio?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'paralamas',
                        'Paralamas?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'pneus',
                        'Pneus de rodagem e step?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'espelhos',
                        'Espelhos retrovisores?',
                        registro
                    )}

                    ${gerarCampoSelectSimNao(
                        'parachoque',
                        'Para-choque?',
                        registro
                    )}

                </div>

            </div>


            <!-- INFORMAÇÕES PROTEGIDAS -->

            <div class="edit-section">

                <div class="edit-section-title">
                    Informações protegidas
                </div>

                <div class="edit-grid">

                    ${gerarCampoSomenteLeitura(
                        'dataHora',
                        'Data / Hora do cadastro',
                        registro
                    )}

                    ${gerarCampoSomenteLeitura(
                        'dataAssinatura',
                        'Data/Hora da assinatura',
                        registro
                    )}

                    ${gerarCampoSomenteLeitura(
                        'assinatura',
                        'Assinatura do Motorista',
                        registro,
                        true
                    )}

                    <div class="edit-note edit-field full">

                        Os campos de data/hora e assinatura
                        são preservados durante a edição
                        administrativa.

                        O CPF pode ser corrigido pelo
                        administrador, mas continua sujeito
                        à validação.

                    </div>

                </div>

            </div>


            <div
                id="editMessage"
                class="modal-message hidden"
            ></div>


            <div class="edit-actions">

                <button
                    type="button"
                    class="btn-modal-secondary"
                    onclick="excluirRegistro(${obterLinha(registro)})"
                    style="background:#dc2626;color:#fff;"
                >
                    Excluir Registro
                </button>

                <button
                    type="button"
                    class="btn-modal-secondary"
                    onclick="fecharModal()"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    id="saveEditButton"
                    class="btn-modal-primary"
                >
                    Salvar alterações
                </button>

            </div>

        </form>

    `;

}


function gerarCampoEdicao(
    campo,
    label,
    registro,
    tipo = 'text',
    full = false
) {

    const valor =
        obterValor(
            registro,
            campo
        );


    return `

        <div class="edit-field ${
            full ? 'full' : ''
        }">

            <label for="edit_${campo}">
                ${escaparHTML(label)}
            </label>

            <input
                type="${tipo}"
                id="edit_${campo}"
                name="${campo}"
                value="${escaparAtributo(valor)}"
            >

        </div>

    `;

}


function gerarCampoSelectSimNao(
    campo,
    label,
    registro
) {

    const valor =
        normalizarSimNao(
            obterValor(
                registro,
                campo
            )
        );


    return `

        <div class="edit-field">

            <label for="edit_${campo}">
                ${escaparHTML(label)}
            </label>

            <select
                id="edit_${campo}"
                name="${campo}"
            >

                <option
                    value=""
                    ${!valor ? 'selected' : ''}
                >
                    Não informado
                </option>

                <option
                    value="Sim"
                    ${valor === 'sim'
                        ? 'selected'
                        : ''}
                >
                    Sim
                </option>

                <option
                    value="Não"
                    ${valor === 'nao'
                        ? 'selected'
                        : ''}
                >
                    Não
                </option>

            </select>

        </div>

    `;

}


function gerarCampoSomenteLeitura(
    campo,
    label,
    registro,
    full = false
) {

    const valor =
        obterValor(
            registro,
            campo
        );


    return `

        <div class="edit-field ${
            full ? 'full' : ''
        }">

            <label for="edit_${campo}">
                ${escaparHTML(label)}
            </label>

            <input
                type="text"
                id="edit_${campo}"
                value="${escaparAtributo(valor)}"
                readonly
            >

        </div>

    `;

}


/* =========================================================
   SALVAR EDIÇÃO
   ========================================================= */

async function salvarEdicao(
    registro
) {

    const botao =
        document.getElementById(
            'saveEditButton'
        );


    if (!registro) {
        return;
    }


    const cpf =
        obterInputEdicao(
            'cpf'
        );


    if (
        cpf &&
        !validarCPF(cpf)
    ) {

        mostrarMensagemEdicao(
            'CPF inválido. Verifique os números informados.',
            'error'
        );

        return;

    }


    if (botao) {

        botao.disabled = true;

        botao.textContent =
            'Salvando...';

    }


    try {

        const dadosAtualizados = {};


        Object.keys(CAMPOS).forEach(
            function (campo) {

                dadosAtualizados[campo] =
                    obterValor(
                        registro,
                        campo
                    );

            }
        );


        CAMPOS_EDITAVEIS.forEach(
            function (campo) {

                const elemento =
                    document.getElementById(
                        `edit_${campo}`
                    );


                if (!elemento) {
                    return;
                }


                dadosAtualizados[campo] =
                    elemento.value;

            }
        );


        // Preservar campos protegidos

        dadosAtualizados.dataHora =
            obterValor(
                registro,
                'dataHora'
            );

        dadosAtualizados.assinatura =
            obterValor(
                registro,
                'assinatura'
            );

        dadosAtualizados.dataAssinatura =
            obterValor(
                registro,
                'dataAssinatura'
            );


        const linha =
            obterLinha(
                registro
            );


        const cpfAtual =
            obterValor(
                registro,
                'cpf'
            );


        const tokenAtual =
            token ||
            sessionStorage.getItem(
                'adminToken'
            ) ||
            '';


        if (!tokenAtual) {

            throw new Error(
                'Sessão administrativa expirada.'
            );

        }


        const corpo =
            new URLSearchParams();


        corpo.append(
            'action',
            'atualizar'
        );

        corpo.append(
            'token',
            tokenAtual
        );

        corpo.append(
            'linha',
            String(linha)
        );

        corpo.append(
            'cpfAtual',
            cpfAtual || ''
        );

        corpo.append(
            'dados',
            JSON.stringify(
                dadosAtualizados
            )
        );


        const resposta =
            await fetch(
                URL_PLANILHA,
                {
                    method: 'POST',
                    body: corpo
                }
            );


        if (!resposta.ok) {

            throw new Error(
                `HTTP ${resposta.status}`
            );

        }


        const resultado =
            await resposta.json();


        console.log(
            'Resposta atualização:',
            resultado
        );


        if (
            resultado &&
            resultado.sucesso === false
        ) {

            throw new Error(
                resultado.mensagem ||
                'Não foi possível atualizar o cadastro.'
            );

        }


        mostrarMensagemEdicao(
            'Cadastro atualizado com sucesso.',
            'success'
        );


        await carregarDados();


        setTimeout(
            function () {

                fecharModal();

            },
            700
        );


    } catch (erro) {

        console.error(
            'Erro ao salvar edição:',
            erro
        );


        mostrarMensagemEdicao(
            erro.message ||
            'Não foi possível salvar as alterações.',
            'error'
        );


        if (
            erro.message &&
            erro.message
                .toLowerCase()
                .includes('sessão')
        ) {

            setTimeout(
                encerrarSessao,
                1000
            );

        }

    } finally {

        if (botao) {

            botao.disabled = false;

            botao.textContent =
                'Salvar alterações';

        }

    }

}
/* =========================================================
   EXCLUIR REGISTRO
   ========================================================= */

async function excluirRegistro(linha) {

    const confirma = confirm(
        'Tem certeza que deseja excluir este cadastro?'
    );

    if (!confirma) {
        return;
    }

    try {

        const tokenAtual =
            token ||
            sessionStorage.getItem(
                'adminToken'
            ) ||
            '';

        const corpo =
            new URLSearchParams();

        corpo.append(
            'action',
            'excluir'
        );

        corpo.append(
            'token',
            tokenAtual
        );

        corpo.append(
            'linha',
            String(linha)
        );

        const resposta =
            await fetch(
                URL_PLANILHA,
                {
                    method: 'POST',
                    body: corpo
                }
            );

        const resultado =
            await resposta.json();

        if (
            resultado &&
            resultado.sucesso
        ) {

            alert(
                'Registro excluído com sucesso.'
            );

            fecharModal();

            await carregarDados();

        } else {

            alert(
                resultado.mensagem ||
                'Erro ao excluir.'
            );

        }

    } catch (erro) {

        console.error(erro);

        alert(
            'Erro ao excluir registro.'
        );

    }

}


function mostrarMensagemEdicao(
    mensagem,
    tipo
) {

    const elemento =
        document.getElementById(
            'editMessage'
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensagem;


    elemento.className =
        `modal-message ${tipo}`;

}


/* =========================================================
   FORMATAÇÃO DA EDIÇÃO
   ========================================================= */

function configurarFormatacaoCPFEdicao() {

    const input =
        document.getElementById(
            'edit_cpf'
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        'input',
        function () {

            input.value =
                formatarCPF(
                    input.value
                );

        }
    );

}


function configurarFormatacaoPlacasEdicao() {

    const campos = [
        'placaCavalo',
        'placaCarreta01',
        'placaCarreta02'
    ];


    campos.forEach(
        function (campo) {

            const input =
                document.getElementById(
                    `edit_${campo}`
                );


            if (!input) {
                return;
            }


            input.addEventListener(
                'input',
                function () {

                    input.value =
                        formatarPlaca(
                            input.value
                        );

                }
            );

        }
    );

}


/* =========================================================
   PESQUISAS
   ========================================================= */

function configurarPesquisas() {

    configurarPesquisa(
        'searchDashboard',
        function (valor) {

            renderizarDashboard(
                valor
            );

        }
    );


    configurarPesquisa(
        'searchMotorista',
        function (valor) {

            renderizarMotoristas(
                valor
            );

        }
    );


    configurarPesquisa(
        'searchCaminhao',
        function (valor) {

            renderizarCaminhoes(
                valor
            );

        }
    );


    configurarPesquisa(
        'searchChecklist',
        function (valor) {

            renderizarChecklists(
                valor
            );

        }
    );

}


function configurarPesquisa(
    id,
    callback
) {

    const input =
        document.getElementById(id);


    if (!input) {
        return;
    }


    input.addEventListener(
        'input',
        function () {

            callback(
                input.value.trim()
            );

        }
    );

}


/* =========================================================
   FILTRO GERAL
   ========================================================= */

function filtrarRegistros(
    lista,
    busca
) {

    if (!busca) {

        return lista.slice();

    }


    const termo =
        normalizarTexto(
            busca
        );


    return lista.filter(
        function (registro) {

        const valores = [

            obterValor(registro, 'nome'),
            obterValor(registro, 'cpf'),
            obterValor(registro, 'cnh'),
            obterValor(registro, 'celular'),

            obterValor(registro, 'dt'),
            obterValor(registro, 'transportadora'),

            obterValor(registro, 'placaCavalo'),
            obterValor(registro, 'placaCarreta01'),
            obterValor(registro, 'placaCarreta02')

        ];


            return valores.some(
                function (valor) {

                    return normalizarTexto(
                        valor
                    ).includes(
                        termo
                    );

                }
            );

        }
    );

}


/* =========================================================
   MODAL
   ========================================================= */

function configurarModal() {

    const modal =
        document.getElementById(
            'detailsModal'
        );


    const fechar =
        document.getElementById(
            'closeModal'
        );


    const overlay =
        modal?.querySelector(
            '.modal-overlay'
        );


    if (fechar) {

        fechar.addEventListener(
            'click',
            fecharModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            'click',
            fecharModal
        );

    }


    document.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key === 'Escape'
            ) {

                const aberto =
                    document.getElementById(
                        'detailsModal'
                    );


                if (
                    aberto &&
                    !aberto.classList.contains(
                        'hidden'
                    )
                ) {

                    fecharModal();

                }

            }

        }
    );

}


function abrirModal() {

    const modal =
        document.getElementById(
            'detailsModal'
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        'hidden'
    );


    modal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.classList.add(
        'modal-open'
    );

}


function fecharModal() {

    const modal =
        document.getElementById(
            'detailsModal'
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        'hidden'
    );


    modal.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.classList.remove(
        'modal-open'
    );

}


/* =========================================================
   ACESSO AOS DADOS
   ========================================================= */

function obterValor(
    registro,
    campo
) {

    if (!registro) {
        return '';
    }


    if (
        registro[campo] !== undefined &&
        registro[campo] !== null
    ) {

        return registro[campo];

    }


    const nomeCampo =
        CAMPOS[campo];


    if (
        nomeCampo &&
        registro[nomeCampo] !== undefined &&
        registro[nomeCampo] !== null
    ) {

        return registro[nomeCampo];

    }


    return '';

}


function obterLinha(
    registro
) {

    if (!registro) {
        return 0;
    }


    return Number(
        registro.linha ||
        registro.row ||
        registro.rowNumber ||
        registro._linha ||
        0
    );

}


function encontrarPorLinha(
    linha
) {

    const numero =
        Number(linha);


    return registros.find(
        function (registro) {

            return (
                obterLinha(
                    registro
                ) === numero
            );

        }
    );

}


function encontrarPorCPF(
    cpf
) {

    const normalizado =
        somenteNumeros(
            cpf
        );


    return registros.find(
        function (registro) {

            return (
                somenteNumeros(
                    obterValor(
                        registro,
                        'cpf'
                    )
                ) === normalizado
            );

        }
    );

}


function obterInputEdicao(
    campo
) {

    const elemento =
        document.getElementById(
            `edit_${campo}`
        );


    return elemento
        ? elemento.value.trim()
        : '';

}


function obterValorInput(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


    return elemento
        ? elemento.value.trim()
        : '';

}


/* =========================================================
   STATUS
   ========================================================= */

function registroTemPendencia(
    registro
) {

    const camposPendencia = [

        ...CAMPOS_CHECKLIST,

        'trajes',
        'colete',
        'comprovei',
        'calcado'

    ];

    return camposPendencia.some(
        function (campo) {

            const valor =
                normalizarSimNao(
                    obterValor(
                        registro,
                        campo
                    )
                );

            return valor === 'nao';

        }
    );

}


function textoSituacao(
    registro
) {

    if (
        registroTemPendencia(
            registro
        )
    ) {

        return 'Pendência encontrada';

    }

    if (
        possuiChecklist(
            registro
        )
    ) {

        return 'Conforme';

    }

    return 'Registrado';

}


function gerarStatusHTML(
    registro
) {

    if (
        registroTemPendencia(
            registro
        )
    ) {

        return `
            <span class="status-badge status-error">
                Pendência
            </span>
        `;

    }


    if (
        possuiChecklist(
            registro
        )
    ) {

        return `
            <span class="status-badge status-ok">
                Conforme
            </span>
        `;

    }


    return `
        <span class="status-badge status-neutral">
            Registrado
        </span>
    `;

}


function gerarSimNaoTabela(
    valor
) {

    const estado =
        normalizarSimNao(
            valor
        );


    if (
        estado === 'sim'
    ) {

        return `
            <span class="status-badge status-ok">
                Sim
            </span>
        `;

    }


    if (
        estado === 'nao'
    ) {

        return `
            <span class="status-badge status-error">
                Não
            </span>
        `;

    }

    if (
        estado === 'na'
    ) {

        return `
            <span class="status-badge status-na">
                N/A
            </span>
        `;

    }

    return `
        <span class="status-badge status-neutral">
            -
        </span>
    `;

}


function formatarSimNao(
    valor
) {

    const estado =
        normalizarSimNao(
            valor
        );


    if (
        estado === 'sim'
    ) {

        return 'Sim';

    }


    if (
        estado === 'nao'
    ) {

        return 'Não';

    }

    return 'Não informado';

}


function normalizarSimNao(
    valor
) {

    const texto =
        String(
            valor ?? ''
        )
            .trim()
            .toLowerCase();


    if (
        [
            'sim',
            's',
            'yes',
            'true',
            '1',
            'ok',
            'conforme'
        ].includes(texto)
    ) {

        return 'sim';

    }


    if (
        [
            'não',
            'nao',
            'n',
            'no',
            'false',
            '0',
            'pendente',
            'irregular'
        ].includes(texto)
    ) {

        return 'nao';

    }

    if (
    [
        'n/a',
        'na',
        'não se aplica',
        'nao se aplica'
    ].includes(texto)
) {

    return 'na';

}

    return '';

}


function possuiChecklist(
    registro
) {

    if (!registro) {
        return false;
    }


    return CAMPOS_CHECKLIST.some(
        function (campo) {

            const valor =
                obterValor(
                    registro,
                    campo
                );


            return (
                valor !== undefined &&
                valor !== null &&
                String(valor).trim() !== ''
            );

        }
    );

}


/* =========================================================
   RESUMOS DO CHECKLIST
   ========================================================= */

function gerarChecklistEstrutura(
    registro
) {

    const campos = [
        'piso',
        'reguas',
        'laterais',
        'teto',
        'vigas'
    ];


    return gerarResumoChecklist(
        registro,
        campos
    );

}


function gerarChecklistSeguranca(
    registro
) {

    const campos = [
        'farois',
        'luzes',
        'sirene',
        'extintor',
        'pneus',
        'espelhos',
        'parachoque'
    ];


    return gerarResumoChecklist(
        registro,
        campos
    );

}


function gerarResumoChecklist(
    registro,
    campos
) {

    let temNao = false;
    let temSim = false;


    campos.forEach(
        function (campo) {

            const estado =
                normalizarSimNao(
                    obterValor(
                        registro,
                        campo
                    )
                );


            if (
                estado === 'nao'
            ) {

                temNao = true;

            }


            if (
                estado === 'sim'
            ) {

                temSim = true;

            }

        }
    );


    if (temNao) {

        return `
            <span class="status-badge status-error">
                Não conforme
            </span>
        `;

    }


    if (temSim) {

        return `
            <span class="status-badge status-ok">
                Conforme
            </span>
        `;

    }


    return `
        <span class="status-badge status-neutral">
            -
        </span>
    `;

}


/* =========================================================
   CPF
   ========================================================= */

function somenteNumeros(
    valor
) {

    return String(
        valor ?? ''
    ).replace(
        /\D/g,
        ''
    );

}


function formatarCPF(
    valor
) {

    const numeros =
        somenteNumeros(
            valor
        ).slice(
            0,
            11
        );


    if (!numeros) {
        return '';
    }


    if (
        numeros.length <= 3
    ) {

        return numeros;

    }


    if (
        numeros.length <= 6
    ) {

        return (
            numeros.slice(0, 3) +
            '.' +
            numeros.slice(3)
        );

    }


    if (
        numeros.length <= 9
    ) {

        return (
            numeros.slice(0, 3) +
            '.' +
            numeros.slice(3, 6) +
            '.' +
            numeros.slice(6)
        );

    }


    return (
        numeros.slice(0, 3) +
        '.' +
        numeros.slice(3, 6) +
        '.' +
        numeros.slice(6, 9) +
        '-' +
        numeros.slice(9, 11)
    );

}


function validarCPF(
    valor
) {

    const cpf =
        somenteNumeros(
            valor
        );


    if (
        cpf.length !== 11
    ) {

        return false;

    }


    if (
        /^(\d)\1{10}$/.test(
            cpf
        )
    ) {

        return false;

    }


    let soma = 0;


    for (
        let i = 0;
        i < 9;
        i++
    ) {

        soma +=
            Number(cpf[i]) *
            (10 - i);

    }


    let resto =
        (soma * 10) % 11;


    if (
        resto === 10
    ) {

        resto = 0;

    }


    if (
        resto !==
        Number(cpf[9])
    ) {

        return false;

    }


    soma = 0;


    for (
        let i = 0;
        i < 10;
        i++
    ) {

        soma +=
            Number(cpf[i]) *
            (11 - i);

    }


    resto =
        (soma * 10) % 11;


    if (
        resto === 10
    ) {

        resto = 0;

    }


    return (
        resto ===
        Number(cpf[10])
    );

}


/* =========================================================
   PLACAS
   ========================================================= */

function formatarPlaca(
    valor
) {

    return String(
        valor ?? ''
    )
        .toUpperCase()
        .replace(
            /[^A-Z0-9]/g,
            ''
        )
        .slice(
            0,
            7
        );

}


/* =========================================================
   TEXTO / SEGURANÇA HTML
   ========================================================= */

function normalizarTexto(
    valor
) {

    return String(
        valor ?? ''
    )
        .normalize('NFD')
        .replace(
            /[\u0300-\u036f]/g,
            ''
        )
        .toLowerCase()
        .trim();

}


function escaparHTML(
    valor
) {

    return String(
        valor ?? ''
    )
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );

}


function escaparAtributo(
    valor
) {

    return escaparHTML(
        valor
    );

}


/* =========================================================
   TABELA VAZIA
   ========================================================= */

function gerarTabelaVazia(
    colspan,
    mensagem
) {

    return `

        <tr>

            <td
                colspan="${colspan}"
                class="empty-table"
            >

                ${escaparHTML(
                    mensagem
                )}

            </td>

        </tr>

    `;

}


/* =========================================================
   ESTILO BODY MODAL
   ========================================================= */

const estiloModalBody =
    document.createElement(
        'style'
    );


estiloModalBody.textContent = `

    body.modal-open {
        overflow: hidden;
    }

`;


document.head.appendChild(
    estiloModalBody
);


/* =========================================================
   FUNÇÕES GLOBAIS
   ========================================================= */

window.mudarSecao =
    mudarSecao;

window.abrirDetalhesPorLinha =
    abrirDetalhesPorLinha;

window.abrirEdicaoPorLinha =
    abrirEdicaoPorLinha;

window.fecharModal =
    fecharModal;

window.salvarEdicao =
    salvarEdicao;

window.excluirRegistro =
    excluirRegistro;
