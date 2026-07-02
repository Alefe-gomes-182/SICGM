// ============================================
// CÓDIGO ESPECÍFICO PARA PÁGINA DE CONTAGEM DIÁRIA
// ============================================

// Verificar se estamos na página de contagem diária
if (document.getElementById('contagemForm')) {
    
    // ============================================
    // CONFIGURAÇÃO
    // ============================================
    
    const API_URL = 'https://noisy-snow-0359.alefe-gomes-72f.workers.dev';
    
    // ============================================
    // CATEGORIAS DE MATERIAIS
    // ============================================
    
    const CATEGORIAS = {
        'concretos': {
            nome: 'Concretos',
            icone: '🏗️',
            tipo: 'predefinido',
            codigos: [
                '90405', '91073', '90662', '90400', '91074',
                '22817', '37745', '90570', '629476', '91020',
                '91021', '91022', '91019', '91023', '91024',
                '90186', '90187', '90193', '90194', '91044',
                '90195', '91045', '90196', '90668', '90197',
                '90667', '91046', '90198', '90665', '90199',
                '90200', '90671', '90201', '91047', '90202',
                '90669', '90203', '90670', '645570', '90206',
                '90204', '90673', '90205', '645572', '626201',
                '690288', '670162', '690842', '645573'
            ]
        },
        'bobinas': {
            nome: 'Bobinas',
            icone: '🧵',
            tipo: 'manual',
            codigos: [],
            validacao: 'cabo'
        },
        'trafos': {
            nome: 'Trafos',
            icone: '⚡',
            tipo: 'manual',
            codigos: [],
            validacao: 'transf'
        }
    };
    
    // ============================================
    // VARIÁVEIS GLOBAIS
    // ============================================
    
    let materiaisBanco = [];
    let materiaisPorCategoria = {};
    let materiaisManuais = [];
    let bobinasManuais = [];
    let categoriaAtiva = null;
    let codigosExistentesDB = new Set();
    let cacheQuantidades = {};
    let dadosCarregados = false;
    
    // ============================================
    // PREENCHER DATA AUTOMATICAMENTE
    // ============================================
    
    const dataInput = document.getElementById('data');
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    if (dataInput) dataInput.value = dataFormatada;
    
    // ============================================
    // FUNÇÃO PARA REDIRECIONAR PARA HOME
    // ============================================
    
    function redirecionarParaHome() {
        const sessao = sessionStorage.getItem('sessaoSICGM');
        if (sessao) {
            try {
                const dados = JSON.parse(sessao);
                const homeMap = {
                    'OPERACIONAL': '../home-operacional.html',
                    'GESTAO': '../home-gestao.html',
                    'VISUALIZACAO': '../home-visualizacao.html'
                };
                const homePage = homeMap[dados.perfil] || '../index.html';
                window.location.href = homePage;
            } catch (e) {
                window.location.href = '../index.html';
            }
        } else {
            window.location.href = '../index.html';
        }
    }
    
    // Tornar a função global
    window.redirecionarParaHome = redirecionarParaHome;
    
    // ============================================
    // CARREGAR DADOS DO USUÁRIO DA SESSÃO
    // ============================================
    
    function carregarDadosUsuarioSessao() {
        try {
            const sessao = sessionStorage.getItem('sessaoSICGM');
            
            if (sessao) {
                const dadosSessao = JSON.parse(sessao);
                
                const tempoDecorrido = Date.now() - dadosSessao.timestamp;
                if (tempoDecorrido > 30 * 60 * 1000) {
                    console.warn('⏰ Sessão expirada, redirecionando para login...');
                    window.location.href = '../index.html';
                    return false;
                }
                
                document.getElementById('nome').value = dadosSessao.nome || '';
                document.getElementById('matricula').value = dadosSessao.matricula || '';
                
                console.log('✅ Dados do usuário carregados da sessão:', dadosSessao.nome);
                return true;
            } else {
                console.warn('⚠️ Sessão não encontrada, tentando carregar do arquivo...');
                return carregarColaboradoresArquivo();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados da sessão:', error);
            return carregarColaboradoresArquivo();
        }
    }

    async function carregarColaboradoresArquivo() {
        try {
            const response = await fetch('../data/colaboradores.txt');
            
            if (!response.ok) {
                throw new Error('Arquivo de colaboradores não encontrado');
            }
            
            const texto = await response.text();
            const linhas = texto.trim().split('\n');
            
            let usuarioEncontrado = null;
            
            for (let i = 0; i < linhas.length; i++) {
                const linha = linhas[i].trim();
                if (linha) {
                    if (linha.startsWith('*')) {
                        const partes = linha.replace('*', '').trim().split('\t');
                        if (partes.length >= 2) {
                            usuarioEncontrado = {
                                matricula: partes[0].trim(),
                                nome: partes[1].trim()
                            };
                            break;
                        }
                    }
                }
            }
            
            if (!usuarioEncontrado && linhas.length > 0) {
                const primeiraLinha = linhas[0].trim().replace('*', '').trim();
                const partes = primeiraLinha.split('\t');
                if (partes.length >= 2) {
                    usuarioEncontrado = {
                        matricula: partes[0].trim(),
                        nome: partes[1].trim()
                    };
                }
            }
            
            if (usuarioEncontrado) {
                document.getElementById('nome').value = usuarioEncontrado.nome;
                document.getElementById('matricula').value = usuarioEncontrado.matricula;
                console.log('✅ Dados do usuário carregados do arquivo:', usuarioEncontrado.nome);
                return true;
            } else {
                document.getElementById('nome').removeAttribute('readonly');
                document.getElementById('matricula').removeAttribute('readonly');
                console.warn('⚠️ Nenhum colaborador encontrado. Campos liberados para edição.');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar colaboradores:', error);
            document.getElementById('nome').removeAttribute('readonly');
            document.getElementById('matricula').removeAttribute('readonly');
            return false;
        }
    }
    
    // ============================================
    // FUNÇÃO DE VALIDAÇÃO POR CATEGORIA
    // ============================================
    
    function validarCodigoPorCategoria(codigo, categoria) {
        const dados = buscarDadosCodigo(codigo);
        
        if (!dados) {
            return {
                valido: false,
                motivo: 'Código não encontrado na base de dados'
            };
        }
        
        const descricao = dados.descricao.toLowerCase();
        const categoriaConfig = CATEGORIAS[categoria];
        
        if (!categoriaConfig || !categoriaConfig.validacao) {
            return { valido: true };
        }
        
        const palavraChave = categoriaConfig.validacao.toLowerCase();
        
        if (categoria === 'bobinas') {
            if (!descricao.startsWith(palavraChave)) {
                return {
                    valido: false,
                    motivo: `A descrição deve começar com "${palavraChave}" para esta categoria`
                };
            }
        } else if (categoria === 'trafos') {
            if (!descricao.includes(palavraChave)) {
                return {
                    valido: false,
                    motivo: `A descrição deve conter "${palavraChave}" para esta categoria`
                };
            }
        }
        
        return { valido: true };
    }
    
    // ============================================
    // CARREGAR MATERIAIS DO ARQUIVO
    // ============================================
    
    async function carregarMateriais() {
        try {
            const response = await fetch('../data/materiais.txt');
            const texto = await response.text();
            
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
            await carregarItensManuais();
            criarAbas();
            dadosCarregados = true;
            
        } catch (error) {
            console.error('Erro ao carregar materiais:', error);
            document.getElementById('loading-materiais').innerHTML = 
                '❌ Erro ao carregar materiais. Verifique o arquivo materiais.txt';
        }
    }
    
    // ============================================
    // CARREGAR ITENS MANUAIS DO D1 (USANDO tipo_material)
    // ============================================
    
    async function carregarItensManuais() {
        try {
            const response = await fetch(`${API_URL}/api/dados`);
            const resultados = await response.json();
            
            // Limpar os sets e maps
            codigosExistentesDB = new Set();
            const trafosMap = new Map();
            const bobinasMap = new Map();
            
            resultados.forEach(item => {
                const isAtivo = item.ativo === undefined || item.ativo === 1 || item.ativo === true;
                
                // USAR O CAMPO tipo_material PARA CLASSIFICAR
                const tipoMaterial = item.tipo_material || '';
                
                if (tipoMaterial === 'bobina' && isAtivo) {
                    // É uma bobina
                    codigosExistentesDB.add(item.codigo);
                    if (!bobinasMap.has(item.codigo)) {
                        bobinasMap.set(item.codigo, {
                            codigo: item.codigo,
                            descricao: item.descricao || '',
                            und: item.und || '',
                            tombamento: item.tombamento || '',
                            ativo: true,
                            tipo_material: 'bobina',
                            numero_serie: null,
                            oleo: null,
                            cor: null,
                            _qtd: '',
                            _justificativa: ''
                        });
                    }
                } 
                else if (tipoMaterial === 'trafo' && isAtivo) {
                    // É um trafo
                    codigosExistentesDB.add(item.codigo);
                    if (!trafosMap.has(item.codigo)) {
                        trafosMap.set(item.codigo, {
                            codigo: item.codigo,
                            descricao: item.descricao || '',
                            und: item.und || '',
                            numero_serie: item.numero_serie || '',
                            tombamento: item.tombamento || '',
                            oleo: item.oleo || '',
                            cor: item.cor || '',
                            ativo: true,
                            tipo_material: 'trafo',
                            _qtd: '',
                            _justificativa: ''
                        });
                    }
                }
                // Fallback para dados antigos SEM tipo_material
                else if (isAtivo) {
                    // Tentar determinar pelo campo bobina
                    const isBobina = item.bobina === true || item.bobina === 1;
                    const isTrafo = item.numero_serie || item.oleo || item.cor;
                    
                    if (isBobina && !isTrafo) {
                        codigosExistentesDB.add(item.codigo);
                        if (!bobinasMap.has(item.codigo)) {
                            bobinasMap.set(item.codigo, {
                                codigo: item.codigo,
                                descricao: item.descricao || '',
                                und: item.und || '',
                                tombamento: item.tombamento || '',
                                ativo: true,
                                tipo_material: 'bobina',
                                numero_serie: null,
                                oleo: null,
                                cor: null,
                                _qtd: '',
                                _justificativa: ''
                            });
                        }
                    } else if (isTrafo && !isBobina) {
                        codigosExistentesDB.add(item.codigo);
                        if (!trafosMap.has(item.codigo)) {
                            trafosMap.set(item.codigo, {
                                codigo: item.codigo,
                                descricao: item.descricao || '',
                                und: item.und || '',
                                numero_serie: item.numero_serie || '',
                                tombamento: item.tombamento || '',
                                oleo: item.oleo || '',
                                cor: item.cor || '',
                                ativo: true,
                                tipo_material: 'trafo',
                                _qtd: '',
                                _justificativa: ''
                            });
                        }
                    }
                }
            });
            
            // Atualiza os arrays
            materiaisManuais = Array.from(trafosMap.values());
            bobinasManuais = Array.from(bobinasMap.values());
            
            // Atualiza o objeto de categorias
            materiaisPorCategoria['trafos'] = materiaisManuais;
            materiaisPorCategoria['bobinas'] = bobinasManuais;
            
            console.log('⚡ ' + materiaisManuais.length + ' trafos ativos carregados');
            console.log('🧵 ' + bobinasManuais.length + ' bobinas ativas carregadas');
            console.log('📊 Códigos existentes no banco: ' + codigosExistentesDB.size);
            
        } catch (error) {
            console.error('Erro ao carregar itens manuais:', error);
            materiaisManuais = [];
            bobinasManuais = [];
            materiaisPorCategoria['trafos'] = [];
            materiaisPorCategoria['bobinas'] = [];
        }
    }
    
    // ============================================
    // ORGANIZAR MATERIAIS POR CATEGORIA
    // ============================================
    
    function organizarPorCategoria() {
        for (const [chave, categoria] of Object.entries(CATEGORIAS)) {
            if (categoria.tipo === 'predefinido') {
                const materiais = materiaisBanco.filter(material => 
                    categoria.codigos.includes(material.codigo)
                );
                materiais.sort((a, b) => a.codigo.localeCompare(b.codigo));
                materiaisPorCategoria[chave] = materiais;
            }
        }
    }
    
    // ============================================
    // CRIAR SISTEMA DE ABAS
    // ============================================
    
    function criarAbas() {
        const tabsNav = document.getElementById('tabs-nav');
        const tabsContent = document.getElementById('tabs-content');
        const loading = document.getElementById('loading-materiais');
        
        let htmlNav = '';
        let htmlContent = '';
        let primeiraCategoria = null;
        
        for (const [chave, categoria] of Object.entries(CATEGORIAS)) {
            const materiais = materiaisPorCategoria[chave] || [];
            
            if (!primeiraCategoria) {
                primeiraCategoria = chave;
            }
            
            htmlNav += `
                <button type="button" class="tab-btn" data-categoria="${chave}" onclick="ativarAba('${chave}')">
                    <span class="tab-icone">${categoria.icone}</span>
                    ${categoria.nome}
                    <span class="tab-contador">${materiais.length}</span>
                </button>
            `;
            
            htmlContent += `
                <div class="tab-content" id="tab-${chave}">
                    ${chave === 'trafos' ? renderizarTrafos(materiais) : 
                      chave === 'bobinas' ? renderizarBobinas(materiais) : 
                      renderizarMateriaisCategoria(materiais, chave)}
                </div>
            `;
        }
        
        tabsNav.innerHTML = htmlNav;
        tabsContent.innerHTML = htmlContent;
        loading.style.display = 'none';
        
        if (primeiraCategoria) {
            ativarAba(primeiraCategoria);
        }
    }
    
    // ============================================
    // ATIVAR ABA
    // ============================================
    
    function ativarAba(categoria) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const btnAtivo = document.querySelector(`.tab-btn[data-categoria="${categoria}"]`);
        const contentAtivo = document.getElementById(`tab-${categoria}`);
        
        if (btnAtivo) btnAtivo.classList.add('active');
        if (contentAtivo) contentAtivo.classList.add('active');
        
        categoriaAtiva = categoria;
    }
    
    // ============================================
    // VERIFICAR SE CÓDIGO EXISTE NO BANCO
    // ============================================
    
    function codigoExisteNoBanco(codigo) {
        return codigosExistentesDB.has(codigo);
    }
    
    // ============================================
    // RENDERIZAR MATERIAIS PREDEFINIDOS
    // ============================================
    
    function renderizarMateriaisCategoria(materiais, categoria) {
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhum material configurado nesta categoria</p>
            </div>`;
        }
        
        let html = '';
        
        materiais.forEach((material, index) => {
            const idUnico = `${categoria}-${index}`;
            
            html += `
                <div class="material-item" data-codigo="${material.codigo}" data-categoria="${categoria}">
                    <div class="material-row">
                        <div class="material-field">
                            <label>Código</label>
                            <input type="text" value="${material.codigo}" readonly class="input-readonly">
                        </div>
                        <div class="material-field">
                            <label>Descrição</label>
                            <input type="text" value="${material.descricao}" class="input-descricao" readonly>
                        </div>
                        <div class="material-field">
                            <label>UND</label>
                            <input type="text" value="${material.und}" readonly class="input-readonly">
                        </div>
                        <div class="material-field">
                            <label for="qtd-${idUnico}">QTD *</label>
                            <input type="number" id="qtd-${idUnico}" step="0.01" min="0" placeholder="0.00" 
                                class="input-qtd" onchange="calcularDiferenca('${idUnico}', '${material.codigo}')">
                        </div>
                        <div class="material-field">
                            <label>Últ. Cont.</label>
                            <input type="text" id="qtd-anterior-${idUnico}" readonly 
                                class="input-readonly input-qtd-anterior" value="Carregando...">
                        </div>
                    </div>
                    <div id="diferenca-${idUnico}" class="diferenca-indicador" style="display: none;"></div>
                    <div class="justificativa-row">
                        <div class="material-field justificativa-field">
                            <label for="justificativa-${idUnico}">Justificativa</label>
                            <input type="text" id="justificativa-${idUnico}" placeholder="Justificativa..." class="input-justificativa">
                        </div>
                    </div>
                </div>
            `;
        });
        
        setTimeout(() => {
            materiais.forEach((material, index) => {
                buscarQuantidadeAnterior(material.codigo, `${categoria}-${index}`);
            });
        }, 100);
        
        return html;
    }
    
    // ============================================
    // RENDERIZAR BOBINAS (USANDO tipo_material)
    // ============================================

    function renderizarBobinas(materiais) {
        let html = '';
        
        html += `<div id="bobinas-container">`;
        
        // Filtra apenas itens que são bobinas (tipo_material === 'bobina')
        const bobinasAtivas = materiais.filter(b => {
            return b.ativo !== false && b.tipo_material === 'bobina';
        });
        
        if (bobinasAtivas.length === 0) {
            html += `<div id="bobinas-vazio" style="text-align: center; padding: 20px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhuma bobina cadastrada. Adicione uma nova bobina abaixo.</p>
            </div>`;
        }
        
        bobinasAtivas.forEach((material, index) => {
            const idUnico = `bobinas-${index}`;
            const codigoBobina = material.codigo || '';
            const existeNoBanco = codigoBobina ? codigoExisteNoBanco(codigoBobina) : false;
            const temDescricao = material.descricao && material.descricao.trim() !== '';
            
            // Recuperar quantidade salva
            const qtdSalva = material._qtd || '';
            
            html += `
                <div class="material-item bobina-item" data-codigo="${codigoBobina}" data-categoria="bobinas" data-index="${index}">
                    <div class="material-header">
                        <span class="material-number">Bobina #${index + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <label class="checkbox-baixa-label">
                                <input type="checkbox" 
                                    class="checkbox-baixa-bobina" 
                                    data-index="${index}"
                                    onchange="toggleBaixaBobina(${index}, this)">
                                Dar baixa
                            </label>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${index}"
                                onclick="removerBobina(${index})"
                                title="Remover esta bobina">
                                ✕
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="material-row">
                        <div class="material-field">
                            <label for="bobina-codigo-${index}">Código *</label>
                            <input type="text" id="bobina-codigo-${index}" value="${codigoBobina}" 
                                placeholder="Código" class="input-trafo" required
                                onchange="validarCodigoBobina(${index}, this.value)">
                            <div id="bobina-codigo-status-${index}" class="codigo-status"></div>
                        </div>
                        <div class="material-field">
                            <label for="bobina-descricao-${index}">Descrição *</label>
                            <input type="text" id="bobina-descricao-${index}" value="${material.descricao || ''}" 
                                placeholder="Descrição" class="input-descricao" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label for="bobina-und-${index}">UND *</label>
                            <input type="text" id="bobina-und-${index}" value="${material.und || ''}" 
                                placeholder="UND" class="input-readonly" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-extras">
                        <div class="material-field">
                            <label for="bobina-tombamento-${index}">Tombamento *</label>
                            <input type="text" id="bobina-tombamento-${index}" value="${material.tombamento || ''}" 
                                placeholder="Tombamento" class="input-extra" required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label for="qtd-${idUnico}">QTD *</label>
                            <input type="number" id="qtd-${idUnico}" step="0.01" min="0" placeholder="0.00" 
                                class="input-qtd" value="${qtdSalva}" 
                                onchange="calcularDiferencaBobina('${idUnico}', '${codigoBobina}')">
                        </div>
                        <div class="material-field">
                            <label>Últ. Cont.</label>
                            <input type="text" id="qtd-anterior-${idUnico}" readonly 
                                class="input-readonly input-qtd-anterior" value="Carregando...">
                        </div>
                    </div>
                    
                    <div id="diferenca-${idUnico}" class="diferenca-indicador" style="display: none;"></div>
                    
                    <div class="justificativa-row">
                        <div class="material-field justificativa-field">
                            <label for="justificativa-${idUnico}">Justificativa</label>
                            <input type="text" id="justificativa-${idUnico}" 
                                value="${material._justificativa || ''}"
                                placeholder="${existeNoBanco ? 'Justificativa para esta bobina...' : 'Justificativa...'}" 
                                class="input-justificativa"
                                ${existeNoBanco ? `oninput="verificarJustificativaBobina(${index})"` : ''}>
                        </div>
                    </div>
                    
                    ${existeNoBanco ? `
                    <div id="alerta-baixa-bobina-${index}" class="alerta-baixa" style="display: none;">
                        ⚠️ Para dar baixa, preencha a justificativa.
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        
        html += `
            <button type="button" id="btn-add-bobina" class="btn-add-material" onclick="adicionarBobina()">
                + Adicionar Nova Bobina
            </button>
        `;
        
        return html;
    }
    
    // ============================================
    // RENDERIZAR TRAFOS (USANDO tipo_material)
    // ============================================

    function renderizarTrafos(materiais) {
        let html = '';
        
        html += `<div id="trafos-container">`;
        
        // Filtra apenas itens que são trafos (tipo_material === 'trafo')
        const trafosAtivos = materiais.filter(t => {
            return t.ativo !== false && t.tipo_material === 'trafo';
        });
        
        if (trafosAtivos.length === 0) {
            html += `<div id="trafos-vazio" style="text-align: center; padding: 20px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhum trafo cadastrado. Adicione um novo item abaixo.</p>
            </div>`;
        }
        
        trafosAtivos.forEach((material, index) => {
            const idUnico = `trafos-${index}`;
            const codigoTrafo = material.codigo || '';
            const existeNoBanco = codigoTrafo ? codigoExisteNoBanco(codigoTrafo) : false;
            const temDescricao = material.descricao && material.descricao.trim() !== '';
            
            // Recuperar quantidade salva
            const qtdSalva = material._qtd || '';
            
            html += `
                <div class="material-item trafo-item" data-codigo="${codigoTrafo}" data-categoria="trafos" data-index="${index}">
                    <div class="material-header">
                        <span class="material-number">Trafo #${index + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <label class="checkbox-baixa-label">
                                <input type="checkbox" 
                                    class="checkbox-baixa-trafo" 
                                    data-index="${index}"
                                    onchange="toggleBaixaTrafo(${index}, this)">
                                Dar baixa
                            </label>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${index}"
                                onclick="removerTrafo(${index})"
                                title="Remover este trafo">
                                ✕
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="material-row">
                        <div class="material-field">
                            <label for="trafo-codigo-${index}">Código *</label>
                            <input type="text" id="trafo-codigo-${index}" value="${codigoTrafo}" 
                                placeholder="Código" class="input-trafo" required
                                onchange="validarCodigoTrafo(${index}, this.value)">
                            <div id="codigo-status-${index}" class="codigo-status"></div>
                        </div>
                        <div class="material-field">
                            <label for="trafo-descricao-${index}">Descrição *</label>
                            <input type="text" id="trafo-descricao-${index}" value="${material.descricao || ''}" 
                                placeholder="Descrição" class="input-descricao" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label for="trafo-und-${index}">UND *</label>
                            <input type="text" id="trafo-und-${index}" value="${material.und || ''}" 
                                placeholder="UND" class="input-readonly" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-extras">
                        <div class="material-field">
                            <label for="trafo-serie-${index}">Nº Série *</label>
                            <input type="text" id="trafo-serie-${index}" value="${material.numero_serie || ''}" 
                                placeholder="Nº de série" class="input-extra" required>
                        </div>
                        <div class="material-field">
                            <label for="trafo-tombamento-${index}">Tombamento *</label>
                            <input type="text" id="trafo-tombamento-${index}" value="${material.tombamento || ''}" 
                                placeholder="Tombamento" class="input-extra" required>
                        </div>
                        <div class="material-field">
                            <label for="trafo-oleo-${index}">Óleo *</label>
                            <input type="text" id="trafo-oleo-${index}" value="${material.oleo || ''}" 
                                placeholder="Tipo de óleo" class="input-extra" required>
                        </div>
                        <div class="material-field">
                            <label for="trafo-cor-${index}">Cor *</label>
                            <input type="text" id="trafo-cor-${index}" value="${material.cor || ''}" 
                                placeholder="Cor" class="input-extra" required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label for="qtd-${idUnico}">QTD *</label>
                            <input type="number" id="qtd-${idUnico}" step="0.01" min="0" placeholder="0.00" 
                                class="input-qtd" value="${qtdSalva}" 
                                onchange="calcularDiferencaTrafo('${idUnico}', '${codigoTrafo}')">
                        </div>
                        <div class="material-field">
                            <label>Últ. Cont.</label>
                            <input type="text" id="qtd-anterior-${idUnico}" readonly 
                                class="input-readonly input-qtd-anterior" value="Carregando...">
                        </div>
                    </div>
                    
                    <div id="diferenca-${idUnico}" class="diferenca-indicador" style="display: none;"></div>
                    
                    <div class="justificativa-row">
                        <div class="material-field justificativa-field">
                            <label for="justificativa-${idUnico}">Justificativa</label>
                            <input type="text" id="justificativa-${idUnico}" 
                                value="${material._justificativa || ''}"
                                placeholder="${existeNoBanco ? 'Justificativa para este material...' : 'Justificativa...'}" 
                                class="input-justificativa"
                                ${existeNoBanco ? `oninput="verificarJustificativaTrafo(${index})"` : ''}>
                        </div>
                    </div>
                    
                    ${existeNoBanco ? `
                    <div id="alerta-baixa-trafo-${index}" class="alerta-baixa" style="display: none;">
                        ⚠️ Para dar baixa, preencha a justificativa.
                    </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        
        html += `
            <button type="button" id="btn-add-trafo" class="btn-add-material" onclick="adicionarTrafo()">
                + Adicionar Novo Trafo
            </button>
        `;
        
        return html;
    }
    
    // ============================================
    // ADICIONAR BOBINA
    // ============================================
    
    function adicionarBobina() {
        console.log('🧵 Função adicionarBobina chamada');
        
        // Salvar os dados atuais das bobinas antes de adicionar
        salvarDadosBobinasAtuais();
        
        const novaBobina = {
            codigo: '',
            descricao: '',
            und: '',
            tombamento: '',
            ativo: true,
            isNew: true,
            _qtd: '',
            _justificativa: '',
            tipo_material: 'bobina',
            numero_serie: null,
            oleo: null,
            cor: null
        };
        
        bobinasManuais.push(novaBobina);
        materiaisPorCategoria['bobinas'] = bobinasManuais;
        
        console.log('📦 Nova bobina adicionada:', novaBobina);
        console.log('📊 Total de bobinas:', bobinasManuais.length);
        
        // Renderizar novamente com todos os dados preservados
        const tabsContent = document.getElementById('tab-bobinas');
        if (tabsContent) {
            tabsContent.innerHTML = renderizarBobinas(bobinasManuais);
            atualizarContadorBobinas();
            
            // Restaurar quantidades anteriores e diferenças
            setTimeout(() => {
                bobinasManuais.forEach((material, index) => {
                    if (material.codigo) {
                        buscarQuantidadeAnterior(material.codigo, `bobinas-${index}`);
                    }
                    // Restaurar diferença se houver quantidade
                    if (material._qtd) {
                        const idUnico = `bobinas-${index}`;
                        calcularDiferencaBobina(idUnico, material.codigo);
                    }
                });
            }, 100);
            
            const ultimoItem = tabsContent.querySelector('.bobina-item:last-child');
            if (ultimoItem) {
                ultimoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = ultimoItem.querySelector('#bobina-codigo-' + (bobinasManuais.length - 1));
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        } else {
            console.error('❌ Elemento tab-bobinas não encontrado!');
        }
    }
    
    // ============================================
    // SALVAR DADOS ATUAIS DAS BOBINAS
    // ============================================
    
    function salvarDadosBobinasAtuais() {
        const bobinaItems = document.querySelectorAll('.bobina-item');
        bobinaItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (!isNaN(index) && index < bobinasManuais.length) {
                const codigo = document.getElementById(`bobina-codigo-${index}`)?.value || '';
                const descricao = document.getElementById(`bobina-descricao-${index}`)?.value || '';
                const und = document.getElementById(`bobina-und-${index}`)?.value || '';
                const tombamento = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
                const qtd = document.getElementById(`qtd-bobinas-${index}`)?.value || '';
                const justificativa = document.getElementById(`justificativa-bobinas-${index}`)?.value || '';
                
                bobinasManuais[index].codigo = codigo;
                bobinasManuais[index].descricao = descricao;
                bobinasManuais[index].und = und;
                bobinasManuais[index].tombamento = tombamento;
                bobinasManuais[index]._qtd = qtd;
                bobinasManuais[index]._justificativa = justificativa;
                bobinasManuais[index].tipo_material = 'bobina';
            }
        });
    }
    
    // ============================================
    // SALVAR DADOS ATUAIS DOS TRAFOS
    // ============================================
    
    function salvarDadosTrafosAtuais() {
        const trafoItems = document.querySelectorAll('.trafo-item');
        trafoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (!isNaN(index) && index < materiaisManuais.length) {
                const codigo = document.getElementById(`trafo-codigo-${index}`)?.value || '';
                const descricao = document.getElementById(`trafo-descricao-${index}`)?.value || '';
                const und = document.getElementById(`trafo-und-${index}`)?.value || '';
                const serie = document.getElementById(`trafo-serie-${index}`)?.value || '';
                const tombamento = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
                const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
                const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
                const qtd = document.getElementById(`qtd-trafos-${index}`)?.value || '';
                const justificativa = document.getElementById(`justificativa-trafos-${index}`)?.value || '';
                
                materiaisManuais[index].codigo = codigo;
                materiaisManuais[index].descricao = descricao;
                materiaisManuais[index].und = und;
                materiaisManuais[index].numero_serie = serie;
                materiaisManuais[index].tombamento = tombamento;
                materiaisManuais[index].oleo = oleo;
                materiaisManuais[index].cor = cor;
                materiaisManuais[index]._qtd = qtd;
                materiaisManuais[index]._justificativa = justificativa;
                materiaisManuais[index].tipo_material = 'trafo';
            }
        });
    }
    
    // ============================================
    // REMOVER BOBINA
    // ============================================
    
    function removerBobina(index) {
        const bobina = bobinasManuais[index];
        const codigo = bobina?.codigo || '';
        
        if (codigo && codigoExisteNoBanco(codigo)) {
            mostrarMensagem('❌ Esta bobina já está registrada no banco de dados e não pode ser removida. Use a opção "Dar baixa" para desativá-la.', 'erro');
            return;
        }
        
        if (confirm('Tem certeza que deseja remover esta bobina? Esta ação não pode ser desfeita.')) {
            bobinasManuais.splice(index, 1);
            materiaisPorCategoria['bobinas'] = bobinasManuais;
            
            const tabsContent = document.getElementById('tab-bobinas');
            tabsContent.innerHTML = renderizarBobinas(bobinasManuais);
            atualizarContadorBobinas();
            
            mostrarMensagem('✅ Bobina removida com sucesso!', 'sucesso');
        }
    }
    
    // ============================================
    // VALIDAR CÓDIGO DA BOBINA
    // ============================================

    function validarCodigoBobina(index, codigo) {
        const statusDiv = document.getElementById(`bobina-codigo-status-${index}`);
        const descricaoInput = document.getElementById(`bobina-descricao-${index}`);
        const undInput = document.getElementById(`bobina-und-${index}`);
        
        if (!codigo || codigo.trim() === '') {
            if (statusDiv) statusDiv.innerHTML = '';
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            if (bobinasManuais[index]) {
                bobinasManuais[index].codigo = '';
                bobinasManuais[index].descricao = '';
                bobinasManuais[index].und = '';
            }
            return;
        }
        
        const validacao = validarCodigoPorCategoria(codigo.trim(), 'bobinas');
        
        if (!validacao.valido) {
            if (statusDiv) {
                statusDiv.innerHTML = '❌ ' + validacao.motivo;
                statusDiv.className = 'codigo-status codigo-erro';
            }
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            if (bobinasManuais[index]) {
                bobinasManuais[index].codigo = '';
                bobinasManuais[index].descricao = '';
                bobinasManuais[index].und = '';
            }
            mostrarMensagem('❌ ' + validacao.motivo, 'erro');
            return;
        }
        
        const dados = buscarDadosCodigo(codigo.trim());
        
        if (dados) {
            if (descricaoInput) {
                descricaoInput.value = dados.descricao;
                descricaoInput.setAttribute('readonly', 'readonly');
                descricaoInput.classList.add('input-descricao');
            }
            if (undInput) {
                undInput.value = dados.und;
                undInput.setAttribute('readonly', 'readonly');
            }
            
            if (bobinasManuais[index]) {
                bobinasManuais[index].codigo = codigo.trim();
                bobinasManuais[index].descricao = dados.descricao;
                bobinasManuais[index].und = dados.und;
                bobinasManuais[index].tipo_material = 'bobina';
            }
            
            if (statusDiv) {
                statusDiv.innerHTML = '✅ Código válido para bobina';
                statusDiv.className = 'codigo-status codigo-ok';
            }
            
            buscarQuantidadeAnterior(codigo.trim(), `bobinas-${index}`);
            
        } else {
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            
            if (bobinasManuais[index]) {
                bobinasManuais[index].codigo = codigo.trim();
                bobinasManuais[index].descricao = '';
                bobinasManuais[index].und = '';
                bobinasManuais[index].tipo_material = 'bobina';
            }
            
            if (statusDiv) {
                statusDiv.innerHTML = '❌ Código não encontrado na base de dados';
                statusDiv.className = 'codigo-status codigo-erro';
            }
        }
    }
    
    // ============================================
    // CONTROLE DE BAIXA DE BOBINA
    // ============================================
    
    function toggleBaixaBobina(index, checkbox) {
        const justificativaInput = document.getElementById(`justificativa-bobinas-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-bobina-${index}`);
        
        if (checkbox.checked) {
            const justificativa = justificativaInput ? justificativaInput.value.trim() : '';
            
            if (!justificativa) {
                checkbox.checked = false;
                if (alertaDiv) {
                    alertaDiv.style.display = 'block';
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 3000);
                }
                if (justificativaInput) {
                    justificativaInput.classList.add('input-error');
                    justificativaInput.focus();
                    setTimeout(() => justificativaInput.classList.remove('input-error'), 2000);
                }
            }
        }
    }
    
    function verificarJustificativaBobina(index) {
        const justificativaInput = document.getElementById(`justificativa-bobinas-${index}`);
        const checkbox = document.querySelector(`.checkbox-baixa-bobina[data-index="${index}"]`);
        const alertaDiv = document.getElementById(`alerta-baixa-bobina-${index}`);
        
        if (justificativaInput && justificativaInput.value.trim() && checkbox && checkbox.checked) {
            if (alertaDiv) alertaDiv.style.display = 'none';
        }
    }
    
    function atualizarContadorBobinas() {
        const btnBobina = document.querySelector('.tab-btn[data-categoria="bobinas"] .tab-contador');
        if (btnBobina) {
            const ativas = bobinasManuais.filter(b => {
                return b.ativo !== false && b.tipo_material === 'bobina';
            });
            btnBobina.textContent = ativas.length;
        }
    }
    
    // ============================================
    // FUNÇÕES DE TRAFO
    // ============================================
    
    function validarTrafoCompleto(index) {
        const codigo = document.getElementById(`trafo-codigo-${index}`)?.value || '';
        const descricao = document.getElementById(`trafo-descricao-${index}`)?.value || '';
        const und = document.getElementById(`trafo-und-${index}`)?.value || '';
        const serie = document.getElementById(`trafo-serie-${index}`)?.value || '';
        const tombamento = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
        const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
        const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
        
        if (!codigo || !descricao || !und || !serie || !tombamento || !oleo || !cor) {
            return false;
        }
        return true;
    }
    
    function validarBobinaCompleta(index) {
        const codigo = document.getElementById(`bobina-codigo-${index}`)?.value || '';
        const descricao = document.getElementById(`bobina-descricao-${index}`)?.value || '';
        const und = document.getElementById(`bobina-und-${index}`)?.value || '';
        const tombamento = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
        
        if (!codigo || !descricao || !und || !tombamento) {
            return false;
        }
        return true;
    }
    
    // ============================================
    // CALCULAR DIFERENÇA PARA BOBINAS E TRAFOS
    // ============================================
    
    function calcularDiferencaBobina(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    function calcularDiferencaTrafo(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    function verificarJustificativaTrafo(index) {
        const justificativaInput = document.getElementById(`justificativa-trafos-${index}`);
        const checkbox = document.querySelector(`.checkbox-baixa-trafo[data-index="${index}"]`);
        const alertaDiv = document.getElementById(`alerta-baixa-trafo-${index}`);
        
        if (justificativaInput && justificativaInput.value.trim() && checkbox && checkbox.checked) {
            if (alertaDiv) alertaDiv.style.display = 'none';
        }
    }
    
    function toggleBaixaTrafo(index, checkbox) {
        const justificativaInput = document.getElementById(`justificativa-trafos-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-trafo-${index}`);
        
        if (checkbox.checked) {
            const justificativa = justificativaInput ? justificativaInput.value.trim() : '';
            
            if (!justificativa) {
                checkbox.checked = false;
                if (alertaDiv) {
                    alertaDiv.style.display = 'block';
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 3000);
                }
                if (justificativaInput) {
                    justificativaInput.classList.add('input-error');
                    justificativaInput.focus();
                    setTimeout(() => justificativaInput.classList.remove('input-error'), 2000);
                }
            }
        }
    }
    
    // ============================================
    // ADICIONAR TRAFO
    // ============================================
    
    function adicionarTrafo() {
        console.log('🔧 Função adicionarTrafo chamada');
        
        // Salvar os dados atuais dos trafos antes de adicionar
        salvarDadosTrafosAtuais();
        
        const novoTrafo = {
            codigo: '',
            descricao: '',
            und: '',
            numero_serie: '',
            tombamento: '',
            oleo: '',
            cor: '',
            ativo: true,
            isNew: true,
            _qtd: '',
            _justificativa: '',
            tipo_material: 'trafo'
        };
        
        materiaisManuais.push(novoTrafo);
        materiaisPorCategoria['trafos'] = materiaisManuais;
        
        console.log('📦 Novo trafo adicionado:', novoTrafo);
        console.log('📊 Total de trafos:', materiaisManuais.length);
        
        const tabsContent = document.getElementById('tab-trafos');
        if (tabsContent) {
            tabsContent.innerHTML = renderizarTrafos(materiaisManuais);
            atualizarContadorTrafos();
            
            // Restaurar quantidades anteriores e diferenças
            setTimeout(() => {
                materiaisManuais.forEach((material, index) => {
                    if (material.codigo) {
                        buscarQuantidadeAnterior(material.codigo, `trafos-${index}`);
                    }
                    // Restaurar diferença se houver quantidade
                    if (material._qtd) {
                        const idUnico = `trafos-${index}`;
                        calcularDiferencaTrafo(idUnico, material.codigo);
                    }
                });
            }, 100);
            
            const ultimoItem = tabsContent.querySelector('.trafo-item:last-child');
            if (ultimoItem) {
                ultimoItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = ultimoItem.querySelector('#trafo-codigo-' + (materiaisManuais.length - 1));
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        } else {
            console.error('❌ Elemento tab-trafos não encontrado!');
        }
    }
    
    function removerTrafo(index) {
        const trafo = materiaisManuais[index];
        const codigo = trafo?.codigo || '';
        
        if (codigo && codigoExisteNoBanco(codigo)) {
            mostrarMensagem('❌ Este trafo já está registrado no banco de dados e não pode ser removido. Use a opção "Dar baixa" para desativá-lo.', 'erro');
            return;
        }
        
        if (confirm('Tem certeza que deseja remover este trafo? Esta ação não pode ser desfeita.')) {
            materiaisManuais.splice(index, 1);
            materiaisPorCategoria['trafos'] = materiaisManuais;
            
            const tabsContent = document.getElementById('tab-trafos');
            tabsContent.innerHTML = renderizarTrafos(materiaisManuais);
            atualizarContadorTrafos();
            
            mostrarMensagem('✅ Trafo removido com sucesso!', 'sucesso');
        }
    }
    
    function atualizarContadorTrafos() {
        const btnTrafo = document.querySelector('.tab-btn[data-categoria="trafos"] .tab-contador');
        if (btnTrafo) {
            const ativos = materiaisManuais.filter(t => {
                return t.ativo !== false && t.tipo_material === 'trafo';
            });
            btnTrafo.textContent = ativos.length;
        }
    }
    
    // ============================================
    // VALIDAR CÓDIGO DO TRAFO
    // ============================================

    function validarCodigoTrafo(index, codigo) {
        const statusDiv = document.getElementById(`codigo-status-${index}`);
        const descricaoInput = document.getElementById(`trafo-descricao-${index}`);
        const undInput = document.getElementById(`trafo-und-${index}`);
        
        if (!codigo || codigo.trim() === '') {
            if (statusDiv) statusDiv.innerHTML = '';
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            if (materiaisManuais[index]) {
                materiaisManuais[index].codigo = '';
                materiaisManuais[index].descricao = '';
                materiaisManuais[index].und = '';
            }
            return;
        }
        
        const validacao = validarCodigoPorCategoria(codigo.trim(), 'trafos');
        
        if (!validacao.valido) {
            if (statusDiv) {
                statusDiv.innerHTML = '❌ ' + validacao.motivo;
                statusDiv.className = 'codigo-status codigo-erro';
            }
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            if (materiaisManuais[index]) {
                materiaisManuais[index].codigo = '';
                materiaisManuais[index].descricao = '';
                materiaisManuais[index].und = '';
            }
            mostrarMensagem('❌ ' + validacao.motivo, 'erro');
            return;
        }
        
        const dados = buscarDadosCodigo(codigo.trim());
        
        if (dados) {
            if (descricaoInput) {
                descricaoInput.value = dados.descricao;
                descricaoInput.setAttribute('readonly', 'readonly');
                descricaoInput.classList.add('input-descricao');
            }
            if (undInput) {
                undInput.value = dados.und;
                undInput.setAttribute('readonly', 'readonly');
            }
            
            if (materiaisManuais[index]) {
                materiaisManuais[index].codigo = codigo.trim();
                materiaisManuais[index].descricao = dados.descricao;
                materiaisManuais[index].und = dados.und;
                materiaisManuais[index].tipo_material = 'trafo';
            }
            
            if (statusDiv) {
                statusDiv.innerHTML = '✅ Código válido para trafo';
                statusDiv.className = 'codigo-status codigo-ok';
            }
            
            buscarQuantidadeAnterior(codigo.trim(), `trafos-${index}`);
            
        } else {
            if (descricaoInput) {
                descricaoInput.value = '';
                descricaoInput.removeAttribute('readonly');
            }
            if (undInput) {
                undInput.value = '';
                undInput.removeAttribute('readonly');
            }
            
            if (materiaisManuais[index]) {
                materiaisManuais[index].codigo = codigo.trim();
                materiaisManuais[index].descricao = '';
                materiaisManuais[index].und = '';
                materiaisManuais[index].tipo_material = 'trafo';
            }
            
            if (statusDiv) {
                statusDiv.innerHTML = '❌ Código não encontrado na base de dados';
                statusDiv.className = 'codigo-status codigo-erro';
            }
        }
    }
    
    // ============================================
    // BUSCAR DADOS DO CÓDIGO
    // ============================================

    function buscarDadosCodigo(codigo) {
        if (!codigo || !materiaisBanco.length) return null;
        const material = materiaisBanco.find(m => m.codigo === codigo.trim());
        return material || null;
    }
    
    // ============================================
    // INICIALIZAR
    // ============================================
    
    const usuarioCarregado = carregarDadosUsuarioSessao();
    carregarMateriais();
    
    // ============================================
    // POP-UP DE DESCRIÇÃO
    // ============================================
    
    const descricaoPopup = document.getElementById('descricao-popup');
    const popupOverlay = document.getElementById('popup-overlay');
    
    function mostrarDescricaoPopup(input, texto) {
        const rect = input.getBoundingClientRect();
        descricaoPopup.textContent = texto;
        descricaoPopup.className = 'descricao-popup show';
        descricaoPopup.style.left = rect.left + (rect.width / 2) + 'px';
        descricaoPopup.style.top = (rect.top - descricaoPopup.offsetHeight - 10) + 'px';
        popupOverlay.classList.add('active');
    }
    
    function fecharDescricaoPopup() {
        descricaoPopup.classList.remove('show');
        popupOverlay.classList.remove('active');
    }
    
    popupOverlay.addEventListener('click', fecharDescricaoPopup);
    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('input-descricao') && e.target.readOnly) {
            const descricao = e.target.value;
            if (descricao && descricao.trim() !== '') {
                mostrarDescricaoPopup(e.target, descricao);
            }
        }
    });

    document.addEventListener('focus', function(e) {
        if (e.target.classList.contains('input-descricao') && e.target.readOnly) {
            const descricao = e.target.value;
            if (descricao && descricao.trim() !== '') {
                mostrarDescricaoPopup(e.target, descricao);
            }
        }
    }, true);
    
    // ============================================
    // ENVIAR FORMULÁRIO
    // ============================================
    
    document.getElementById('contagemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Salvar dados atuais antes de validar
        salvarDadosTrafosAtuais();
        salvarDadosBobinasAtuais();
        
        const mensagemDiv = document.getElementById('mensagem');
        const botaoSubmit = e.target.querySelector('.submit-btn');
        
        const nome = document.getElementById('nome').value;
        const matricula = document.getElementById('matricula').value;
        const data = document.getElementById('data').value;
        
        if (!nome.trim()) {
            mostrarMensagem('❌ Por favor, preencha o nome!', 'erro');
            return;
        }
        
        // Validar trafos obrigatórios
        const trafoItems = document.querySelectorAll('.trafo-item');
        let trafoIncompleto = false;
        trafoItems.forEach((item, index) => {
            if (!validarTrafoCompleto(index)) {
                trafoIncompleto = true;
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
            }
        });
        
        if (trafoIncompleto) {
            mostrarMensagem('❌ Todos os campos dos trafos são obrigatórios!', 'erro');
            return;
        }
        
        // Validar bobinas obrigatórias
        const bobinaItems = document.querySelectorAll('.bobina-item');
        let bobinaIncompleta = false;
        bobinaItems.forEach((item, index) => {
            if (!validarBobinaCompleta(index)) {
                bobinaIncompleta = true;
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
            }
        });
        
        if (bobinaIncompleta) {
            mostrarMensagem('❌ Todos os campos das bobinas são obrigatórios!', 'erro');
            return;
        }
        
        const materiaisEnviar = [];
        const inputsQtd = document.querySelectorAll('.input-qtd');
        let temErroValidacao = false;
        
        inputsQtd.forEach(input => {
            const qtd = parseFloat(input.value);
            if (!isNaN(qtd) && qtd > 0) {
                const materialItem = input.closest('.material-item');
                const codigo = materialItem.dataset.codigo;
                const categoria = materialItem.dataset.categoria;
                
                const justificativaInput = materialItem.querySelector('.input-justificativa');
                const justificativa = justificativaInput ? justificativaInput.value : '';
                
                if (categoria === 'trafos') {
                    const index = materialItem.dataset.index;
                    const checkboxBaixa = materialItem.querySelector('.checkbox-baixa-trafo');
                    const darBaixa = checkboxBaixa ? checkboxBaixa.checked : false;
                    
                    const codigoTrafo = document.getElementById(`trafo-codigo-${index}`)?.value || codigo;
                    const descricaoTrafo = document.getElementById(`trafo-descricao-${index}`)?.value || '';
                    const undTrafo = document.getElementById(`trafo-und-${index}`)?.value || '';
                    
                    const validacao = validarCodigoPorCategoria(codigoTrafo, 'trafos');
                    if (!validacao.valido) {
                        mostrarMensagem('❌ Trafo #' + (parseInt(index) + 1) + ': ' + validacao.motivo, 'erro');
                        const codigoInput = document.getElementById(`trafo-codigo-${index}`);
                        if (codigoInput) {
                            codigoInput.classList.add('input-error');
                            codigoInput.focus();
                            setTimeout(() => codigoInput.classList.remove('input-error'), 3000);
                        }
                        temErroValidacao = true;
                        return;
                    }
                    
                    const dadosCodigo = buscarDadosCodigo(codigoTrafo);
                    if (!dadosCodigo) {
                        mostrarMensagem('❌ O código "' + codigoTrafo + '" do Trafo #' + (parseInt(index) + 1) + ' não foi encontrado na base de dados!', 'erro');
                        const codigoInput = document.getElementById(`trafo-codigo-${index}`);
                        if (codigoInput) {
                            codigoInput.classList.add('input-error');
                            codigoInput.focus();
                            setTimeout(() => codigoInput.classList.remove('input-error'), 3000);
                        }
                        temErroValidacao = true;
                        return;
                    }
                    
                    const serie = document.getElementById(`trafo-serie-${index}`)?.value || '';
                    const tombamento = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
                    const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
                    const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
                    
                    const qtdFinal = darBaixa ? -(Math.abs(qtd)) : qtd;
                    
                    if (materiaisManuais[index]) {
                        materiaisManuais[index].codigo = codigoTrafo;
                        materiaisManuais[index].descricao = descricaoTrafo;
                        materiaisManuais[index].und = undTrafo;
                        materiaisManuais[index].numero_serie = serie;
                        materiaisManuais[index].tombamento = tombamento;
                        materiaisManuais[index].oleo = oleo;
                        materiaisManuais[index].cor = cor;
                        materiaisManuais[index].ativo = !darBaixa;
                        materiaisManuais[index].tipo_material = 'trafo';
                    }
                    
                    materiaisEnviar.push({
                        nome, matricula, data,
                        codigo: codigoTrafo,
                        descricao: descricaoTrafo,
                        und: undTrafo,
                        qtd: qtdFinal,
                        numero_serie: serie,
                        tombamento,
                        oleo,
                        cor,
                        obs: justificativa || `Contagem diária - ${nome}`,
                        ativo: darBaixa ? 0 : 1,
                        tipo_material: 'trafo',
                        bobina: false
                    });
                    
                } else if (categoria === 'bobinas') {
                    const index = materialItem.dataset.index;
                    const checkboxBaixa = materialItem.querySelector('.checkbox-baixa-bobina');
                    const darBaixa = checkboxBaixa ? checkboxBaixa.checked : false;
                    
                    const codigoBobina = document.getElementById(`bobina-codigo-${index}`)?.value || codigo;
                    const descricaoBobina = document.getElementById(`bobina-descricao-${index}`)?.value || '';
                    const undBobina = document.getElementById(`bobina-und-${index}`)?.value || '';
                    const tombamento = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
                    
                    const validacao = validarCodigoPorCategoria(codigoBobina, 'bobinas');
                    if (!validacao.valido) {
                        mostrarMensagem('❌ Bobina #' + (parseInt(index) + 1) + ': ' + validacao.motivo, 'erro');
                        const codigoInput = document.getElementById(`bobina-codigo-${index}`);
                        if (codigoInput) {
                            codigoInput.classList.add('input-error');
                            codigoInput.focus();
                            setTimeout(() => codigoInput.classList.remove('input-error'), 3000);
                        }
                        temErroValidacao = true;
                        return;
                    }
                    
                    const dadosCodigo = buscarDadosCodigo(codigoBobina);
                    if (!dadosCodigo) {
                        mostrarMensagem('❌ O código "' + codigoBobina + '" da Bobina #' + (parseInt(index) + 1) + ' não foi encontrado na base de dados!', 'erro');
                        const codigoInput = document.getElementById(`bobina-codigo-${index}`);
                        if (codigoInput) {
                            codigoInput.classList.add('input-error');
                            codigoInput.focus();
                            setTimeout(() => codigoInput.classList.remove('input-error'), 3000);
                        }
                        temErroValidacao = true;
                        return;
                    }
                    
                    const qtdFinal = darBaixa ? -(Math.abs(qtd)) : qtd;
                    
                    if (bobinasManuais[index]) {
                        bobinasManuais[index].codigo = codigoBobina;
                        bobinasManuais[index].descricao = descricaoBobina;
                        bobinasManuais[index].und = undBobina;
                        bobinasManuais[index].tombamento = tombamento;
                        bobinasManuais[index].ativo = !darBaixa;
                        bobinasManuais[index].tipo_material = 'bobina';
                    }
                    
                    materiaisEnviar.push({
                        nome, matricula, data,
                        codigo: codigoBobina,
                        descricao: descricaoBobina,
                        und: undBobina,
                        qtd: qtdFinal,
                        numero_serie: null,
                        tombamento,
                        oleo: null,
                        cor: null,
                        obs: justificativa || `Contagem diária - ${nome}`,
                        ativo: darBaixa ? 0 : 1,
                        tipo_material: 'bobina',
                        bobina: true
                    });
                    
                } else {
                    const materiaisDaCategoria = materiaisPorCategoria[categoria] || [];
                    const material = materiaisDaCategoria.find(m => m.codigo === codigo);
                    
                    if (material) {
                        materiaisEnviar.push({
                            nome, matricula, data,
                            codigo: material.codigo,
                            descricao: material.descricao,
                            und: material.und,
                            qtd,
                            numero_serie: null,
                            tombamento: null,
                            oleo: null,
                            cor: null,
                            obs: justificativa || `Contagem diária - ${nome}`,
                            ativo: 1,
                            tipo_material: 'concreto',
                            bobina: false
                        });
                    }
                }
            }
        });
        
        if (temErroValidacao) {
            return;
        }
        
        if (materiaisEnviar.length === 0) {
            mostrarMensagem('❌ Preencha a quantidade de pelo menos um material!', 'erro');
            return;
        }
        
        try {
            botaoSubmit.disabled = true;
            botaoSubmit.textContent = 'Enviando...';
            mostrarMensagem('⏳ Salvando ' + materiaisEnviar.length + ' material(is)...', 'info');
            
            const resultados = [];
            for (const material of materiaisEnviar) {
                const response = await fetch(`${API_URL}/api/salvar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(material)
                });
                
                const resultado = await response.json();
                resultados.push({ 
                    codigo: material.codigo, 
                    ok: response.ok, 
                    ...resultado 
                });
            }
            
            const todosSalvos = resultados.every(r => r.ok);
            
            if (todosSalvos) {
                const baixas = materiaisEnviar.filter(m => m.ativo === 0).length;
                let msg = '✅ ' + resultados.length + ' material(is) registrado(s) com sucesso!';
                if (baixas > 0) {
                    msg += ' (' + baixas + ' baixa(s) realizada(s))';
                }
                mostrarMensagem(msg, 'sucesso');
                
                document.querySelectorAll('.input-qtd').forEach(input => input.value = '');
                document.querySelectorAll('.input-justificativa').forEach(input => input.value = '');
                document.querySelectorAll('.diferenca-indicador').forEach(div => div.style.display = 'none');
                document.querySelectorAll('.checkbox-baixa-trafo, .checkbox-baixa-bobina').forEach(cb => cb.checked = false);
                
                // Limpar cache para recarregar os dados
                cacheQuantidades = {};
                
                setTimeout(async () => {
                    await carregarItensManuais();
                    const tabsContent = document.getElementById('tab-trafos');
                    if (tabsContent && categoriaAtiva === 'trafos') {
                        tabsContent.innerHTML = renderizarTrafos(materiaisManuais);
                        atualizarContadorTrafos();
                    }
                    const tabsContentBobina = document.getElementById('tab-bobinas');
                    if (tabsContentBobina && categoriaAtiva === 'bobinas') {
                        tabsContentBobina.innerHTML = renderizarBobinas(bobinasManuais);
                        atualizarContadorBobinas();
                    }
                }, 500);
                
            } else {
                const erros = resultados.filter(r => !r.ok);
                mostrarMensagem('⚠️ Erro ao salvar: ' + erros.map(e => e.codigo).join(', '), 'erro');
            }
            
        } catch (error) {
            console.error('Erro:', error);
            mostrarMensagem('❌ Erro de conexão com o servidor.', 'erro');
            
        } finally {
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = '📝 Registrar Contagem';
        }
    });
    
    // ============================================
    // BUSCAR QUANTIDADE DO DIA ANTERIOR
    // ============================================
    
    async function buscarQuantidadeAnterior(codigo, idUnico) {
        const inputAnterior = document.getElementById(`qtd-anterior-${idUnico}`);
        if (!inputAnterior || !codigo) return;
        
        // Verificar se temos dados em cache
        if (cacheQuantidades[codigo]) {
            const dados = cacheQuantidades[codigo];
            inputAnterior.value = dados.qtd || '0';
            inputAnterior.title = dados.data ? `Última contagem: ${formatarData(dados.data)}` : 'Nenhuma contagem anterior';
            inputAnterior.classList.add(dados.qtd ? 'tem-dado-anterior' : 'sem-dado-anterior');
            return;
        }
        
        try {
            // Buscar a contagem anterior para este código
            const response = await fetch(`${API_URL}/api/contagem-anterior`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo, data_atual: dataFormatada })
            });
            
            const resultado = await response.json();
            
            if (resultado.encontrado) {
                const qtdAnterior = resultado.qtd_anterior || '0';
                cacheQuantidades[codigo] = {
                    qtd: qtdAnterior,
                    data: resultado.data_anterior
                };
                inputAnterior.value = qtdAnterior;
                inputAnterior.title = `Última contagem: ${formatarData(resultado.data_anterior)}`;
                inputAnterior.classList.add('tem-dado-anterior');
                console.log(`📊 Contagem anterior para ${codigo}: ${qtdAnterior} (${formatarData(resultado.data_anterior)})`);
            } else {
                cacheQuantidades[codigo] = {
                    qtd: '0',
                    data: null
                };
                inputAnterior.value = '0';
                inputAnterior.title = 'Nenhuma contagem anterior encontrada';
                inputAnterior.classList.add('sem-dado-anterior');
                console.log(`📊 Nenhuma contagem anterior para ${codigo}`);
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar quantidade anterior:', error);
            inputAnterior.value = '0';
            inputAnterior.title = 'Erro ao carregar';
            inputAnterior.classList.add('sem-dado-anterior');
        }
    }
    
    // ============================================
    // CALCULAR DIFERENÇA
    // ============================================
    
    function calcularDiferenca(idUnico, codigo) {
        const inputQtd = document.getElementById(`qtd-${idUnico}`);
        const inputAnterior = document.getElementById(`qtd-anterior-${idUnico}`);
        const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
        
        if (!inputQtd || !inputAnterior || !diferencaDiv) return;
        
        const qtdAtual = parseFloat(inputQtd.value);
        const qtdAnterior = parseFloat(inputAnterior.value);
        
        if (isNaN(qtdAtual) || isNaN(qtdAnterior)) {
            diferencaDiv.style.display = 'none';
            return;
        }
        
        const diferenca = qtdAtual - qtdAnterior;
        
        if (diferenca === 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-igual';
            diferencaDiv.innerHTML = '✓ Sem alteração';
        } else if (diferenca > 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-positiva';
            diferencaDiv.innerHTML = `▲ +${diferenca.toFixed(2)} a mais`;
        } else {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-negativa';
            diferencaDiv.innerHTML = `▼ ${diferenca.toFixed(2)} a menos`;
        }
    }
    
    function formatarData(dataString) {
        if (!dataString) return '';
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    }
    
    function mostrarMensagem(texto, tipo) {
        const mensagemDiv = document.getElementById('mensagem');
        mensagemDiv.textContent = texto;
        mensagemDiv.className = 'mensagem ' + tipo;
        mensagemDiv.style.display = 'block';
        mensagemDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        if (tipo === 'sucesso') {
            setTimeout(() => { mensagemDiv.style.display = 'none'; }, 5000);
        }
    }
    
    // ============================================
    // EXPOR FUNÇÕES GLOBAIS PARA O HTML
    // ============================================
    
    window.ativarAba = ativarAba;
    window.calcularDiferenca = calcularDiferenca;
    window.calcularDiferencaBobina = calcularDiferencaBobina;
    window.calcularDiferencaTrafo = calcularDiferencaTrafo;
    window.buscarQuantidadeAnterior = buscarQuantidadeAnterior;
    window.formatarData = formatarData;
    window.mostrarMensagem = mostrarMensagem;
    window.validarCodigoTrafo = validarCodigoTrafo;
    window.validarCodigoBobina = validarCodigoBobina;
    window.adicionarTrafo = adicionarTrafo;
    window.adicionarBobina = adicionarBobina;
    window.removerTrafo = removerTrafo;
    window.removerBobina = removerBobina;
    window.toggleBaixaTrafo = toggleBaixaTrafo;
    window.toggleBaixaBobina = toggleBaixaBobina;
    window.verificarJustificativaTrafo = verificarJustificativaTrafo;
    window.verificarJustificativaBobina = verificarJustificativaBobina;
    window.redirecionarParaHome = redirecionarParaHome;
}