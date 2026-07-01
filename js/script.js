// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let databaseColaboradores = [];

// ============================================
// FUNÇÕES DE LOGIN
// ============================================

// Função para carregar colaboradores do arquivo de texto
async function carregarColaboradores() {
    try {
        const response = await fetch('/SICGM/data/colaboradores.txt');
        
        if (!response.ok) {
            throw new Error('Arquivo de colaboradores não encontrado');
        }
        
        const texto = await response.text();
        
        // Dividir o texto em linhas
        const linhas = texto.split('\n');
        
        // Processar cada linha (separador: TAB)
        databaseColaboradores = linhas
            .filter(linha => linha.trim() !== '') // Remove linhas vazias
            .map(linha => {
                // Divide por TAB (\t)
                const partes = linha.split('\t');
                
                // Verificar se tem pelo menos 4 partes (incluindo o perfil)
                if (partes.length >= 4) {
                    const matricula = partes[0].trim();
                    const nome = partes[1].trim();
                    const cpf = partes[2].trim();
                    const perfil = partes[3].trim().toUpperCase();
                    
                    // A senha são os 4 primeiros dígitos do CPF
                    const senha = cpf.substring(0, 4);
                    
                    return {
                        matricula: matricula,
                        nome: nome,
                        cpf: cpf,
                        senha: senha,
                        perfil: perfil // OPERACIONAL, GESTAO ou VISUALIZACAO
                    };
                } else if (partes.length >= 3) {
                    // Compatibilidade com versões antigas (sem perfil)
                    const matricula = partes[0].trim();
                    const nome = partes[1].trim();
                    const cpf = partes[2].trim();
                    const senha = cpf.substring(0, 4);
                    
                    return {
                        matricula: matricula,
                        nome: nome,
                        cpf: cpf,
                        senha: senha,
                        perfil: 'OPERACIONAL' // Perfil padrão para compatibilidade
                    };
                }
                return null;
            })
            .filter(colaborador => colaborador !== null); // Remove linhas inválidas
        
        console.log('✅ Colaboradores carregados:', databaseColaboradores.length);
        console.log('📊 Perfis:', databaseColaboradores.map(c => `${c.nome}: ${c.perfil}`));
        return databaseColaboradores;
        
    } catch (error) {
        console.error('❌ Erro ao carregar colaboradores:', error);
        
        // Dados de fallback (para testes)
        databaseColaboradores = [
            { matricula: "000172", nome: "DAMIAO BATISTA", cpf: "53192958472", senha: "5319", perfil: "OPERACIONAL" },
            { matricula: "016718", nome: "RICARDO VALERIO LINS DE ALBUQUERQUE", cpf: "63936003491", senha: "6393", perfil: "OPERACIONAL" },
            { matricula: "122904", nome: "BRUNO MOREIRA DA SILVA", cpf: "07915412159", senha: "0791", perfil: "OPERACIONAL" },
            { matricula: "170342", nome: "VALMIR SEVERINO DE LIMA SANTOS", cpf: "08796594403", senha: "0879", perfil: "OPERACIONAL" },
            { matricula: "170419", nome: "ARLINDO RODRIGUES DE ARAUJO", cpf: "09949433428", senha: "0994", perfil: "OPERACIONAL" }
        ];
        
        console.log('⚠️ Usando dados de fallback para testes');
        return databaseColaboradores;
    }
}

