// ============================================
// SCRIPT COMPARTILHADO - GERENCIAMENTO DE SESSÃO
// ============================================

// ============================================
// MAPEAMENTO DE PERFIS PARA PÁGINAS HOME
// ============================================

const HOME_PAGES = {
    'OPERACIONAL': 'home-operacional.html',
    'GESTAO': 'home-gestao.html',
    'VISUALIZACAO': 'home-visualizacao.html'
};

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE SESSÃO
// ============================================

/**
 * Cria sessão para o usuário (apenas dados básicos, sem senha)
 * @param {Object} usuario - Dados do usuário
 */
function criarSessao(usuario) {
    const sessao = {
        matricula: usuario.matricula,
        nome: usuario.nome,
        cpf: usuario.cpf,
        perfil: usuario.perfil || 'OPERACIONAL',
        timestamp: Date.now()
    };
    sessionStorage.setItem('sessaoSICGM', JSON.stringify(sessao));
}

/**
 * Verifica se a sessão atual é válida
 * @returns {Object|null} Dados da sessão ou null
 */
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

/**
 * Faz logout (encerra sessão)
 */
function logout() {
    sessionStorage.removeItem('sessaoSICGM');
    window.location.href = 'login.html';
}

/**
 * Redireciona para a página home conforme o perfil
 * @param {string} perfil - Perfil do usuário
 */
function redirecionarPorPerfil(perfil) {
    const perfilNormalizado = perfil.toUpperCase().trim();
    const homePage = HOME_PAGES[perfilNormalizado] || 'login.html';
    
    console.log(`🔀 Redirecionando para: ${homePage} (Perfil: ${perfilNormalizado})`);
    
    // Redirecionar para a página correta na raiz
    window.location.href = homePage;
}

/**
 * Redireciona para a home baseado no perfil atual
 * CORRIGIDO: Usa caminho absoluto a partir da raiz
 */
function redirecionarParaHome() {
    const sessao = verificarSessao();
    
    if (!sessao) {
        console.log('🔒 Sessão inválida - Redirecionando para login');
        window.location.href = 'login.html';
        return;
    }
    
    // Redireciona usando o caminho absoluto a partir da raiz
    const perfil = sessao.perfil.toUpperCase().trim();
    const homePage = HOME_PAGES[perfil] || 'login.html';
    
    console.log(`🔀 Redirecionando para: ${homePage} (Perfil: ${perfil})`);
    window.location.href = homePage;
}

/**
 * Obtém o perfil do usuário atual
 * @returns {string|null} Perfil ou null
 */
function getPerfilAtual() {
    const sessao = verificarSessao();
    return sessao ? sessao.perfil : null;
}

/**
 * Obtém a página home do perfil atual
 * @returns {string} Nome da página home
 */
function getHomePageAtual() {
    const sessao = verificarSessao();
    if (!sessao) return 'login.html';
    const perfilNormalizado = sessao.perfil.toUpperCase().trim();
    return HOME_PAGES[perfilNormalizado] || 'login.html';
}

/**
 * Obtém a página home para um perfil específico
 * @param {string} perfil - Perfil do usuário
 * @returns {string} Nome da página home
 */
function getPaginaHomePorPerfil(perfil) {
    const perfilNormalizado = perfil.toUpperCase().trim();
    return HOME_PAGES[perfilNormalizado] || 'login.html';
}

/**
 * Cria um botão de voltar para a home
 * @param {string} estilo - Estilo do botão ('padrao', 'pequeno', 'outline')
 * @returns {HTMLElement} Botão criado
 */
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

/**
 * Verifica se a sessão é válida e redireciona se necessário
 * @param {string} perfilRequerido - Perfil necessário para a página
 * @returns {Object|null} Dados da sessão ou null
 */
function verificarAcesso(perfilRequerido) {
    const sessao = verificarSessao();
    
    if (!sessao) {
        window.location.href = 'login.html';
        return null;
    }
    
    if (perfilRequerido && sessao.perfil !== perfilRequerido) {
        console.log(`🔒 Perfil ${sessao.perfil} não autorizado para esta página`);
        window.location.href = 'login.html';
        return null;
    }
    
    return sessao;
}

// ============================================
// FUNÇÕES GLOBAIS EXPORTADAS
// ============================================

// Expõe funções para uso global
window.verificarSessao = verificarSessao;
window.criarSessao = criarSessao;
window.logout = logout;
window.sair = logout; // Alias para logout
window.redirecionarPorPerfil = redirecionarPorPerfil;
window.redirecionarParaHome = redirecionarParaHome;
window.getPerfilAtual = getPerfilAtual;
window.getHomePageAtual = getHomePageAtual;
window.criarBotaoVoltarHome = criarBotaoVoltarHome;
window.getPaginaHomePorPerfil = getPaginaHomePorPerfil;
window.verificarAcesso = verificarAcesso;

// ============================================
// INICIALIZAÇÃO PARA PÁGINAS HOME
// ============================================

// Quando carregar qualquer página, verifica a sessão
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se está em uma página home (que não seja login)
    const isHomePage = document.getElementById('homeContent') !== null;
    
    if (isHomePage) {
        const sessao = verificarSessao();
        if (!sessao) {
            console.log('🔒 Sessão inválida - Redirecionando para login');
            window.location.href = 'login.html';
        }
    }
});