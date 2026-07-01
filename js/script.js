// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let databaseColaboradores = [];
let materiaisCarregados = false;
let cacheQuantidades = {};

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
// FUNÇÃO CORRIGIDA PARA REDIRECIONAR SEGUNDO PERFIL
// ============================================

function redirecionarPorPerfil(perfil) {
    // Mapeamento de perfil para página home (nomes SEM ESPAÇOS)
    const homeMap = {
        'OPERACIONAL': 'home-operacional.html',
        'GESTAO': 'home-gestao.html',
        'VISUALIZACAO': 'home-visualizacao.html'
    };
    
    // Normalizar perfil (maiúsculo e sem espaços)
    const perfilNormalizado = perfil.toUpperCase().trim();
    const homePage = homeMap[perfilNormalizado] || 'index.html';
    
    console.log(`🔀 Redirecionando para: ${homePage} (Perfil: ${perfilNormalizado})`);
    
    // Redirecionar para a página correta
    window.location.href = homePage;
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

// ============================================
// FUNÇÕES PARA PÁGINA DE CONTAGEM DIÁRIA
// ============================================

// Função para carregar materiais de forma otimizada
async function carregarMateriaisOtimizado() {
    if (materiaisCarregados) return;
    
    const loadingDiv = document.getElementById('loading-materiais');
    if (loadingDiv) loadingDiv.style.display = 'block';
    
    try {
        // 1. Carregar materiais do arquivo
        const response = await fetch('../data/materiais.txt');
        const texto = await response.text();
        
        // 2. Processar em background
        await new Promise(resolve => {
            setTimeout(() => {
                processarMateriais(texto);
                resolve();
            }, 50);
        });
        
        // 3. Carregar trafos
        await carregarItensManuais();
        
        // 4. Criar abas otimizadas
        criarAbasOtimizado();
        
        materiaisCarregados = true;
        
    } catch (error) {
        console.error('Erro ao carregar materiais:', error);
        if (loadingDiv) {
            loadingDiv.innerHTML = '❌ Erro ao carregar materiais. Tente novamente.';
        }
    }
}

// Função para processar materiais
function processarMateriais(texto) {
    const linhas = texto.trim().split('\n');
    materiaisBanco = [];
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (linha) {
            const partes = linha.split('\t');
            if (partes.length >= 3) {
                const codigo = partes[0].trim();
                const descricao = partes[1].trim();
                const und = partes[2].trim();
                
                const jaExiste = materiaisBanco.some(m => m.codigo === codigo);
                if (!jaExiste) {
                    materiaisBanco.push({ codigo, descricao, und });
                }
            }
        }
    }
    
    console.log('📦 ' + materiaisBanco.length + ' materiais únicos carregados');
    organizarPorCategoria();
}

// ============================================
// FUNÇÃO CORRIGIDA: carregarItensManuais
// ============================================

// Função para carregar itens manuais do D1
async function carregarItensManuais() {
    try {
        // ✅ CORRIGIDO: URL correta da API
        const response = await fetch('https://noisy-snow-0359.alefe-gomes-72f.workers.dev/api/dados');
        const resultados = await response.json();
        
        const trafosMap = new Map();
        codigosExistentesDB = new Set();
        
        resultados.forEach(item => {
            const isTrafo = item.numero_serie || item.tombamento || item.oleo || item.cor;
            const isAtivo = item.ativo === undefined || item.ativo === 1 || item.ativo === true;
            
            if (isTrafo && isAtivo) {
                codigosExistentesDB.add(item.codigo);
                if (!trafosMap.has(item.codigo)) {
                    trafosMap.set(item.codigo, {
                        codigo: item.codigo,
                        descricao: item.descricao,
                        und: item.und,
                        numero_serie: item.numero_serie,
                        tombamento: item.tombamento,
                        oleo: item.oleo,
                        cor: item.cor,
                        ativo: true
                    });
                }
            }
        });
        
        materiaisManuais = Array.from(trafosMap.values());
        materiaisPorCategoria['trafos'] = materiaisManuais;
        
        console.log('⚡ ' + materiaisManuais.length + ' trafos ativos carregados');
        console.log('📊 ' + codigosExistentesDB.size + ' códigos existentes no banco');
        
    } catch (error) {
        console.error('Erro ao carregar itens manuais:', error);
        materiaisManuais = [];
        materiaisPorCategoria['trafos'] = [];
    }
}

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO OTIMIZADA
// ============================================