// Função para validar login
function validarLogin(matricula, senha, colaboradores) {
    return colaboradores.find(col => 
        col.matricula === matricula && 
        col.senha === senha
    );
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE SESSÃO
// ============================================

// Função para criar sessão (apenas para navegação entre páginas)
function criarSessao(usuario) {
    // Salvar em sessionStorage (apenas dados básicos, sem senha)
    const sessao = {
        matricula: usuario.matricula,
        nome: usuario.nome,
        cpf: usuario.cpf,
        perfil: usuario.perfil || 'OPERACIONAL',
        timestamp: Date.now()
    };
    sessionStorage.setItem('sessaoSICGM', JSON.stringify(sessao));
}

// Função para verificar sessão atual
function verificarSessao() {
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (!sessao) return null;
    
    try {
        const dados = JSON.parse(sessao);
        // Verificar se a sessão expirou (30 minutos)
        const tempoDecorrido = Date.now() - dados.timestamp;
        if (tempoDecorrido > 30 * 60 * 1000) { // 30 minutos
            sessionStorage.removeItem('sessaoSICGM');
            return null;
        }
        return dados;
    } catch (e) {
        return null;
    }
}

// Função para fazer logout (encerrar sessão)
function logout() {
    sessionStorage.removeItem('sessaoSICGM');
    window.location.href = 'index.html';
}

// ============================================
// MAPEAMENTO DE PERFIS PARA PÁGINAS HOME
// ============================================

const HOME_PAGES = {
    'OPERACIONAL': 'home-operacional.html',
    'GESTAO': 'home-gestao.html',
    'VISUALIZACAO': 'home-visualizacao.html'
};

// ============================================
// FUNÇÃO PARA REDIRECIONAR SEGUNDO PERFIL
// ============================================

function redirecionarPorPerfil(perfil) {
    // Normalizar perfil (maiúsculo e sem espaços)
    const perfilNormalizado = perfil.toUpperCase().trim();
    const homePage = HOME_PAGES[perfilNormalizado] || 'index.html';
    
    console.log(`🔀 Redirecionando para: ${homePage} (Perfil: ${perfilNormalizado})`);
    
    // Redirecionar para a página correta
    window.location.href = homePage;
}

// ============================================
// FUNÇÃO PARA REDIRECIONAR PARA HOME BASEADO NO PERFIL ATUAL
// ============================================

function redirecionarParaHome() {
    // Verificar sessão atual
    const sessao = verificarSessao();
    
    if (!sessao) {
        console.log('🔒 Sessão inválida - Redirecionando para login');
        window.location.href = 'index.html';
        return;
    }
    
    // Redirecionar baseado no perfil
    redirecionarPorPerfil(sessao.perfil);
}

// ============================================
// FUNÇÃO PARA OBTER O PERFIL ATUAL
// ============================================

function getPerfilAtual() {
    const sessao = verificarSessao();
    return sessao ? sessao.perfil : null;
}

// ============================================
// FUNÇÃO PARA OBTER A PÁGINA HOME DO PERFIL ATUAL
// ============================================

function getHomePageAtual() {
    const sessao = verificarSessao();
    if (!sessao) return 'index.html';
    const perfilNormalizado = sessao.perfil.toUpperCase().trim();
    return HOME_PAGES[perfilNormalizado] || 'index.html';
}

// ============================================
// FUNÇÃO PARA CRIAR BOTÃO DE VOLTAR DINÂMICO
// ============================================

function criarBotaoVoltarHome(estilo = 'padrao') {
    const botao = document.createElement('button');
    botao.innerHTML = '🏠 Voltar ao Início';
    botao.onclick = redirecionarParaHome;
    botao.className = 'btn-voltar-home';
    
    // Estilos diferentes conforme necessário
    const estilos = {
        'padrao': {
            background: '#4299E1',
            color: 'white',
            border: 'none',
            padding: '10px 25px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            margin: '10px 0'
        },
        'pequeno': {
            background: '#4299E1',
            color: 'white',
            border: 'none',
            padding: '6px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '12px',
            transition: 'all 0.3s ease',
            margin: '5px 0'
        },
        'outline': {
            background: 'transparent',
            color: '#4299E1',
            border: '2px solid #4299E1',
            padding: '8px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            margin: '10px 0'
        }
    };
    
    const estiloEscolhido = estilos[estilo] || estilos.padrao;
    Object.assign(botao.style, estiloEscolhido);
    
    // Efeitos hover
    botao.onmouseover = function() {
        if (estilo === 'outline') {
            this.style.background = '#4299E1';
            this.style.color = 'white';
        } else {
            this.style.background = '#3182CE';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.3)';
        }
    };
    
    botao.onmouseout = function() {
        if (estilo === 'outline') {
            this.style.background = 'transparent';
            this.style.color = '#4299E1';
        } else {
            this.style.background = estiloEscolhido.background;
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        }
    };
    
    return botao;
}

// ============================================
// FUNÇÃO PARA OBTER O NOME DA PÁGINA HOME POR PERFIL
// ============================================

function getPaginaHomePorPerfil(perfil) {
    const perfilNormalizado = perfil.toUpperCase().trim();
    return HOME_PAGES[perfilNormalizado] || 'index.html';
}

// ============================================
// EVENTOS DA PÁGINA DE LOGIN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de login...');
    
    // Carregar colaboradores
    carregarColaboradores().then(() => {
        console.log('✅ Sistema pronto para login');
    });
    
    // Configurar formulário de login
    const form = document.getElementById('loginForm');
    const mensagemErro = document.getElementById('mensagemErro');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const matricula = document.getElementById('matricula').value.trim();
            const senha = document.getElementById('senha').value.trim();
            
            // Limpar mensagens anteriores
            mensagemErro.textContent = '';
            mensagemErro.className = 'mensagem-erro';
            
            // Validação básica
            if (!matricula || !senha) {
                mensagemErro.textContent = '⚠️ Por favor, preencha todos os campos.';
                return;
            }
            
            // Validar senha (deve ter 4 dígitos)
            if (!/^\d{4}$/.test(senha)) {
                mensagemErro.textContent = '⚠️ A senha deve ter 4 dígitos (primeiros 4 dígitos do CPF).';
                return;
            }
            
            // Garantir que os colaboradores foram carregados
            if (databaseColaboradores.length === 0) {
                await carregarColaboradores();
            }
            
            // Validar login
            const usuario = validarLogin(matricula, senha, databaseColaboradores);
            
            if (usuario) {
                // Login bem-sucedido - CRIAR SESSÃO
                criarSessao(usuario);
                mensagemErro.textContent = '✅ Login realizado com sucesso!';
                mensagemErro.className = 'mensagem-sucesso';
                
                console.log('✅ Usuário logado:', usuario.nome);
                console.log('📝 Perfil:', usuario.perfil);
                console.log('📝 Sessão criada com sucesso');
                
                // Redirecionar para a home baseado no perfil
                setTimeout(() => {
                    redirecionarPorPerfil(usuario.perfil);
                }, 800);
            } else {
                // Login falhou
                mensagemErro.textContent = '❌ Matrícula ou senha inválidos. Tente novamente.';
                mensagemErro.className = 'mensagem-erro';
                
                // Limpar campo de senha e focar
                document.getElementById('senha').value = '';
                document.getElementById('senha').focus();
                
                console.log('❌ Tentativa de login falhou - Matrícula:', matricula);
            }
        });
    }
});

// ============================================
// FUNÇÃO GLOBAL PARA SAIR
// ============================================

window.sair = function() {
    logout();
};

// ============================================
// EXPOR FUNÇÕES GLOBAIS
// ============================================

window.verificarSessao = verificarSessao;
window.logout = logout;
window.redirecionarPorPerfil = redirecionarPorPerfil;
window.redirecionarParaHome = redirecionarParaHome;
window.getPerfilAtual = getPerfilAtual;
window.getHomePageAtual = getHomePageAtual;
window.criarBotaoVoltarHome = criarBotaoVoltarHome;
window.getPaginaHomePorPerfil = getPaginaHomePorPerfil; 