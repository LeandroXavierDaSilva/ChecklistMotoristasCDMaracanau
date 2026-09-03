// ============================================================
// CADASTRO DO MOTORISTA
// ============================================================

// Formulário
const cadastroForm = document.getElementById("cadastroForm");

// Campos
const cpfInput = document.getElementById("cpf");
const cpfError = document.getElementById("cpfError");
const celularInput = document.getElementById("celular");
const cnhInput = document.getElementById("cnh");
const validadeCnhInput = document.getElementById("validadeCnh");
const validadeCnhError = document.getElementById("validadeCnhError");


// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function somenteNumeros(valor) {
    return String(valor || "").replace(/\D/g, "");
}


// ============================================================
// CPF - FORMATAÇÃO
// ============================================================

function formatarCPF(valor) {

    valor = somenteNumeros(valor);

    if (valor.length > 11) {
        valor = valor.substring(0, 11);
    }

    if (valor.length <= 3) {
        return valor;
    }

    if (valor.length <= 6) {
        return (
            valor.substring(0, 3) +
            "." +
            valor.substring(3)
        );
    }

    if (valor.length <= 9) {
        return (
            valor.substring(0, 3) +
            "." +
            valor.substring(3, 6) +
            "." +
            valor.substring(6)
        );
    }

    return (
        valor.substring(0, 3) +
        "." +
        valor.substring(3, 6) +
        "." +
        valor.substring(6, 9) +
        "-" +
        valor.substring(9, 11)
    );
}


// ============================================================
// CPF - VALIDAÇÃO
// ============================================================

function validarCPF(cpf) {

    cpf = somenteNumeros(cpf);

    if (cpf.length !== 11) {
        return false;
    }

    // Impede CPFs com todos os números iguais
    if (/^(\d)\1{10}$/.test(cpf)) {
        return false;
    }

    // Primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
        soma += Number(cpf.charAt(i)) * (10 - i);
    }

    let resto = soma % 11;

    let digito1 =
        resto < 2
            ? 0
            : 11 - resto;

    if (digito1 !== Number(cpf.charAt(9))) {
        return false;
    }

    // Segundo dígito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
        soma += Number(cpf.charAt(i)) * (11 - i);
    }

    resto = soma % 11;

    let digito2 =
        resto < 2
            ? 0
            : 11 - resto;

    if (digito2 !== Number(cpf.charAt(10))) {
        return false;
    }

    return true;
}


// ============================================================
// CPF - EVENTO DE DIGITAÇÃO
// ============================================================

if (cpfInput) {

    cpfInput.addEventListener("input", function () {

        this.value = formatarCPF(this.value);

        const cpf = somenteNumeros(this.value);

        // Ainda não completou 11 números
        if (cpf.length < 11) {

            if (cpfError) {
                cpfError.textContent = "";
            }

            this.classList.remove("input-error");

            return;
        }

        // CPF completo e válido
        if (validarCPF(cpf)) {

            if (cpfError) {
                cpfError.textContent = "";
            }

            this.classList.remove("input-error");

        }

        // CPF completo, mas inválido
        else {

            if (cpfError) {
                cpfError.textContent = "CPF inválido.";
            }

            this.classList.add("input-error");
        }
    });
}


// ============================================================
// CELULAR - FORMATAÇÃO
// ============================================================

if (celularInput) {

    celularInput.addEventListener("input", function () {

        let valor = somenteNumeros(this.value);

        // Limita a 11 números
        valor = valor.substring(0, 11);

        if (valor.length <= 2) {

            this.value = valor;

        }

        else if (valor.length <= 7) {

            this.value =
                "(" +
                valor.substring(0, 2) +
                ") " +
                valor.substring(2);

        }

        else {

            this.value =
                "(" +
                valor.substring(0, 2) +
                ") " +
                valor.substring(2, 7) +
                "-" +
                valor.substring(7);
        }
    });
}


// ============================================================
// CNH
// PERMITIR SOMENTE ATÉ 9 NÚMEROS
// ============================================================

if (cnhInput) {

    cnhInput.addEventListener("input", function () {

        let valor = somenteNumeros(this.value);

        // Limita a 9 números
        if (valor.length > 9) {
            valor = valor.substring(0, 9);
        }

        this.value = valor;
    });
}


