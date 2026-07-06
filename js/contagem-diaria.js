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
    // FUNÇÃO PARA OBTER DATA NO FUSO BRASIL (UTC-3)
    // ============================================
    
    function getDataBrasil() {
        const agora = new Date();
        const offsetBrasil = -3;
        const horaUTC = agora.getTime() + (agora.getTimezoneOffset() * 60000);
        const dataBrasil = new Date(horaUTC + (offsetBrasil * 3600000));
        return dataBrasil.toISOString().split('T')[0];
    }
    
    // ============================================
    // CATEGORIAS DE MATERIAIS
    // ============================================
    
    const CATEGORIAS = {
        'concretos': {
            nome: 'Concretos',
            icone: '🏗️',
            tipo: 'predefinido',
            tipo_material: 'concreto',
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
            tipo_material: 'bobina',
            codigos: [],
            validacao: 'cabo_cordoalha'
        },
        'trafos': {
            nome: 'Trafos',
            icone: '⚡',
            tipo: 'manual',
            tipo_material: 'trafo',
            codigos: [],
            validacao: 'transf'
        }
    };
    
    // ============================================
    // CONFIGURAÇÕES DE CORES E ÓLEOS
    // ============================================
    
    const CORES = ['AZUL', 'VERDE', 'CINZA'];
    const OLEOS = ['VEGETAL', 'MINERAL'];
    
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
    let todosRegistrosDB = [];
    let registrosCarregados = false;
    
    // ============================================
    // PREENCHER DATA AUTOMATICAMENTE
    // ============================================
    
    const dataInput = document.getElementById('data');
    const dataFormatada = getDataBrasil();
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
        
        const descricao = dados.descricao.toUpperCase();
        const categoriaConfig = CATEGORIAS[categoria];
        
        if (!categoriaConfig || !categoriaConfig.validacao) {
            return { valido: true };
        }
        
        if (categoria === 'bobinas') {
            const palavrasValidas = ['CABO', 'CORDOALHA'];
            const valido = palavrasValidas.some(palavra => descricao.startsWith(palavra));
            
            if (!valido) {
                return {
                    valido: false,
                    motivo: 'A descrição deve começar com "CABO" ou "CORDOALHA" para esta categoria'
                };
            }
        } else if (categoria === 'trafos') {
            const palavraChave = categoriaConfig.validacao.toUpperCase();
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
            await carregarTodosRegistros();
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
    // CARREGAR TODOS OS REGISTROS DO D1 - CORRIGIDO
    // ============================================
    
    async function carregarTodosRegistros() {
        try {
            console.log('🔄 Carregando registros do banco...');
            const response = await fetch(`${API_URL}/api/dados`);
            const resultados = await response.json();
            
            // ✅ FILTRAR APENAS REGISTROS ATIVOS
            todosRegistrosDB = resultados.filter(r => r.ativo === 1 || r.ativo === true);
            
            // ✅ LOG PARA VERIFICAR
            console.log('📊 Total de registros no banco:', resultados.length);
            console.log('📊 Registros ativos:', todosRegistrosDB.length);
            
            // ✅ VERIFICAR REGISTROS DO DAMIÃO
            const registrosDamaio = todosRegistrosDB.filter(r => r.nome && r.nome.includes('DAMIAO'));
            console.log('📊 Registros do Damião:', registrosDamaio.length);
            
            if (registrosDamaio.length > 0) {
                console.log('📊 Últimos 3 registros do Damião:', registrosDamaio.slice(0, 3));
            }
            
            registrosCarregados = true;
            return todosRegistrosDB;
            
        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            todosRegistrosDB = [];
            registrosCarregados = false;
            return [];
        }
    }
    
    // ============================================
    // CARREGAR ITENS MANUAIS DO D1 - CORRIGIDO
    // ============================================
    
    async function carregarItensManuais() {
        try {
            // ✅ GARANTIR QUE OS REGISTROS FORAM CARREGADOS
            if (!registrosCarregados || todosRegistrosDB.length === 0) {
                console.log('🔄 Recarregando registros...');
                await carregarTodosRegistros();
            }
            
            const resultados = todosRegistrosDB;
            
            codigosExistentesDB = new Set();
            const trafosMap = new Map();
            const bobinasMap = new Map();
            
            const ultimasQuantidades = {};
            
            // ✅ AGUPAR POR CHAVE PARA PEGAR A ÚLTIMA QUANTIDADE
            for (const item of resultados) {
                if (item.ativo === 1 || item.ativo === true) {
                    let key;
                    if (item.tipo_material === 'concreto' || (!item.tipo_material && !item.tombamento)) {
                        key = item.codigo;
                    } else {
                        key = `${item.codigo}_${item.tombamento || ''}`;
                    }
                    
                    if (!ultimasQuantidades[key] || 
                        new Date(item.data) > new Date(ultimasQuantidades[key].data)) {
                        ultimasQuantidades[key] = {
                            qtd: item.qtd,
                            data: item.data,
                            tombamento: item.tombamento
                        };
                    }
                }
            }
            
            // ✅ PROCESSAR REGISTROS
            resultados.forEach(item => {
                const isAtivo = item.ativo === 1 || item.ativo === true;
                const tipoMaterial = item.tipo_material || '';
                
                let key;
                if (tipoMaterial === 'concreto' || (!tipoMaterial && !item.tombamento)) {
                    key = item.codigo;
                } else {
                    key = `${item.codigo}_${item.tombamento || ''}`;
                }
                
                const ultimaQtd = ultimasQuantidades[key];
                const qtdSalva = ultimaQtd ? ultimaQtd.qtd : '';
                
                // ✅ TRAFOS
                if ((tipoMaterial === 'trafo' || (item.numero_serie || item.oleo || item.cor)) && isAtivo) {
                    codigosExistentesDB.add(item.codigo);
                    const mapKey = `${item.codigo}_${item.tombamento || ''}`;
                    if (!trafosMap.has(mapKey)) {
                        trafosMap.set(mapKey, {
                            codigo: item.codigo,
                            descricao: item.descricao || '',
                            und: item.und || '',
                            numero_serie: item.numero_serie || '',
                            tombamento: item.tombamento || '',
                            oleo: item.oleo || '',
                            cor: item.cor || '',
                            ativo: true,
                            tipo_material: 'trafo',
                            id: item.id,
                            _qtd: qtdSalva,
                            _n_obra: item.obs || ''
                        });
                    }
                }
                // ✅ BOBINAS
                else if (tipoMaterial === 'bobina' || 
                        (item.descricao && item.descricao.toUpperCase().startsWith('CABO') && 
                         !item.numero_serie && !item.oleo && !item.cor)) {
                    if (isAtivo) {
                        codigosExistentesDB.add(item.codigo);
                        const mapKey = `${item.codigo}_${item.tombamento || ''}`;
                        if (!bobinasMap.has(mapKey)) {
                            bobinasMap.set(mapKey, {
                                codigo: item.codigo,
                                descricao: item.descricao || '',
                                und: item.und || '',
                                tombamento: item.tombamento || '',
                                ativo: true,
                                tipo_material: 'bobina',
                                id: item.id,
                                numero_serie: null,
                                oleo: null,
                                cor: null,
                                _qtd: qtdSalva,
                                _n_obra: item.obs || ''
                            });
                        }
                    }
                }
            });
            
            materiaisManuais = Array.from(trafosMap.values());
            bobinasManuais = Array.from(bobinasMap.values());
            
            materiaisPorCategoria['trafos'] = materiaisManuais;
            materiaisPorCategoria['bobinas'] = bobinasManuais;
            
            console.log('⚡ ' + materiaisManuais.length + ' trafos ativos carregados');
            console.log('🧵 ' + bobinasManuais.length + ' bobinas ativas carregadas');
            console.log('📊 Códigos existentes no banco: ' + codigosExistentesDB.size);
            
            // ✅ ATUALIZAR CONTADORES
            atualizarContadorTrafos();
            atualizarContadorBobinas();
            
        } catch (error) {
            console.error('❌ Erro ao carregar itens manuais:', error);
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
        if (categoria === 'concretos') {
            return renderizarConcretos(materiais, categoria);
        }
        
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhum material configurado nesta categoria</p>
            </div>`;
        }
        
        let html = '';
        const tipoMaterial = CATEGORIAS[categoria]?.tipo_material || 'concreto';
        
        materiais.forEach((material, index) => {
            const idUnico = `${categoria}-${index}`;
            
            html += `
                <div class="material-item" data-codigo="${material.codigo}" data-categoria="${categoria}" data-tipo="${tipoMaterial}" data-index="${index}">
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
                buscarQuantidadeAnterior(material.codigo, `${categoria}-${index}`, null, 'concreto');
            });
        }, 100);
        
        return html;
    }
    
    // ============================================
    // RENDERIZAR CONCRETOS (COM MÚLTIPLAS ENTRADAS)
    // ============================================
    
    function renderizarConcretos(materiais, categoria) {
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhum material configurado nesta categoria</p>
            </div>`;
        }
        
        let html = '';
        const tipoMaterial = 'concreto';
        
        materiais.forEach((material, index) => {
            const idUnico = `${categoria}-${index}`;
            
            html += `
                <div class="material-item concreto-item" data-codigo="${material.codigo}" data-categoria="${categoria}" data-tipo="${tipoMaterial}" data-index="${index}">
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
                                class="input-qtd" onchange="calcularDiferencaConcreto('${idUnico}', '${material.codigo}')">
                        </div>
                        <div class="material-field">
                            <label>Últ. Cont.</label>
                            <input type="text" id="qtd-anterior-${idUnico}" readonly 
                                class="input-readonly input-qtd-anterior" value="Carregando...">
                        </div>
                    </div>
                    <div id="diferenca-${idUnico}" class="diferenca-indicador" style="display: none;"></div>
                    
                    <div class="concreto-entradas-container" id="concreto-entradas-${idUnico}">
                        <div class="concreto-entradas-header">
                            <label>Entradas de Concreto</label>
                            <button type="button" class="btn-add-concreto-entrada" onclick="adicionarEntradaConcreto('${idUnico}')">
                                + Adicionar Entrada
                            </button>
                        </div>
                        <div class="concreto-entradas-list" id="concreto-entradas-list-${idUnico}">
                        </div>
                        <div class="concreto-total" id="concreto-total-${idUnico}">
                            Total: <span id="concreto-total-valor-${idUnico}">0.00</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        setTimeout(() => {
            materiais.forEach((material, index) => {
                buscarQuantidadeAnterior(material.codigo, `${categoria}-${index}`, null, 'concreto');
                const idUnico = `${categoria}-${index}`;
                adicionarEntradaConcreto(idUnico);
            });
        }, 100);
        
        return html;
    }
    
    // ============================================
    // ADICIONAR ENTRADA DE CONCRETO
    // ============================================
    
    function adicionarEntradaConcreto(idUnico) {
        const listDiv = document.getElementById(`concreto-entradas-list-${idUnico}`);
        if (!listDiv) return;
        
        const entradaId = `entrada-${idUnico}-${Date.now()}`;
        
        const entradaDiv = document.createElement('div');
        entradaDiv.className = 'concreto-entrada-item';
        entradaDiv.id = entradaId;
        entradaDiv.innerHTML = `
            <div class="concreto-entrada-fields">
                <div class="material-field">
                    <label>Tipo</label>
                    <select class="concreto-entrada-tipo" onchange="toggleConcretoEntradaFields('${entradaId}')">
                        <option value="n_obra">N Obra</option>
                        <option value="recebimento">Recebimento</option>
                    </select>
                </div>
                <div class="material-field concreto-entrada-valor-field">
                    <label>Nº Obra</label>
                    <input type="text" class="concreto-entrada-valor" placeholder="Número da obra..." 
                        onchange="validarConcretoEntrada('${idUnico}', '${entradaId}')">
                </div>
                <div class="material-field concreto-entrada-qtd-field" style="display: block;">
                    <label>QTD Saída (-)</label>
                    <input type="number" step="0.01" class="concreto-entrada-qtd" placeholder="0.00" 
                        onchange="validarConcretoEntrada('${idUnico}', '${entradaId}')">
                </div>
                <button type="button" class="btn-remover-entrada" onclick="removerEntradaConcreto('${idUnico}', '${entradaId}')">✕</button>
            </div>
        `;
        
        listDiv.appendChild(entradaDiv);
        atualizarTotalConcreto(idUnico);
    }
    
    function toggleConcretoEntradaFields(entradaId) {
        const entradaDiv = document.getElementById(entradaId);
        if (!entradaDiv) return;
        
        const tipoSelect = entradaDiv.querySelector('.concreto-entrada-tipo');
        const valorField = entradaDiv.querySelector('.concreto-entrada-valor-field');
        const qtdField = entradaDiv.querySelector('.concreto-entrada-qtd-field');
        const valorInput = entradaDiv.querySelector('.concreto-entrada-valor');
        const qtdInput = entradaDiv.querySelector('.concreto-entrada-qtd');
        
        if (tipoSelect.value === 'n_obra') {
            valorField.querySelector('label').textContent = 'Nº Obra';
            valorInput.placeholder = 'Número da obra...';
            qtdField.querySelector('label').textContent = 'QTD Saída (-)';
            qtdField.style.display = 'block';
            qtdInput.placeholder = '0.00';
            qtdInput.value = qtdInput.value ? -Math.abs(parseFloat(qtdInput.value)) : '';
        } else {
            valorField.querySelector('label').textContent = 'Nº Recebimento';
            valorInput.placeholder = 'Número do recebimento...';
            qtdField.querySelector('label').textContent = 'QTD Recebida (+)';
            qtdField.style.display = 'block';
            qtdInput.placeholder = '0.00';
            qtdInput.value = qtdInput.value ? Math.abs(parseFloat(qtdInput.value)) : '';
        }
    }
    
    function removerEntradaConcreto(idUnico, entradaId) {
        const entradaDiv = document.getElementById(entradaId);
        if (entradaDiv && confirm('Remover esta entrada?')) {
            entradaDiv.remove();
            atualizarTotalConcreto(idUnico);
        }
    }
    
    function validarConcretoEntrada(idUnico, entradaId) {
        const entradaDiv = document.getElementById(entradaId);
        if (!entradaDiv) return;
        
        const tipoSelect = entradaDiv.querySelector('.concreto-entrada-tipo');
        const valorInput = entradaDiv.querySelector('.concreto-entrada-valor');
        const qtdInput = entradaDiv.querySelector('.concreto-entrada-qtd');
        
        if (!valorInput.value.trim()) {
            valorInput.classList.add('input-error');
            setTimeout(() => valorInput.classList.remove('input-error'), 2000);
            return;
        }
        
        if (!qtdInput.value || parseFloat(qtdInput.value) === 0) {
            qtdInput.classList.add('input-error');
            setTimeout(() => qtdInput.classList.remove('input-error'), 2000);
            return;
        }
        
        const qtd = parseFloat(qtdInput.value);
        if (tipoSelect.value === 'n_obra' && qtd > 0) {
            qtdInput.value = -qtd;
        } else if (tipoSelect.value === 'recebimento' && qtd < 0) {
            qtdInput.value = Math.abs(qtd);
        }
        
        atualizarTotalConcreto(idUnico);
    }
    
    function atualizarTotalConcreto(idUnico) {
        const listDiv = document.getElementById(`concreto-entradas-list-${idUnico}`);
        const totalSpan = document.getElementById(`concreto-total-valor-${idUnico}`);
        if (!listDiv || !totalSpan) return;
        
        let total = 0;
        const entradas = listDiv.querySelectorAll('.concreto-entrada-item');
        
        entradas.forEach(entrada => {
            const qtdInput = entrada.querySelector('.concreto-entrada-qtd');
            if (qtdInput && qtdInput.value) {
                total += parseFloat(qtdInput.value) || 0;
            }
        });
        
        totalSpan.textContent = total.toFixed(2);
        
        const qtdAtual = parseFloat(document.getElementById(`qtd-${idUnico}`)?.value) || 0;
        const qtdAnterior = parseFloat(document.getElementById(`qtd-anterior-${idUnico}`)?.value) || 0;
        const diferenca = qtdAtual - qtdAnterior;
        
        const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
        if (diferencaDiv) {
            const materialItem = document.querySelector(`.concreto-item[data-index="${idUnico.split('-')[1]}"]`);
            const temContagemAnterior = materialItem?.dataset?.temContagemAnterior === 'true';
            
            if (!temContagemAnterior && qtdAnterior === 0) {
                diferencaDiv.style.display = 'flex';
                diferencaDiv.className = 'diferenca-indicador diferenca-ok';
                diferencaDiv.innerHTML = `✅ Primeira contagem - Total das entradas: ${total.toFixed(2)}`;
                return;
            }
            
            if (Math.abs(total - diferenca) > 0.001) {
                diferencaDiv.style.display = 'flex';
                diferencaDiv.className = 'diferenca-indicador diferenca-erro';
                diferencaDiv.innerHTML = `❌ Total das entradas (${total.toFixed(2)}) não bate com a diferença (${diferenca.toFixed(2)})`;
            } else {
                diferencaDiv.style.display = 'flex';
                diferencaDiv.className = 'diferenca-indicador diferenca-ok';
                diferencaDiv.innerHTML = `✅ Total das entradas: ${total.toFixed(2)} (diferença: ${diferenca.toFixed(2)})`;
            }
        }
    }
    
    function calcularDiferencaConcreto(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
        setTimeout(() => {
            atualizarTotalConcreto(idUnico);
        }, 100);
    }
    
    // ============================================
    // RENDERIZAR BOBINAS
    // ============================================

    function renderizarBobinas(materiais) {
        let html = '';
        
        html += `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                <button type="button" class="btn-add-material" onclick="adicionarBobina()" style="margin-top: 0;">
                    + Adicionar Nova Bobina
                </button>
            </div>
        `;
        
        html += `<div id="bobinas-container">`;
        
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
            const existeNoBanco = material.id !== null && material.id !== undefined && material.id !== 'null' && material.id !== '';
            const temDescricao = material.descricao && material.descricao.trim() !== '';
            const qtdSalva = material._qtd || '';
            const idRegistro = material.id || null;
            const idx = index;
            
            const lockedClass = existeNoBanco ? 'input-locked' : '';
            const itemBloqueado = existeNoBanco ? 'material-bloqueado' : '';
            
            html += `
                <div class="material-item bobina-item ${itemBloqueado}" 
                     data-codigo="${codigoBobina}" 
                     data-categoria="bobinas" 
                     data-tipo="bobina" 
                     data-id="${idRegistro}" 
                     data-tombamento="${material.tombamento || ''}"
                     data-index="${idx}">
                    <div class="material-header">
                        <span class="material-number">Bobina #${idx + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <label class="checkbox-baixa-label">
                                <input type="checkbox" 
                                    class="checkbox-baixa-bobina" 
                                    data-index="${idx}"
                                    onchange="toggleBaixaBobina(${idx}, this)">
                                Dar baixa
                            </label>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${idx}"
                                onclick="removerBobina(${idx})"
                                title="Remover esta bobina">
                                ✕
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="material-row">
                        <div class="material-field">
                            <label>Código *</label>
                            <input type="text" id="bobina-codigo-${idx}" value="${codigoBobina}" 
                                placeholder="Código" class="input-trafo" required
                                ${temDescricao ? 'readonly' : ''}
                                onchange="validarCodigoBobina(${idx}, this.value)">
                            <div id="bobina-codigo-status-${idx}" class="codigo-status"></div>
                        </div>
                        <div class="material-field">
                            <label>Descrição *</label>
                            <input type="text" id="bobina-descricao-${idx}" value="${material.descricao || ''}" 
                                placeholder="Descrição" class="input-descricao" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label>UND *</label>
                            <input type="text" id="bobina-und-${idx}" value="${material.und || ''}" 
                                placeholder="UND" class="input-readonly" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-extras">
                        <div class="material-field">
                            <label>Tombamento *</label>
                            <input type="text" id="bobina-tombamento-${idx}" value="${material.tombamento || ''}" 
                                placeholder="Tombamento" class="input-extra ${lockedClass}" 
                                ${existeNoBanco ? 'readonly' : ''} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label>QTD *</label>
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
                            <label>N Obra</label>
                            <input type="text" id="n-obra-${idUnico}" 
                                value="${material._n_obra || ''}"
                                placeholder="Número da obra..." 
                                class="input-justificativa"
                                ${existeNoBanco ? `oninput="verificarNObraBobina(${idx})"` : ''}>
                        </div>
                    </div>
                    
                    ${existeNoBanco ? `
                    <div id="alerta-baixa-bobina-${idx}" class="alerta-baixa" style="display: none;">
                        ⚠️ Para dar baixa, preencha o Nº da Obra.
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
        
        setTimeout(() => {
            const items = document.querySelectorAll('.bobina-item');
            items.forEach((item) => {
                const codigo = item.dataset.codigo;
                const tombamento = item.dataset.tombamento || '';
                const idUnico = `bobinas-${item.dataset.index}`;
                if (codigo) {
                    buscarQuantidadeAnterior(codigo, idUnico, tombamento, 'bobina');
                }
            });
        }, 200);
        
        return html;
    }
    
    // ============================================
    // RENDERIZAR TRAFOS
    // ============================================

    function renderizarTrafos(materiais) {
        let html = '';
        
        html += `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 15px;">
                <button type="button" class="btn-add-material" onclick="adicionarTrafo()" style="margin-top: 0;">
                    + Adicionar Novo Trafo
                </button>
            </div>
        `;
        
        html += `<div id="trafos-container">`;
        
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
            const existeNoBanco = material.id !== null && material.id !== undefined && material.id !== 'null' && material.id !== '';
            const temDescricao = material.descricao && material.descricao.trim() !== '';
            const qtdSalva = material._qtd || '';
            const idRegistro = material.id || null;
            const idx = index;
            
            const lockedClass = existeNoBanco ? 'input-locked' : '';
            const itemBloqueado = existeNoBanco ? 'material-bloqueado' : '';
            
            html += `
                <div class="material-item trafo-item ${itemBloqueado}" 
                     data-codigo="${codigoTrafo}" 
                     data-categoria="trafos" 
                     data-tipo="trafo" 
                     data-id="${idRegistro}" 
                     data-tombamento="${material.tombamento || ''}"
                     data-index="${idx}">
                    <div class="material-header">
                        <span class="material-number">Trafo #${idx + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <label class="checkbox-baixa-label">
                                <input type="checkbox" 
                                    class="checkbox-baixa-trafo" 
                                    data-index="${idx}"
                                    onchange="toggleBaixaTrafo(${idx}, this)">
                                Dar baixa
                            </label>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${idx}"
                                onclick="removerTrafo(${idx})"
                                title="Remover este trafo">
                                ✕
                            </button>
                            `}
                        </div>
                    </div>
                    
                    <div class="material-row">
                        <div class="material-field">
                            <label>Código *</label>
                            <input type="text" id="trafo-codigo-${idx}" value="${codigoTrafo}" 
                                placeholder="Código" class="input-trafo" required
                                ${temDescricao ? 'readonly' : ''}
                                onchange="validarCodigoTrafo(${idx}, this.value)">
                            <div id="codigo-status-${idx}" class="codigo-status"></div>
                        </div>
                        <div class="material-field">
                            <label>Descrição *</label>
                            <input type="text" id="trafo-descricao-${idx}" value="${material.descricao || ''}" 
                                placeholder="Descrição" class="input-descricao" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label>UND *</label>
                            <input type="text" id="trafo-und-${idx}" value="${material.und || ''}" 
                                placeholder="UND" class="input-readonly" 
                                ${temDescricao ? 'readonly' : ''} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-extras">
                        <div class="material-field">
                            <label>Nº Série *</label>
                            <input type="text" id="trafo-serie-${idx}" value="${material.numero_serie || ''}" 
                                placeholder="Nº de série" class="input-extra ${lockedClass}" 
                                ${existeNoBanco ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label>Tombamento *</label>
                            <input type="text" id="trafo-tombamento-${idx}" value="${material.tombamento || ''}" 
                                placeholder="Tombamento" class="input-extra ${lockedClass}" 
                                ${existeNoBanco ? 'readonly' : ''} required>
                        </div>
                        <div class="material-field">
                            <label>Óleo *</label>
                            <select id="trafo-oleo-${idx}" class="input-extra ${lockedClass}" 
                                ${existeNoBanco ? 'disabled' : ''} required>
                                <option value="">Selecione...</option>
                                ${OLEOS.map(oleo => `<option value="${oleo}" ${material.oleo === oleo ? 'selected' : ''}>${oleo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="material-field">
                            <label>Cor *</label>
                            <select id="trafo-cor-${idx}" class="input-extra ${lockedClass}" 
                                ${existeNoBanco ? 'disabled' : ''} required>
                                <option value="">Selecione...</option>
                                ${CORES.map(cor => `<option value="${cor}" ${material.cor === cor ? 'selected' : ''}>${cor}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label>QTD *</label>
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
                            <label>N Obra</label>
                            <input type="text" id="n-obra-${idUnico}" 
                                value="${material._n_obra || ''}"
                                placeholder="Número da obra..." 
                                class="input-justificativa"
                                ${existeNoBanco ? `oninput="verificarNObraTrafo(${idx})"` : ''}>
                        </div>
                    </div>
                    
                    ${existeNoBanco ? `
                    <div id="alerta-baixa-trafo-${idx}" class="alerta-baixa" style="display: none;">
                        ⚠️ Para dar baixa, preencha o Nº da Obra.
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
        
        setTimeout(() => {
            const items = document.querySelectorAll('.trafo-item');
            items.forEach((item) => {
                const codigo = item.dataset.codigo;
                const tombamento = item.dataset.tombamento || '';
                const idUnico = `trafos-${item.dataset.index}`;
                if (codigo) {
                    buscarQuantidadeAnterior(codigo, idUnico, tombamento, 'trafo');
                }
            });
        }, 200);
        
        return html;
    }
    
    // ============================================
    // FUNÇÕES PARA BOBINAS E TRAFOS
    // ============================================
    
    function verificarNObraBobina(index) {
        const nObraInput = document.getElementById(`n-obra-bobinas-${index}`);
        const checkbox = document.querySelector(`.checkbox-baixa-bobina[data-index="${index}"]`);
        const alertaDiv = document.getElementById(`alerta-baixa-bobina-${index}`);
        
        if (nObraInput && nObraInput.value.trim() && checkbox && checkbox.checked) {
            if (alertaDiv) alertaDiv.style.display = 'none';
            nObraInput.classList.remove('input-error');
        }
    }
    
    function verificarNObraTrafo(index) {
        const nObraInput = document.getElementById(`n-obra-trafos-${index}`);
        const checkbox = document.querySelector(`.checkbox-baixa-trafo[data-index="${index}"]`);
        const alertaDiv = document.getElementById(`alerta-baixa-trafo-${index}`);
        
        if (nObraInput && nObraInput.value.trim() && checkbox && checkbox.checked) {
            if (alertaDiv) alertaDiv.style.display = 'none';
            nObraInput.classList.remove('input-error');
        }
    }
    
    function toggleBaixaBobina(index, checkbox) {
        const nObraInput = document.getElementById(`n-obra-bobinas-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-bobina-${index}`);
        
        if (checkbox.checked) {
            const nObra = nObraInput ? nObraInput.value.trim() : '';
            
            if (!nObra) {
                checkbox.checked = false;
                if (alertaDiv) {
                    alertaDiv.style.display = 'block';
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 3000);
                }
                if (nObraInput) {
                    nObraInput.classList.add('input-error');
                    nObraInput.focus();
                    setTimeout(() => nObraInput.classList.remove('input-error'), 2000);
                }
                mostrarToast('⚠️ Para dar baixa, preencha o Nº da Obra.', 'aviso');
            }
        } else {
            if (alertaDiv) {
                alertaDiv.style.display = 'none';
            }
            if (nObraInput) {
                nObraInput.classList.remove('input-error');
            }
        }
    }
    
    function toggleBaixaTrafo(index, checkbox) {
        const nObraInput = document.getElementById(`n-obra-trafos-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-trafo-${index}`);
        
        if (checkbox.checked) {
            const nObra = nObraInput ? nObraInput.value.trim() : '';
            
            if (!nObra) {
                checkbox.checked = false;
                if (alertaDiv) {
                    alertaDiv.style.display = 'block';
                    setTimeout(() => { alertaDiv.style.display = 'none'; }, 3000);
                }
                if (nObraInput) {
                    nObraInput.classList.add('input-error');
                    nObraInput.focus();
                    setTimeout(() => nObraInput.classList.remove('input-error'), 2000);
                }
                mostrarToast('⚠️ Para dar baixa, preencha o Nº da Obra.', 'aviso');
            }
        } else {
            if (alertaDiv) {
                alertaDiv.style.display = 'none';
            }
            if (nObraInput) {
                nObraInput.classList.remove('input-error');
            }
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
            mostrarToast('❌ ' + validacao.motivo, 'erro');
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
                statusDiv.innerHTML = '✅ Código válido para bobina (CABO ou CORDOALHA)';
                statusDiv.className = 'codigo-status codigo-ok';
            }
            
            buscarQuantidadeAnterior(codigo.trim(), `bobinas-${index}`, bobinasManuais[index]?.tombamento, 'bobina');
            
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
    // FUNÇÕES DE VALIDAÇÃO
    // ============================================
    
    function validarTrafoCompleto(index) {
        if (index === undefined || index === null || isNaN(index) || index < 0) {
            console.error('❌ Index inválido em validarTrafoCompleto:', index);
            return false;
        }
        
        const qtd = parseFloat(document.getElementById(`qtd-trafos-${index}`)?.value) || 0;
        
        if (qtd === 0) {
            return true;
        }
        
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
        
        const checkboxBaixa = document.querySelector(`.checkbox-baixa-trafo[data-index="${index}"]`);
        if (checkboxBaixa && checkboxBaixa.checked) {
            const nObra = document.getElementById(`n-obra-trafos-${index}`)?.value || '';
            if (!nObra) {
                return false;
            }
        }
        
        return true;
    }
    
    function validarBobinaCompleta(index) {
        if (index === undefined || index === null || isNaN(index) || index < 0) {
            console.error('❌ Index inválido em validarBobinaCompleta:', index);
            return false;
        }
        
        const qtd = parseFloat(document.getElementById(`qtd-bobinas-${index}`)?.value) || 0;
        
        if (qtd === 0) {
            return true;
        }
        
        const codigo = document.getElementById(`bobina-codigo-${index}`)?.value || '';
        const descricao = document.getElementById(`bobina-descricao-${index}`)?.value || '';
        const und = document.getElementById(`bobina-und-${index}`)?.value || '';
        const tombamento = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
        
        if (!codigo || !descricao || !und || !tombamento) {
            return false;
        }
        
        const checkboxBaixa = document.querySelector(`.checkbox-baixa-bobina[data-index="${index}"]`);
        if (checkboxBaixa && checkboxBaixa.checked) {
            const nObra = document.getElementById(`n-obra-bobinas-${index}`)?.value || '';
            if (!nObra) {
                return false;
            }
        }
        
        return true;
    }
    
    // ============================================
    // CALCULAR DIFERENÇA
    // ============================================
    
    function calcularDiferencaBobina(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    function calcularDiferencaTrafo(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    // ============================================
    // ADICIONAR BOBINA
    // ============================================
    
    function adicionarBobina() {
        console.log('🧵 Função adicionarBobina chamada');
        
        salvarDadosBobinasAtuais();
        
        const novaBobina = {
            codigo: '',
            descricao: '',
            und: '',
            tombamento: '',
            ativo: true,
            isNew: true,
            _qtd: '',
            _n_obra: '',
            tipo_material: 'bobina',
            numero_serie: null,
            oleo: null,
            cor: null,
            id: null
        };
        
        bobinasManuais.unshift(novaBobina);
        materiaisPorCategoria['bobinas'] = bobinasManuais;
        
        const tabsContent = document.getElementById('tab-bobinas');
        if (tabsContent) {
            tabsContent.innerHTML = renderizarBobinas(bobinasManuais);
            atualizarContadorBobinas();
            
            setTimeout(() => {
                bobinasManuais.forEach((material, index) => {
                    if (material.codigo) {
                        buscarQuantidadeAnterior(material.codigo, `bobinas-${index}`, material.tombamento, 'bobina');
                    }
                    if (material._qtd) {
                        const idUnico = `bobinas-${index}`;
                        calcularDiferencaBobina(idUnico, material.codigo);
                    }
                });
            }, 100);
            
            const primeiroItem = tabsContent.querySelector('.bobina-item:first-child');
            if (primeiroItem) {
                primeiroItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = primeiroItem.querySelector('#bobina-codigo-0');
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        }
    }
    
    // ============================================
    // SALVAR DADOS ATUAIS DAS BOBINAS
    // ============================================
    
    function salvarDadosBobinasAtuais() {
        const bobinaItems = document.querySelectorAll('.bobina-item');
        bobinaItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index) || index < 0 || index >= bobinasManuais.length) {
                return;
            }
            
            const codigo = document.getElementById(`bobina-codigo-${index}`)?.value || '';
            const descricao = document.getElementById(`bobina-descricao-${index}`)?.value || '';
            const und = document.getElementById(`bobina-und-${index}`)?.value || '';
            const tombamento = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
            const qtd = document.getElementById(`qtd-bobinas-${index}`)?.value || '';
            const nObra = document.getElementById(`n-obra-bobinas-${index}`)?.value || '';
            
            bobinasManuais[index].codigo = codigo;
            bobinasManuais[index].descricao = descricao;
            bobinasManuais[index].und = und;
            bobinasManuais[index].tombamento = tombamento;
            bobinasManuais[index]._qtd = qtd;
            bobinasManuais[index]._n_obra = nObra;
            bobinasManuais[index].tipo_material = 'bobina';
            bobinasManuais[index].id = item.dataset.id || null;
        });
    }
    
    // ============================================
    // SALVAR DADOS ATUAIS DOS TRAFOS
    // ============================================
    
    function salvarDadosTrafosAtuais() {
        const trafoItems = document.querySelectorAll('.trafo-item');
        trafoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index) || index < 0 || index >= materiaisManuais.length) {
                return;
            }
            
            const codigo = document.getElementById(`trafo-codigo-${index}`)?.value || '';
            const descricao = document.getElementById(`trafo-descricao-${index}`)?.value || '';
            const und = document.getElementById(`trafo-und-${index}`)?.value || '';
            const serie = document.getElementById(`trafo-serie-${index}`)?.value || '';
            const tombamento = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
            const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
            const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
            const qtd = document.getElementById(`qtd-trafos-${index}`)?.value || '';
            const nObra = document.getElementById(`n-obra-trafos-${index}`)?.value || '';
            
            materiaisManuais[index].codigo = codigo;
            materiaisManuais[index].descricao = descricao;
            materiaisManuais[index].und = und;
            materiaisManuais[index].numero_serie = serie;
            materiaisManuais[index].tombamento = tombamento;
            materiaisManuais[index].oleo = oleo;
            materiaisManuais[index].cor = cor;
            materiaisManuais[index]._qtd = qtd;
            materiaisManuais[index]._n_obra = nObra;
            materiaisManuais[index].tipo_material = 'trafo';
            materiaisManuais[index].id = item.dataset.id || null;
        });
    }
    
    // ============================================
    // REMOVER BOBINA
    // ============================================
    
    function removerBobina(index) {
        const bobina = bobinasManuais[index];
        const codigo = bobina?.codigo || '';
        
        if (codigo && codigoExisteNoBanco(codigo)) {
            mostrarToast('❌ Esta bobina já está registrada no banco de dados e não pode ser removida. Use a opção "Dar baixa" para desativá-la.', 'erro');
            return;
        }
        
        if (confirm('Tem certeza que deseja remover esta bobina? Esta ação não pode ser desfeita.')) {
            bobinasManuais.splice(index, 1);
            materiaisPorCategoria['bobinas'] = bobinasManuais;
            
            const tabsContent = document.getElementById('tab-bobinas');
            tabsContent.innerHTML = renderizarBobinas(bobinasManuais);
            atualizarContadorBobinas();
            
            mostrarToast('✅ Bobina removida com sucesso!', 'sucesso');
        }
    }
    
    // ============================================
    // ADICIONAR TRAFO
    // ============================================
    
    function adicionarTrafo() {
        console.log('🔧 Função adicionarTrafo chamada');
        
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
            _n_obra: '',
            tipo_material: 'trafo',
            id: null
        };
        
        materiaisManuais.unshift(novoTrafo);
        materiaisPorCategoria['trafos'] = materiaisManuais;
        
        const tabsContent = document.getElementById('tab-trafos');
        if (tabsContent) {
            tabsContent.innerHTML = renderizarTrafos(materiaisManuais);
            atualizarContadorTrafos();
            
            setTimeout(() => {
                materiaisManuais.forEach((material, index) => {
                    if (material.codigo) {
                        buscarQuantidadeAnterior(material.codigo, `trafos-${index}`, material.tombamento, 'trafo');
                    }
                    if (material._qtd) {
                        const idUnico = `trafos-${index}`;
                        calcularDiferencaTrafo(idUnico, material.codigo);
                    }
                });
            }, 100);
            
            const primeiroItem = tabsContent.querySelector('.trafo-item:first-child');
            if (primeiroItem) {
                primeiroItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = primeiroItem.querySelector('#trafo-codigo-0');
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        }
    }
    
    // ============================================
    // REMOVER TRAFO
    // ============================================
    
    function removerTrafo(index) {
        const trafo = materiaisManuais[index];
        const codigo = trafo?.codigo || '';
        
        if (codigo && codigoExisteNoBanco(codigo)) {
            mostrarToast('❌ Este trafo já está registrado no banco de dados e não pode ser removido. Use a opção "Dar baixa" para desativá-lo.', 'erro');
            return;
        }
        
        if (confirm('Tem certeza que deseja remover este trafo? Esta ação não pode ser desfeita.')) {
            materiaisManuais.splice(index, 1);
            materiaisPorCategoria['trafos'] = materiaisManuais;
            
            const tabsContent = document.getElementById('tab-trafos');
            tabsContent.innerHTML = renderizarTrafos(materiaisManuais);
            atualizarContadorTrafos();
            
            mostrarToast('✅ Trafo removido com sucesso!', 'sucesso');
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
            mostrarToast('❌ ' + validacao.motivo, 'erro');
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
            
            buscarQuantidadeAnterior(codigo.trim(), `trafos-${index}`, materiaisManuais[index]?.tombamento, 'trafo');
            
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
    // TOAST DE NOTIFICAÇÃO
    // ============================================

    function mostrarToast(mensagem, tipo) {
        const toastExistente = document.querySelector('.toast-notificacao');
        if (toastExistente) {
            toastExistente.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-notificacao toast-${tipo}`;
        toast.innerHTML = mensagem;
        
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 25px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            transform: 'translateX(120%)',
            transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
        });
        
        const cores = {
            sucesso: {
                background: 'linear-gradient(135deg, #48bb78, #38a169)',
                color: '#ffffff',
                borderColor: '#48bb78'
            },
            erro: {
                background: 'linear-gradient(135deg, #fc8181, #e53e3e)',
                color: '#ffffff',
                borderColor: '#fc8181'
            },
            info: {
                background: 'linear-gradient(135deg, #63b3ed, #4299e1)',
                color: '#ffffff',
                borderColor: '#63b3ed'
            },
            aviso: {
                background: 'linear-gradient(135deg, #f6ad55, #ed8936)',
                color: '#ffffff',
                borderColor: '#f6ad55'
            }
        };
        
        const cor = cores[tipo] || cores.info;
        toast.style.background = cor.background;
        toast.style.color = cor.color;
        toast.style.borderColor = cor.borderColor;
        
        document.body.appendChild(toast);
        
        toast.offsetHeight;
        toast.style.transform = 'translateX(0)';
        
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400);
        }, 4000);
        
        toast.addEventListener('click', () => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400);
        });
    }
    
    // ============================================
    // BUSCAR QUANTIDADE DO DIA ANTERIOR
    // ============================================
    
    async function buscarQuantidadeAnterior(codigo, idUnico, tombamento, tipoMaterial) {
        const inputAnterior = document.getElementById(`qtd-anterior-${idUnico}`);
        if (!inputAnterior || !codigo) return;
        
        let cacheKey = codigo;
        if (tipoMaterial && tipoMaterial !== 'concreto' && tombamento && tombamento !== '') {
            cacheKey = `${codigo}_${tombamento}`;
        }
        
        if (cacheQuantidades[cacheKey]) {
            const dados = cacheQuantidades[cacheKey];
            inputAnterior.value = dados.qtd || '0';
            inputAnterior.title = dados.data ? `Última contagem: ${formatarData(dados.data)}` : 'Nenhuma contagem anterior';
            inputAnterior.classList.add(dados.qtd ? 'tem-dado-anterior' : 'sem-dado-anterior');
            
            const materialItem = inputAnterior.closest('.material-item');
            if (materialItem) {
                materialItem.dataset.temContagemAnterior = dados.qtd ? 'true' : 'false';
            }
            return;
        }
        
        try {
            const body = { 
                codigo: codigo, 
                data_atual: dataFormatada,
                tipo_material: tipoMaterial || 'concreto'
            };
            
            if (tipoMaterial && tipoMaterial !== 'concreto' && tombamento && tombamento !== '') {
                body.tombamento = tombamento;
            }
            
            const response = await fetch(`${API_URL}/api/contagem-anterior`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            
            const resultado = await response.json();
            
            const materialItem = inputAnterior.closest('.material-item');
            
            if (resultado.encontrado) {
                const qtdAnterior = resultado.qtd_anterior || '0';
                cacheQuantidades[cacheKey] = {
                    qtd: qtdAnterior,
                    data: resultado.data_anterior
                };
                inputAnterior.value = qtdAnterior;
                inputAnterior.title = `Última contagem: ${formatarData(resultado.data_anterior)}`;
                inputAnterior.classList.add('tem-dado-anterior');
                
                if (materialItem) {
                    materialItem.dataset.temContagemAnterior = 'true';
                }
                console.log(`📊 Contagem anterior para ${cacheKey}: ${qtdAnterior}`);
            } else {
                cacheQuantidades[cacheKey] = {
                    qtd: '0',
                    data: null
                };
                inputAnterior.value = '0';
                inputAnterior.title = 'Nenhuma contagem anterior encontrada';
                inputAnterior.classList.add('sem-dado-anterior');
                
                if (materialItem) {
                    materialItem.dataset.temContagemAnterior = 'false';
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao buscar quantidade anterior:', error);
            inputAnterior.value = '0';
            inputAnterior.title = 'Erro ao carregar';
            inputAnterior.classList.add('sem-dado-anterior');
            
            const materialItem = inputAnterior.closest('.material-item');
            if (materialItem) {
                materialItem.dataset.temContagemAnterior = 'false';
            }
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
        
        const materialItem = inputQtd.closest('.material-item');
        if (materialItem) {
            materialItem.dataset.temContagemAnterior = qtdAnterior > 0 ? 'true' : 'false';
        }
        
        if (qtdAnterior === 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-ok';
            diferencaDiv.innerHTML = `📝 Primeira contagem - QTD: ${qtdAtual.toFixed(2)}`;
            return;
        }
        
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
    // ENVIAR FORMULÁRIO
    // ============================================
    
    document.getElementById('contagemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        salvarDadosTrafosAtuais();
        salvarDadosBobinasAtuais();
        
        const mensagemDiv = document.getElementById('mensagem');
        const botaoSubmit = e.target.querySelector('.submit-btn');
        
        const nome = document.getElementById('nome').value;
        const matricula = document.getElementById('matricula').value;
        const data = document.getElementById('data').value;
        
        if (!nome.trim()) {
            mostrarToast('❌ Por favor, preencha o nome!', 'erro');
            return;
        }
        
        const trafoItems = document.querySelectorAll('.trafo-item');
        let trafoIncompleto = false;
        trafoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) {
                console.warn('⚠️ Índice inválido no trafo:', item);
                return;
            }
            
            const qtdInput = document.getElementById(`qtd-trafos-${index}`);
            const qtd = parseFloat(qtdInput?.value) || 0;
            
            if (qtd > 0) {
                if (!validarTrafoCompleto(index)) {
                    trafoIncompleto = true;
                    item.style.borderColor = '#FC8181';
                    item.style.borderWidth = '2px';
                    item.style.borderStyle = 'solid';
                }
            }
        });
        
        if (trafoIncompleto) {
            mostrarToast('❌ Todos os campos dos trafos são obrigatórios!', 'erro');
            return;
        }
        
        const bobinaItems = document.querySelectorAll('.bobina-item');
        let bobinaIncompleta = false;
        bobinaItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) {
                console.warn('⚠️ Índice inválido na bobina:', item);
                return;
            }
            
            const qtdInput = document.getElementById(`qtd-bobinas-${index}`);
            const qtd = parseFloat(qtdInput?.value) || 0;
            
            if (qtd > 0) {
                if (!validarBobinaCompleta(index)) {
                    bobinaIncompleta = true;
                    item.style.borderColor = '#FC8181';
                    item.style.borderWidth = '2px';
                    item.style.borderStyle = 'solid';
                }
            }
        });
        
        if (bobinaIncompleta) {
            mostrarToast('❌ Todos os campos das bobinas são obrigatórios!', 'erro');
            return;
        }
        
        const concretoItems = document.querySelectorAll('.concreto-item');
        let concretoInvalido = false;
        concretoItems.forEach((item) => {
            const diferencaDiv = document.getElementById(`diferenca-concretos-${item.dataset.index}`);
            if (diferencaDiv && diferencaDiv.classList.contains('diferenca-erro')) {
                concretoInvalido = true;
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
            }
        });
        
        if (concretoInvalido) {
            mostrarToast('❌ Verifique as entradas de concreto: o total não bate com a diferença da contagem!', 'erro');
            return;
        }
        
        const materiaisParaEnviar = [];
        const materiaisParaDesativar = [];
        const inputsQtd = document.querySelectorAll('.input-qtd');
        let temErroValidacao = false;
        
        inputsQtd.forEach(input => {
            const qtd = parseFloat(input.value);
            if (!isNaN(qtd) && qtd > 0) {
                const materialItem = input.closest('.material-item');
                const codigo = materialItem.dataset.codigo;
                const categoria = materialItem.dataset.categoria;
                const tipoMaterial = materialItem.dataset.tipo || 'concreto';
                const idRegistro = materialItem.dataset.id || null;
                const tombamento = materialItem.dataset.tombamento || '';
                
                let nObra = '';
                const nObraInput = materialItem.querySelector('.input-justificativa');
                if (nObraInput) {
                    nObra = nObraInput.value || '';
                }
                
                let darBaixa = false;
                if (categoria === 'trafos') {
                    const index = materialItem.dataset.index;
                    const checkboxBaixa = materialItem.querySelector('.checkbox-baixa-trafo');
                    darBaixa = checkboxBaixa ? checkboxBaixa.checked : false;
                } else if (categoria === 'bobinas') {
                    const index = materialItem.dataset.index;
                    const checkboxBaixa = materialItem.querySelector('.checkbox-baixa-bobina');
                    darBaixa = checkboxBaixa ? checkboxBaixa.checked : false;
                }
                
                if (darBaixa && idRegistro && idRegistro !== 'null') {
                    console.log(`🔴 Desativando registro ID: ${idRegistro} (${tipoMaterial}) - Tombamento: ${tombamento}`);
                    materiaisParaDesativar.push({
                        id: parseInt(idRegistro),
                        obs: nObra || `Baixa realizada por ${nome}`,
                        tipo_material: tipoMaterial
                    });
                    return;
                }
                
                if (categoria === 'trafos') {
                    const index = parseInt(materialItem.dataset.index);
                    if (isNaN(index)) {
                        console.warn('⚠️ Índice inválido no trafo para envio:', materialItem);
                        return;
                    }
                    
                    const codigoTrafo = document.getElementById(`trafo-codigo-${index}`)?.value || codigo;
                    const descricaoTrafo = document.getElementById(`trafo-descricao-${index}`)?.value || '';
                    const undTrafo = document.getElementById(`trafo-und-${index}`)?.value || '';
                    
                    const validacao = validarCodigoPorCategoria(codigoTrafo, 'trafos');
                    if (!validacao.valido) {
                        mostrarToast('❌ Trafo #' + (parseInt(index) + 1) + ': ' + validacao.motivo, 'erro');
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
                        mostrarToast('❌ O código "' + codigoTrafo + '" do Trafo #' + (parseInt(index) + 1) + ' não foi encontrado na base de dados!', 'erro');
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
                    const tombamentoTrafo = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
                    const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
                    const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
                    
                    materiaisParaEnviar.push({
                        nome, matricula, data,
                        codigo: codigoTrafo,
                        descricao: descricaoTrafo,
                        und: undTrafo,
                        qtd: qtd,
                        numero_serie: serie,
                        tombamento: tombamentoTrafo,
                        oleo: oleo,
                        cor: cor,
                        n_obra: nObra || `Contagem diária - ${nome}`,
                        ativo: 1,
                        tipo_material: 'trafo'
                    });
                    
                } else if (categoria === 'bobinas') {
                    const index = parseInt(materialItem.dataset.index);
                    if (isNaN(index)) {
                        console.warn('⚠️ Índice inválido na bobina para envio:', materialItem);
                        return;
                    }
                    
                    const codigoBobina = document.getElementById(`bobina-codigo-${index}`)?.value || codigo;
                    const descricaoBobina = document.getElementById(`bobina-descricao-${index}`)?.value || '';
                    const undBobina = document.getElementById(`bobina-und-${index}`)?.value || '';
                    const tombamentoBobina = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
                    
                    const validacao = validarCodigoPorCategoria(codigoBobina, 'bobinas');
                    if (!validacao.valido) {
                        mostrarToast('❌ Bobina #' + (parseInt(index) + 1) + ': ' + validacao.motivo, 'erro');
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
                        mostrarToast('❌ O código "' + codigoBobina + '" da Bobina #' + (parseInt(index) + 1) + ' não foi encontrado na base de dados!', 'erro');
                        const codigoInput = document.getElementById(`bobina-codigo-${index}`);
                        if (codigoInput) {
                            codigoInput.classList.add('input-error');
                            codigoInput.focus();
                            setTimeout(() => codigoInput.classList.remove('input-error'), 3000);
                        }
                        temErroValidacao = true;
                        return;
                    }
                    
                    materiaisParaEnviar.push({
                        nome, matricula, data,
                        codigo: codigoBobina,
                        descricao: descricaoBobina,
                        und: undBobina,
                        qtd: qtd,
                        numero_serie: null,
                        tombamento: tombamentoBobina,
                        oleo: null,
                        cor: null,
                        n_obra: nObra || `Contagem diária - ${nome}`,
                        ativo: 1,
                        tipo_material: 'bobina'
                    });
                    
                } else if (categoria === 'concretos') {
                    const index = parseInt(materialItem.dataset.index);
                    const idUnico = `${categoria}-${index}`;
                    
                    const temContagemAnterior = materialItem.dataset.temContagemAnterior === 'true';
                    
                    if (temContagemAnterior) {
                        const justificativa = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                        if (!justificativa.trim()) {
                            const descricaoMaterial = materialItem.querySelector('.input-descricao')?.value || materialItem.dataset.codigo;
                            mostrarToast(`❌ Justificativa é obrigatória para ${descricaoMaterial} pois tem contagem anterior!`, 'erro');
                            const justificativaInput = document.getElementById(`justificativa-${idUnico}`);
                            if (justificativaInput) {
                                justificativaInput.classList.add('input-error');
                                justificativaInput.focus();
                                setTimeout(() => justificativaInput.classList.remove('input-error'), 3000);
                            }
                            temErroValidacao = true;
                            return;
                        }
                    }
                    
                    const entradas = [];
                    const entradaItems = document.querySelectorAll(`#concreto-entradas-list-${idUnico} .concreto-entrada-item`);
                    entradaItems.forEach(entradaItem => {
                        const tipo = entradaItem.querySelector('.concreto-entrada-tipo')?.value || '';
                        const valor = entradaItem.querySelector('.concreto-entrada-valor')?.value || '';
                        const qtdEntrada = parseFloat(entradaItem.querySelector('.concreto-entrada-qtd')?.value) || 0;
                        
                        if (valor && qtdEntrada !== 0) {
                            entradas.push({
                                tipo: tipo,
                                valor: valor,
                                qtd: qtdEntrada
                            });
                        }
                    });
                    
                    const materiaisDaCategoria = materiaisPorCategoria[categoria] || [];
                    const material = materiaisDaCategoria.find(m => m.codigo === codigo);
                    
                    if (material) {
                        const justificativa = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                        materiaisParaEnviar.push({
                            nome, matricula, data,
                            codigo: material.codigo,
                            descricao: material.descricao,
                            und: material.und,
                            qtd: qtd,
                            numero_serie: null,
                            tombamento: null,
                            oleo: null,
                            cor: null,
                            n_obra: '',
                            ativo: 1,
                            tipo_material: 'concreto',
                            entradas_concreto: entradas,
                            obs: justificativa || (temContagemAnterior ? '' : 'Primeira contagem - sem justificativa')
                        });
                    }
                }
            }
        });
        
        if (temErroValidacao) {
            return;
        }
        
        if (materiaisParaEnviar.length === 0 && materiaisParaDesativar.length === 0) {
            mostrarToast('❌ Preencha a quantidade de pelo menos um material ou selecione "Dar baixa" em um item!', 'erro');
            return;
        }
        
        try {
            botaoSubmit.disabled = true;
            botaoSubmit.textContent = 'Enviando...';
            
            let totalProcessados = 0;
            let totalDesativados = 0;
            
            if (materiaisParaDesativar.length > 0) {
                mostrarToast(`⏳ Desativando ${materiaisParaDesativar.length} item(ns)...`, 'info');
                
                for (const item of materiaisParaDesativar) {
                    try {
                        const response = await fetch(`${API_URL}/api/desativar`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: item.id,
                                obs: item.obs,
                                tipo_material: item.tipo_material
                            })
                        });
                        
                        const resultado = await response.json();
                        if (response.ok) {
                            totalDesativados++;
                            console.log(`✅ Item ID ${item.id} desativado com sucesso`);
                        } else {
                            console.error(`❌ Erro ao desativar ID ${item.id}:`, resultado);
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao desativar ID ${item.id}:`, error);
                    }
                }
            }
            
            if (materiaisParaEnviar.length > 0) {
                mostrarToast(`⏳ Salvando ${materiaisParaEnviar.length} material(is)...`, 'info');
                
                for (const material of materiaisParaEnviar) {
                    try {
                        const response = await fetch(`${API_URL}/api/salvar`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(material)
                        });
                        
                        if (response.ok) {
                            totalProcessados++;
                            console.log(`✅ ${material.tipo_material} ${material.codigo} salvo com sucesso`);
                        } else {
                            console.error(`❌ Erro ao salvar ${material.codigo}:`, await response.text());
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao salvar ${material.codigo}:`, error);
                    }
                }
            }
            
            let msg = '';
            if (totalProcessados > 0 && totalDesativados > 0) {
                msg = `✅ ${totalProcessados} material(is) registrado(s) e ${totalDesativados} baixa(s) realizada(s) com sucesso!`;
            } else if (totalProcessados > 0) {
                msg = `✅ ${totalProcessados} material(is) registrado(s) com sucesso!`;
            } else if (totalDesativados > 0) {
                msg = `✅ ${totalDesativados} baixa(s) realizada(s) com sucesso!`;
            } else {
                msg = '⚠️ Nenhuma operação foi realizada com sucesso.';
            }
            mostrarToast(msg, 'sucesso');
            
            document.querySelectorAll('.input-qtd').forEach(input => input.value = '');
            document.querySelectorAll('.input-justificativa').forEach(input => input.value = '');
            document.querySelectorAll('.diferenca-indicador').forEach(div => div.style.display = 'none');
            document.querySelectorAll('.checkbox-baixa-trafo, .checkbox-baixa-bobina').forEach(cb => cb.checked = false);
            
            cacheQuantidades = {};
            setTimeout(async () => {
                await carregarTodosRegistros();
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
            
        } catch (error) {
            console.error('❌ Erro:', error);
            mostrarToast('❌ Erro de conexão com o servidor.', 'erro');
            
        } finally {
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = '📝 Registrar Contagem';
        }
    });
    
    // ============================================
    // EXPOR FUNÇÕES GLOBAIS PARA O HTML
    // ============================================
    
    window.ativarAba = ativarAba;
    window.calcularDiferenca = calcularDiferenca;
    window.calcularDiferencaBobina = calcularDiferencaBobina;
    window.calcularDiferencaTrafo = calcularDiferencaTrafo;
    window.calcularDiferencaConcreto = calcularDiferencaConcreto;
    window.buscarQuantidadeAnterior = buscarQuantidadeAnterior;
    window.formatarData = formatarData;
    window.mostrarMensagem = mostrarMensagem;
    window.mostrarToast = mostrarToast;
    window.validarCodigoTrafo = validarCodigoTrafo;
    window.validarCodigoBobina = validarCodigoBobina;
    window.adicionarTrafo = adicionarTrafo;
    window.adicionarBobina = adicionarBobina;
    window.removerTrafo = removerTrafo;
    window.removerBobina = removerBobina;
    window.toggleBaixaTrafo = toggleBaixaTrafo;
    window.toggleBaixaBobina = toggleBaixaBobina;
    window.verificarNObraTrafo = verificarNObraTrafo;
    window.verificarNObraBobina = verificarNObraBobina;
    window.adicionarEntradaConcreto = adicionarEntradaConcreto;
    window.toggleConcretoEntradaFields = toggleConcretoEntradaFields;
    window.removerEntradaConcreto = removerEntradaConcreto;
    window.validarConcretoEntrada = validarConcretoEntrada;
    window.redirecionarParaHome = redirecionarParaHome;
    
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
}