// ============================================
// LOGIN - FUNÇÕES ESPECÍFICAS
// ============================================

let databaseColaboradores = [];

/**
 * Carrega colaboradores do arquivo de texto
 * @returns {Promise<Array>} Lista de colaboradores
 */
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
            { matricula: "170419", nome: "ARLINDO RODRIGUES DE ARAUJO", cpf: "09949433428", senha: "0994", perfil: "OPERACIONAL" },
            { matricula: "999999", nome: "USUARIO TESTE GESTAO", cpf: "12345678901", senha: "1234", perfil: "GESTAO" }
        ];
        
        console.log('⚠️ Usando dados de fallback para testes');
        return databaseColaboradores;
    }
}

/**
 * Valida login do usuário
 * @param {string} matricula - Matrícula do usuário
 * @param {string} senha - Senha do usuário
 * @param {Array} colaboradores - Lista de colaboradores
 * @returns {Object|null} Usuário encontrado ou null
 */
function validarLogin(matricula, senha, colaboradores) {
    return colaboradores.find(col => 
        col.matricula === matricula && 
        col.senha === senha
    );
}

// ============================================
// INICIALIZAÇÃO DA PÁGINA DE LOGIN
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