// Criar abas sem renderizar conteúdo
function criarAbasOtimizado() {
    const tabsNav = document.getElementById('tabs-nav');
    const tabsContent = document.getElementById('tabs-content');
    const loading = document.getElementById('loading-materiais');
    
    let htmlNav = '';
    let htmlContent = '';
    let primeiraCategoria = null;
    
    for (const [chave, categoria] of Object.entries(CATEGORIAS)) {
        const materiais = materiaisPorCategoria[chave] || [];
        
        if (!primeiraCategoria) primeiraCategoria = chave;
        
        htmlNav += `
            <button type="button" class="tab-btn" data-categoria="${chave}" onclick="ativarAbaOtimizado('${chave}')">
                <span class="tab-icone">${categoria.icone}</span>
                ${categoria.nome}
                <span class="tab-contador">${materiais.length}</span>
            </button>
        `;
        
        htmlContent += `
            <div class="tab-content" id="tab-${chave}">
                <div class="loading-aba" style="text-align:center; padding:20px; color:#718096;">
                    ⏳ Carregando ${categoria.nome}...
                </div>
            </div>
        `;
    }
    
    tabsNav.innerHTML = htmlNav;
    tabsContent.innerHTML = htmlContent;
    if (loading) loading.style.display = 'none';
    
    // Renderizar a primeira aba automaticamente
    if (primeiraCategoria) {
        renderizarAba(primeiraCategoria);
        ativarAba(primeiraCategoria);
    }
}

// Renderizar apenas a aba ativa
function renderizarAba(categoria) {
    const tabContent = document.getElementById(`tab-${categoria}`);
    if (!tabContent) return;
    
    const materiais = materiaisPorCategoria[categoria] || [];
    
    if (categoria === 'trafos') {
        tabContent.innerHTML = renderizarTrafos(materiais);
    } else {
        tabContent.innerHTML = renderizarMateriaisCategoria(materiais, categoria);
    }
    
    // Carregar quantidades anteriores apenas para os itens visíveis
    setTimeout(() => {
        carregarQuantidadesVisiveis(categoria);
    }, 100);
}

// Ativar aba com lazy loading
function ativarAbaOtimizado(categoria) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const btnAtivo = document.querySelector(`.tab-btn[data-categoria="${categoria}"]`);
    const contentAtivo = document.getElementById(`tab-${categoria}`);
    
    if (btnAtivo) btnAtivo.classList.add('active');
    if (contentAtivo) contentAtivo.classList.add('active');
    
    categoriaAtiva = categoria;
    
    // Verificar se o conteúdo já foi renderizado
    const loadingAba = contentAtivo?.querySelector('.loading-aba');
    if (loadingAba) {
        renderizarAba(categoria);
    } else {
        carregarQuantidadesVisiveis(categoria);
    }
}

// Carregar quantidades apenas para itens visíveis (com cache)
function carregarQuantidadesVisiveis(categoria) {
    const tabContent = document.getElementById(`tab-${categoria}`);
    if (!tabContent) return;
    
    const itens = tabContent.querySelectorAll('.material-item');
    itens.forEach(item => {
        const codigo = item.dataset.codigo;
        const idUnico = item.id?.replace('item-', '') || '';
        if (codigo && idUnico) {
            buscarQuantidadeAnteriorComCache(codigo, idUnico);
        }
    });
}

// ============================================
// FUNÇÃO CORRIGIDA: buscarQuantidadeAnteriorComCache
// ============================================