// ============================================================
// VALIDADE DA CNH - FORMATAÇÃO
// FORMATO: DD/MM/AAAA
// ============================================================

if (validadeCnhInput) {

    validadeCnhInput.addEventListener("input", function () {

        let valor = somenteNumeros(this.value);

        // Limita a 8 números
        if (valor.length > 8) {
            valor = valor.substring(0, 8);
        }

        // DD
        if (valor.length <= 2) {

            this.value = valor;
        }

        // DD/MM
        else if (valor.length <= 4) {

            this.value =
                valor.substring(0, 2) +
                "/" +
                valor.substring(2);
        }

        // DD/MM/AAAA
        else {

            this.value =
                valor.substring(0, 2) +
                "/" +
                valor.substring(2, 4) +
                "/" +
                valor.substring(4);
        }

        // ====================================================
        // VALIDAÇÃO EM TEMPO REAL
        // ====================================================

        const resultado =
            validarDataCnhEmTempoReal(this.value);

        if (!resultado.valida) {

            if (validadeCnhError) {
                validadeCnhError.textContent =
                    resultado.mensagem;
            }

            this.classList.add("input-error");

        }

        else {

            if (validadeCnhError) {
                validadeCnhError.textContent = "";
            }

            this.classList.remove("input-error");
        }
    });
}


// ============================================================
// OBTER VALOR DO CAMPO
// ============================================================

function obterValor(nomeCampo) {

    const campo =
        cadastroForm.elements[nomeCampo];

    if (!campo) {
        return "";
    }

    return String(
        campo.value || ""
    ).trim();
}


// ============================================================
// VALIDAÇÃO DA DATA EM TEMPO REAL
// ============================================================

function validarDataCnhEmTempoReal(data) {

    const numeros =
        data.replace(/\D/g, "");

    // Campo vazio
    if (numeros.length === 0) {

        return {
            valida: true,
            mensagem: ""
        };
    }


    // ========================================================
    // DIA
    // ========================================================

    if (numeros.length >= 2) {

        const dia =
            Number(numeros.substring(0, 2));

        if (dia < 1 || dia > 31) {

            return {
                valida: false,
                mensagem: "Informe uma data válida."
            };
        }
    }


    // ========================================================
    // MÊS
    // ========================================================

    if (numeros.length >= 4) {

        const dia =
            Number(numeros.substring(0, 2));

        const mes =
            Number(numeros.substring(2, 4));


        if (mes < 1 || mes > 12) {

            return {
                valida: false,
                mensagem: "Informe uma data válida."
            };
        }


        // Verifica quantidade de dias do mês
        const diasNoMes =
            new Date(2024, mes, 0).getDate();


        if (dia > diasNoMes) {

            return {
                valida: false,
                mensagem: "Informe uma data válida."
            };
        }
    }


    // ========================================================
    // ANO
    // ========================================================

    if (numeros.length >= 8) {

        const dia =
            Number(numeros.substring(0, 2));

        const mes =
            Number(numeros.substring(2, 4));

        const ano =
            Number(numeros.substring(4, 8));


        if (ano < 1900 || ano > 2126) {

            return {
                valida: false,
                mensagem: "Informe uma data válida."
            };
        }


        // Verificação completa da data
        const dataObj =
            new Date(
                ano,
                mes - 1,
                dia
            );


        if (
            dataObj.getFullYear() !== ano ||
            dataObj.getMonth() !== mes - 1 ||
            dataObj.getDate() !== dia
        ) {

            return {
                valida: false,
                mensagem: "Informe uma data válida."
            };
        }
    }


    return {
        valida: true,
        mensagem: ""
    };
}


// ============================================================
// VALIDAÇÃO COMPLETA DA DATA DA CNH
// ============================================================

function validarDataCnh(data) {

    const formato =
        /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const resultado =
        data.match(formato);

    if (!resultado) {
        return false;
    }


    const dia =
        Number(resultado[1]);

    const mes =
        Number(resultado[2]);

    const ano =
        Number(resultado[3]);


    // Dia
    if (dia < 1 || dia > 31) {
        return false;
    }


    // Mês
    if (mes < 1 || mes > 12) {
        return false;
    }


    // Ano
    if (ano < 1900 || ano > 2126) {
        return false;
    }


    // Verifica se a data realmente existe
    const dataObj =
        new Date(
            ano,
            mes - 1,
            dia
        );


    if (
        dataObj.getFullYear() !== ano ||
        dataObj.getMonth() !== mes - 1 ||
        dataObj.getDate() !== dia
    ) {
        return false;
    }


    return true;
}


