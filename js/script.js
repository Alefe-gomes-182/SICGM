/// ============================================
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
                
                if (partes.length >= 3) {
                    const matricula = partes[0].trim();
                    const nome = partes[1].trim();
                    const cpf = partes[2].trim();
                    
                    // A senha são os 4 primeiros dígitos do CPF
                    const senha = cpf.substring(0, 4);
                    
                    return {
                        matricula: matricula,
                        nome: nome,
                        cpf: cpf,
                        senha: senha
                    };
                }
                return null;
            })
            .filter(colaborador => colaborador !== null); // Remove linhas inválidas
        
        console.log('✅ Colaboradores carregados:', databaseColaboradores.length);
        return databaseColaboradores;
        
    } catch (error) {
        console.error('❌ Erro ao carregar colaboradores:', error);
        
        // Dados de fallback (para testes)
        databaseColaboradores = [
            { matricula: "000172", nome: "DAMIAO BATISTA", cpf: "53192958472", senha: "5319" },
            { matricula: "016718", nome: "RICARDO VALERIO LINS DE ALBUQUERQUE", cpf: "63936003491", senha: "6393" },
            { matricula: "122904", nome: "BRUNO MOREIRA DA SILVA", cpf: "07915412159", senha: "0791" },
            { matricula: "170342", nome: "VALMIR SEVERINO DE LIMA SANTOS", cpf: "08796594403", senha: "0879" },
            { matricula: "170419", nome: "ARLINDO RODRIGUES DE ARAUJO", cpf: "09949433428", senha: "0994" }
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
    window.location.href = 'INDEX.HTML';
}

// Função para validar acesso à página home
function validarAcessoHome() {
    const sessao = verificarSessao();
    if (!sessao) {
        console.log('🔒 Sessão inválida ou expirada - Redirecionando para login');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ============================================
// EVENTOS DA PÁGINA DE LOGIN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de login...');
    
    // Verificar se já existe uma sessão ativa
    const sessao = verificarSessao();
    if (sessao) {
        console.log('👤 Sessão ativa encontrada para:', sessao.nome);
        // Redirecionar para home se já estiver logado
        window.location.href = 'home.html';
        return;
    }
    
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
                console.log('📝 Sessão criada com sucesso');
                
                // Redirecionar para a home
                setTimeout(() => {
                    window.location.href = 'home.html';
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
// VALIDAÇÃO AUTOMÁTICA PARA A PÁGINA HOME
// ============================================

// Função que será chamada automaticamente quando a home carregar
window.validarAcessoHome = validarAcessoHome;