// Buscar quantidade anterior com cache
async function buscarQuantidadeAnteriorComCache(codigo, idUnico) {
    const inputAnterior = document.getElementById(`qtd-anterior-${idUnico}`);
    if (!inputAnterior || !codigo) return;
    
    // Verificar cache
    if (cacheQuantidades[codigo]) {
        const dados = cacheQuantidades[codigo];
        inputAnterior.value = dados.qtd || '0';
        inputAnterior.title = dados.data ? `Última contagem: ${formatarData(dados.data)}` : 'Sem dados';
        inputAnterior.classList.add(dados.qtd ? 'tem-dado-anterior' : 'sem-dado-anterior');
        return;
    }
    
    try {
        const dataFormatada = document.getElementById('data')?.value || new Date().toISOString().split('T')[0];
        // ✅ CORRIGIDO: URL correta da API
        const response = await fetch('https://noisy-snow-0359.alefe-gomes-72f.workers.dev/api/contagem-anterior', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo, data_atual: dataFormatada })
        });
        
        const resultado = await response.json();
        
        cacheQuantidades[codigo] = {
            qtd: resultado.encontrado ? resultado.qtd_anterior : '0',
            data: resultado.encontrado ? resultado.data_anterior : null
        };
        
        if (resultado.encontrado) {
            inputAnterior.value = resultado.qtd_anterior;
            inputAnterior.title = `Última contagem: ${formatarData(resultado.data_anterior)}`;
            inputAnterior.classList.add('tem-dado-anterior');
        } else {
            inputAnterior.value = '0';
            inputAnterior.title = 'Nenhuma contagem anterior encontrada';
            inputAnterior.classList.add('sem-dado-anterior');
        }
        
    } catch (error) {
        console.error('Erro ao buscar quantidade anterior:', error);
        inputAnterior.value = '0';
    }
}

// Função auxiliar para formatar data
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('pt-BR');
}

// ============================================
// INICIALIZAR CONTAGEM DIÁRIA
// ============================================

// Verificar se estamos na página de contagem diária
if (document.getElementById('contagemForm')) {
    document.addEventListener('DOMContentLoaded', function() {
        // Preencher data automaticamente
        const dataInput = document.getElementById('data');
        if (dataInput) {
            const hoje = new Date();
            dataInput.value = hoje.toISOString().split('T')[0];
        }
        
        // Carregar materiais de forma otimizada
        carregarMateriaisOtimizado();
    });
}

// ============================================
// FUNÇÕES DE POP-UP (mantidas do original)
// ============================================

const descricaoPopup = document.getElementById('descricao-popup');
const popupOverlay = document.getElementById('popup-overlay');

function mostrarDescricaoPopup(input, texto) {
    if (!descricaoPopup) return;
    const rect = input.getBoundingClientRect();
    descricaoPopup.textContent = texto;
    descricaoPopup.className = 'descricao-popup show';
    descricaoPopup.style.left = rect.left + (rect.width / 2) + 'px';
    descricaoPopup.style.top = (rect.top - descricaoPopup.offsetHeight - 10) + 'px';
    if (popupOverlay) popupOverlay.classList.add('active');
}

function fecharDescricaoPopup() {
    if (descricaoPopup) descricaoPopup.classList.remove('show');
    if (popupOverlay) popupOverlay.classList.remove('active');
}

if (popupOverlay) {
    popupOverlay.addEventListener('click', fecharDescricaoPopup);
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('input-descricao')) {
        const descricao = e.target.value;
        if (descricao && descricao.trim() !== '') {
            mostrarDescricaoPopup(e.target, descricao);
        }
    }
});

// ============================================
// EXPOR FUNÇÕES ADICIONAIS
// ============================================

window.ativarAbaOtimizado = ativarAbaOtimizado;
window.carregarMateriaisOtimizado = carregarMateriaisOtimizado;
window.buscarQuantidadeAnteriorComCache = buscarQuantidadeAnteriorComCache;
window.formatarData = formatarData;