// ============================================================
// VALIDAR FORMULÁRIO
// ============================================================

function validarFormulario() {


    // ========================================================
    // NOME
    // ========================================================

    const nome =
        obterValor("nome");

    if (nome.length < 3) {

        alert(
            "Informe o nome completo do motorista."
        );

        cadastroForm.elements["nome"].focus();

        return false;
    }


    // ========================================================
    // CELULAR
    // ========================================================

    const celular =
        somenteNumeros(
            obterValor("celular")
        );

    if (
        celular.length !== 10 &&
        celular.length !== 11
    ) {

        alert(
            "Informe um número de celular válido."
        );

        celularInput.focus();

        return false;
    }


    // ========================================================
    // CPF
    // ========================================================

    const cpf =
        somenteNumeros(
            obterValor("cpf")
        );

    if (!validarCPF(cpf)) {

        if (cpfError) {
            cpfError.textContent =
                "Informe um CPF válido.";
        }

        cpfInput.classList.add(
            "input-error"
        );

        cpfInput.focus();

        return false;
    }


    if (cpfError) {
        cpfError.textContent = "";
    }

    cpfInput.classList.remove(
        "input-error"
    );


    // ========================================================
    // CNH
    // ========================================================

    const cnh =
        obterValor("cnh");

    const cnhNumeros =
        somenteNumeros(cnh);


    if (!cnh) {

        alert(
            "Informe o número da CNH."
        );

        cadastroForm.elements["cnh"].focus();

        return false;
    }


    if (cnhNumeros.length !== 9) {

        alert(
            "Informe um número de CNH válido com 9 dígitos."
        );

        cadastroForm.elements["cnh"].focus();

        return false;
    }


    // ========================================================
    // VALIDADE DA CNH
    // ========================================================

    const validadeCnh =
        obterValor("validadeCnh");


    if (!validadeCnh) {

        alert(
            "Informe a validade da CNH."
        );

        validadeCnhInput.focus();

        return false;
    }


    // Formato DD/MM/AAAA
    if (
        !/^\d{2}\/\d{2}\/\d{4}$/.test(
            validadeCnh
        )
    ) {

        alert(
            "Informe a validade da CNH no formato dd/mm/aaaa."
        );

        validadeCnhInput.focus();

        return false;
    }


    // Verifica se a data realmente existe
    if (!validarDataCnh(validadeCnh)) {

        alert(
            "Informe uma data de validade válida."
        );

        validadeCnhInput.focus();

        return false;
    }


    // ========================================================
    // EQUIPAMENTOS OBRIGATÓRIOS
    // ========================================================

    const calcado =
        obterValor("calcado");

    const trajes =
        obterValor("trajes");

    const colete =
        obterValor("colete");

    const comprovei =
        obterValor("comprovei");


    if (!calcado) {

        alert(
            "Informe se o motorista está utilizando calçado de segurança."
        );

        return false;
    }


    if (!trajes) {

        alert(
            "Informe se o motorista está utilizando os trajes obrigatórios."
        );

        return false;
    }


    if (!colete) {

        alert(
            "Informe se o motorista está utilizando colete refletivo."
        );

        return false;
    }


    if (!comprovei) {

        alert(
            "Informe se o motorista possui o App Comprovei."
        );

        return false;
    }


    return true;
}


// ============================================================
// CONVERTER DATA PARA DD/MM/AAAA
// ============================================================

function formatarDataBR(data) {

    if (!data) {
        return "";
    }


    // Já está em DD/MM/AAAA
    if (
        /^\d{2}\/\d{2}\/\d{4}$/.test(data)
    ) {
        return data;
    }


    // Caso venha em YYYY-MM-DD
    if (
        /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {

        const partes =
            data.split("-");

        return (
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0]
        );
    }


    return data;
}


// ============================================================
// ENVIO DO FORMULÁRIO
// ============================================================

if (cadastroForm) {

    cadastroForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // =================================================
            // VALIDAÇÃO
            // =================================================

            if (!validarFormulario()) {
                return;
            }


            // =================================================
            // PEGAR DADOS
            // =================================================

            const nome =
                obterValor("nome");

            const celular =
                obterValor("celular");

            const cpf =
                somenteNumeros(
                    obterValor("cpf")
                );

            const cnh =
                obterValor("cnh");

            const validadeCnh =
                obterValor("validadeCnh");

            const calcado =
                obterValor("calcado");

            const trajes =
                obterValor("trajes");

            const colete =
                obterValor("colete");

            const comprovei =
                obterValor("comprovei");


            // =================================================
            // OBJETO DO MOTORISTA
            // =================================================

            const dados = {

                nome: nome,

                celular: celular,

                cpf: cpf,

                cnh: cnh,

                validadeCnh:
                    formatarDataBR(
                        validadeCnh
                    ),

                calcado: calcado,

                trajes: trajes,

                colete: colete,

                comprovei: comprovei
            };


            // =================================================
            // SALVAR TEMPORARIAMENTE
            // =================================================

            try {

                sessionStorage.setItem(
                    "cadastroMotorista",
                    JSON.stringify(dados)
                );

            }

            catch (erro) {

                console.error(
                    "Erro ao salvar os dados:",
                    erro
                );

                alert(
                    "Não foi possível salvar os dados do motorista."
                );

                return;
            }


            // =================================================
            // IR PARA A PRÓXIMA PÁGINA
            // =================================================

            window.location.href =
                "caminhao.html";
        }
    );
}


// ============================================================
// RECUPERAR DADOS SALVOS
// ============================================================

function recuperarCadastroMotorista() {

    const dadosSalvos =
        sessionStorage.getItem(
            "cadastroMotorista"
        );


    if (!dadosSalvos) {
        return;
    }


    try {

        const dados =
            JSON.parse(
                dadosSalvos
            );


        // =====================================================
        // NOME
        // =====================================================

        if (
            cadastroForm.elements["nome"] &&
            dados.nome
        ) {

            cadastroForm.elements["nome"].value =
                dados.nome;
        }


        // =====================================================
        // CELULAR
        // =====================================================

        if (
            cadastroForm.elements["celular"] &&
            dados.celular
        ) {

            cadastroForm.elements["celular"].value =
                dados.celular;
        }


        // =====================================================
        // CPF
        // =====================================================

        if (
            cadastroForm.elements["cpf"] &&
            dados.cpf
        ) {

            cadastroForm.elements["cpf"].value =
                formatarCPF(
                    dados.cpf
                );
        }


        // =====================================================
        // CNH
        // =====================================================

        if (
            cadastroForm.elements["cnh"] &&
            dados.cnh
        ) {

            cadastroForm.elements["cnh"].value =
                dados.cnh;
        }


        // =====================================================
        // VALIDADE DA CNH
        // =====================================================

        if (
            cadastroForm.elements["validadeCnh"] &&
            dados.validadeCnh
        ) {

            cadastroForm.elements["validadeCnh"].value =
                formatarDataBR(
                    dados.validadeCnh
                );
        }


        // =====================================================
        // CALÇADO
        // =====================================================

        if (dados.calcado) {

            const campo =
                document.querySelector(
                    `input[name="calcado"][value="${dados.calcado}"]`
                );

            if (campo) {
                campo.checked = true;
            }
        }


        // =====================================================
        // TRAJES
        // =====================================================

        if (dados.trajes) {

            const campo =
                document.querySelector(
                    `input[name="trajes"][value="${dados.trajes}"]`
                );

            if (campo) {
                campo.checked = true;
            }
        }


        // =====================================================
        // COLETE
        // =====================================================

        if (dados.colete) {

            const campo =
                document.querySelector(
                    `input[name="colete"][value="${dados.colete}"]`
                );

            if (campo) {
                campo.checked = true;
            }
        }


        // =====================================================
        // COMPROVEI
        // =====================================================

        if (dados.comprovei) {

            const campo =
                document.querySelector(
                    `input[name="comprovei"][value="${dados.comprovei}"]`
                );

            if (campo) {
                campo.checked = true;
            }
        }

    }

    catch (erro) {

        console.error(
            "Erro ao recuperar cadastro:",
            erro
        );
    }
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

if (cadastroForm) {

    recuperarCadastroMotorista();

}
