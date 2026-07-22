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
        },
        'lacos': {
            nome: 'Laços',
            icone: '🔄',
            tipo: 'predefinido',
            tipo_material: 'laco',
            codigos: [
                '212', '2953', '4566', '22282', '90330',
                '90687', '90688', '90689', '90694', '90695',
                '90696', '90698', '90699', '90737', '90741',
                '90742', '90745', '90746', '90756', '90757', '90761'
            ]
        },
        'alcas': {
            nome: 'Alças',
            icone: '🔄',
            tipo: 'predefinido',
            tipo_material: 'alca',
            codigos: [
                '90303', '90308', '90310', '90311', '90323',
                '90324', '90557', '90565', '90566', '90683',
                '90685', '90707', '90713', '90715', '90724',
                '90726', '90727'
            ]
        },
        'parafusos': {
            nome: 'Parafusos',
            icone: '🔄',
            tipo: 'predefinido',
            tipo_material: 'parafuso',
            codigos: [
                '90364', '90365', '90366', '90367', '90373',
                '90375', '90376', '90377', '90378', '90379',
                '90380', '90381', '90382', '90383', '90384',
                '90385', '90386'
            ]
        },
        'cabos': {
            nome: 'Cabos',
            icone: '🔄',
            tipo: 'predefinido',
            tipo_material: 'cabo',
            codigos: [
                '42', '90262', '90263', '90272', '90274',
                '90283', '90285', '90287', '90288', '90391',
                '90392', '90624', '90703', '90779', '90836',
                '91095', '91377', '91381', '92113', '604909'
            ]
        },
        'miscelaneas1': {
            nome: 'Miscelâneas 1',
            icone: '📦',
            tipo: 'predefinido',
            tipo_material: 'miscelanea1',
            codigos: [
                '1856', '10246', '10247', '10251', '32295',
                '90110', '90111', '90229', '90244', '90247',
                '90251', '90252', '90253', '90254', '90275',
                '90277', '90280', '90387', '90388', '90404',
                '90409', '90411', '90440', '90444', '90445',
                '90448', '90524', '90568', '90572', '90575',
                '90576', '90582', '90619'
            ]
        },
        'miscelaneas2': {
            nome: 'Miscelâneas 2',
            icone: '📦',
            tipo: 'predefinido',
            tipo_material: 'miscelanea2',
            codigos: [
                '10064', '30204', '35795', '62119', '90213',
                '90215', '90389', '90399', '90442', '90458',
                '90462', '90463', '90514', '90516', '90518',
                '90522', '90545', '90548', '90561', '90584',
                '90839', '90862', '90887', '90888', '91003',
                '92161', '92325'
            ]
        },
        'medidores': {
            nome: 'Medidores',
            icone: '📏',
            tipo: 'predefinido',
            tipo_material: 'medidor',
            codigos: [
                '3225', '42821', '42825', '42826', '42840'
            ]
        },
        'miscelaneas': {
            nome: 'Miscelâneas (Antigo)',
            icone: '📦',
            tipo: 'predefinido',
            tipo_material: 'miscelanea',
            codigos: [
                '90395', '90013', '90306', '90307', '90701',
                '90487', '90551', '90547', '90479', '90480',
                '90481', '90341', '90342', '90343', '90501',
                '91119', '90522', '90423', '90208',
                '90210', '90497', '90498', '90499', '90500',
                '90641', '90643', '90645', '90510', '90639',
                '90640', '90567', '90488', '90414', '90415'
            ],
            validacao: null
        },
        'especificos': {
            nome: 'Específicos',
            icone: '🎯',
            tipo: 'predefinido',
            tipo_material: 'especifico',
            codigos: [
                '690916', '690917', '690001', '690403', 
                '690312', '616033', '617640', '618660','602826'
            ],
            validacao: null
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
    let itemsRegistrados = new Set();
    let enviandoDados = false;
    let baixaPendente = null;
    
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
    // FUNÇÃO PARA TRAVAR ITEM APÓS REGISTRO
    // ============================================
    
    function travarItemAposRegistro(itemElement, tipoMaterial) {
        if (!itemElement) return;
        
        const categoriasNaoTravadas = ['concreto', 'miscelanea', 'especifico', 'laco', 'alca', 'parafuso', 'cabo', 'miscelanea1', 'miscelanea2', 'medidor'];
        
        if (categoriasNaoTravadas.includes(tipoMaterial)) {
            console.log(`ℹ️ ${tipoMaterial} não é travado após registro (permite múltiplas contagens)`);
            return;
        }
        
        const qtdInput = itemElement.querySelector('.input-qtd');
        if (qtdInput) {
            qtdInput.setAttribute('readonly', 'readonly');
            qtdInput.classList.add('input-locked');
            qtdInput.style.backgroundColor = '#edf2f7';
            qtdInput.style.cursor = 'not-allowed';
        }
        
        const justificativaInput = itemElement.querySelector('.input-justificativa');
        if (justificativaInput) {
            justificativaInput.style.backgroundColor = '#ffffff';
            justificativaInput.style.cursor = 'text';
            justificativaInput.placeholder = 'Digite o Nº da obra para dar baixa...';
        }
        
        const extraInputs = itemElement.querySelectorAll('.input-extra');
        extraInputs.forEach(input => {
            if (!input.classList.contains('input-locked')) {
                input.setAttribute('readonly', 'readonly');
                input.classList.add('input-locked');
                input.style.backgroundColor = '#edf2f7';
                input.style.cursor = 'not-allowed';
            }
        });
        
        const selects = itemElement.querySelectorAll('select');
        selects.forEach(select => {
            select.setAttribute('disabled', 'disabled');
            select.classList.add('input-locked');
            select.style.backgroundColor = '#edf2f7';
            select.style.cursor = 'not-allowed';
        });
        
        const btnBaixa = itemElement.querySelector('.btn-dar-baixa');
        if (btnBaixa) {
            btnBaixa.disabled = true;
            btnBaixa.style.opacity = '0.5';
            btnBaixa.style.cursor = 'not-allowed';
            btnBaixa.textContent = '✅ Baixa realizada';
        }
        
        itemElement.classList.add('item-registrado');
        itemElement.style.borderColor = '#48BB78';
        itemElement.style.borderWidth = '2px';
        itemElement.style.borderStyle = 'solid';
        
        const header = itemElement.querySelector('.material-header');
        if (header && !header.querySelector('.badge-registrado')) {
            const badge = document.createElement('span');
            badge.className = 'badge-registrado';
            badge.innerHTML = '✅ Registrado';
            badge.style.cssText = `
                background: #48BB78;
                color: white;
                padding: 2px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                margin-left: 10px;
            `;
            header.appendChild(badge);
        }
        
        const btnRemover = itemElement.querySelector('.btn-remover-trafo-x');
        if (btnRemover) {
            btnRemover.style.display = 'none';
        }
        
        if (qtdInput) {
            itemElement.dataset.qtdAnterior = qtdInput.value || '0';
        }
        
        const id = itemElement.dataset.id || itemElement.dataset.codigo;
        if (id) {
            itemsRegistrados.add(id);
        }
    }
    
    // ============================================
    // FUNÇÃO PARA ABRIR MODAL DE CONFIRMAÇÃO DE BAIXA
    // ============================================
    
    function abrirModalBaixa(tipo, index, tipoMaterial) {
        const codigoInput = document.getElementById(`${tipo}-codigo-${index}`);
        const descricaoInput = document.getElementById(`${tipo}-descricao-${index}`);
        const tombamentoInput = document.getElementById(`${tipo}-tombamento-${index}`);
        const item = document.querySelector(`.${tipoMaterial}-item[data-index="${index}"]`);
        const idRegistro = item ? item.dataset.id : null;
        
        if (!idRegistro || idRegistro === 'null' || idRegistro === '') {
            mostrarToast('❌ Este item ainda não foi registrado no banco de dados.', 'erro');
            return;
        }
        
        const codigo = codigoInput ? codigoInput.value : '';
        const descricao = descricaoInput ? descricaoInput.value : '';
        const tombamento = tombamentoInput ? tombamentoInput.value : '';
        
        const modal = document.getElementById('modal-baixa');
        const modalIcon = document.getElementById('modal-icon');
        const modalTitle = document.getElementById('modal-title');
        const modalCodigo = document.getElementById('modal-codigo');
        const modalDescricao = document.getElementById('modal-descricao');
        const modalTombamento = document.getElementById('modal-tombamento');
        const modalTombamentoRow = document.getElementById('modal-tombamento-row');
        const modalInput = document.getElementById('modal-n-obra');
        const modalConfirmar = document.getElementById('modal-confirmar');
        const modalCancelar = document.getElementById('modal-cancelar');
        const modalError = document.getElementById('modal-error');
        
        // Configurar ícone e título
        if (tipoMaterial === 'trafo') {
            modalIcon.textContent = '⚡';
            modalTitle.textContent = 'Dar Baixa no Trafo';
        } else {
            modalIcon.textContent = '🧵';
            modalTitle.textContent = 'Dar Baixa na Bobina';
        }
        
        // Preencher informações
        modalCodigo.textContent = codigo || '-';
        modalDescricao.textContent = descricao || '-';
        
        if (tombamento) {
            modalTombamento.textContent = tombamento;
            modalTombamentoRow.style.display = 'block';
        } else {
            modalTombamentoRow.style.display = 'none';
        }
        
        // Resetar campos
        modalInput.value = '';
        modalInput.classList.remove('input-error');
        modalError.classList.remove('show');
        modalError.style.display = 'none';
        modalConfirmar.disabled = false;
        modalConfirmar.textContent = '✅ Confirmar Baixa';
        
        // Guardar dados pendentes
        baixaPendente = {
            tipo: tipo,
            index: index,
            tipoMaterial: tipoMaterial,
            id: idRegistro,
            codigo: codigo,
            descricao: descricao
        };
        
        // Abrir modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focar no input após animação
        setTimeout(() => {
            modalInput.focus();
        }, 300);
        
        // Eventos
        modalConfirmar.onclick = function() {
            confirmarBaixa();
        };
        
        modalCancelar.onclick = function() {
            fecharModalBaixa();
        };
        
        modalInput.onkeydown = function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmarBaixa();
            }
            if (e.key === 'Escape') {
                fecharModalBaixa();
            }
        };
        
        modal.onclick = function(e) {
            if (e.target === modal) {
                fecharModalBaixa();
            }
        };
    }
    
    // ============================================
    // FUNÇÃO PARA CONFIRMAR BAIXA
    // ============================================
    
    function confirmarBaixa() {
        const modalInput = document.getElementById('modal-n-obra');
        const modalError = document.getElementById('modal-error');
        const modalConfirmar = document.getElementById('modal-confirmar');
        
        const nObra = modalInput.value.trim();
        
        // Validar Nº da Obra
        if (!nObra) {
            modalInput.classList.add('input-error');
            modalError.textContent = '⚠️ O Nº da Obra é obrigatório para dar baixa.';
            modalError.classList.add('show');
            modalError.style.display = 'block';
            modalInput.focus();
            return;
        }
        
        if (nObra.length < 2) {
            modalInput.classList.add('input-error');
            modalError.textContent = '⚠️ Digite um Nº de obra válido (mínimo 2 caracteres).';
            modalError.classList.add('show');
            modalError.style.display = 'block';
            modalInput.focus();
            return;
        }
        
        // Desabilitar botão
        modalConfirmar.disabled = true;
        modalConfirmar.textContent = '⏳ Processando...';
        
        if (!baixaPendente) {
            mostrarToast('❌ Erro: dados pendentes não encontrados.', 'erro');
            fecharModalBaixa();
            return;
        }
        
        executarBaixa(baixaPendente.id, nObra, baixaPendente.tipoMaterial, baixaPendente.tipo, baixaPendente.index);
    }
    
    // ============================================
    // FUNÇÃO PARA FECHAR MODAL DE BAIXA
    // ============================================
    
    function fecharModalBaixa() {
        const modal = document.getElementById('modal-baixa');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Resetar campos
        const modalInput = document.getElementById('modal-n-obra');
        const modalError = document.getElementById('modal-error');
        const modalConfirmar = document.getElementById('modal-confirmar');
        
        modalInput.value = '';
        modalInput.classList.remove('input-error');
        modalError.classList.remove('show');
        modalError.style.display = 'none';
        modalConfirmar.disabled = false;
        modalConfirmar.textContent = '✅ Confirmar Baixa';
        
        baixaPendente = null;
    }
    
    // ============================================
    // FUNÇÃO PARA EXECUTAR BAIXA
    // ============================================
    
    async function executarBaixa(id, nObra, tipoMaterial, tipo, index) {
        try {
            console.log(`🔴 Executando baixa: ID ${id}, Obra: ${nObra}, Tipo: ${tipoMaterial}`);
            
            const response = await fetch(`${API_URL}/api/desativar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: parseInt(id),
                    obs: `Baixa para obra: ${nObra}`,
                    tipo_material: tipoMaterial
                })
            });
            
            const resultado = await response.json();
            console.log('📥 Resposta da baixa:', resultado);
            
            if (response.ok && resultado.success) {
                mostrarToast(`✅ Baixa realizada com sucesso! Obra: ${nObra}`, 'sucesso');
                
                const item = document.querySelector(`.${tipoMaterial}-item[data-index="${index}"]`);
                if (item) {
                    // Marcar como baixado
                    item.dataset.jaRegistrado = 'true';
                    item.classList.add('item-registrado', 'item-baixado');
                    item.style.borderColor = '#E53E3E';
                    item.style.borderWidth = '2px';
                    item.style.borderStyle = 'solid';
                    item.style.background = '#FFF5F5';
                    
                    // Atualizar badge
                    const header = item.querySelector('.material-header');
                    if (header) {
                        const oldBadge = header.querySelector('.badge-registrado');
                        if (oldBadge) oldBadge.remove();
                        
                        const badge = document.createElement('span');
                        badge.className = 'badge-registrado baixado';
                        badge.innerHTML = '🔴 Baixado';
                        badge.style.cssText = `
                            background: #E53E3E;
                            color: white;
                            padding: 2px 10px;
                            border-radius: 12px;
                            font-size: 11px;
                            font-weight: 600;
                            margin-left: 10px;
                        `;
                        header.appendChild(badge);
                    }
                    
                    // Bloquear campos
                    const qtdInput = item.querySelector('.input-qtd');
                    if (qtdInput) {
                        qtdInput.value = '0';
                        qtdInput.setAttribute('readonly', 'readonly');
                        qtdInput.classList.add('input-locked');
                        qtdInput.style.backgroundColor = '#edf2f7';
                        qtdInput.style.cursor = 'not-allowed';
                    }
                    
                    const btnBaixa = item.querySelector('.btn-dar-baixa');
                    if (btnBaixa) {
                        btnBaixa.disabled = true;
                        btnBaixa.classList.add('baixado');
                        btnBaixa.textContent = '🔴 Baixado';
                    }
                    
                    const justificativaInput = item.querySelector('.input-justificativa');
                    if (justificativaInput) {
                        justificativaInput.value = `Baixa para obra: ${nObra}`;
                        justificativaInput.setAttribute('readonly', 'readonly');
                        justificativaInput.style.backgroundColor = '#edf2f7';
                        justificativaInput.style.cursor = 'not-allowed';
                    }
                    
                    const btnRemover = item.querySelector('.btn-remover-trafo-x');
                    if (btnRemover) {
                        btnRemover.style.display = 'none';
                    }
                    
                    const extraInputs = item.querySelectorAll('.input-extra');
                    extraInputs.forEach(input => {
                        input.setAttribute('readonly', 'readonly');
                        input.classList.add('input-locked');
                        input.style.backgroundColor = '#edf2f7';
                        input.style.cursor = 'not-allowed';
                    });
                    
                    const selects = item.querySelectorAll('select');
                    selects.forEach(select => {
                        select.setAttribute('disabled', 'disabled');
                        select.classList.add('input-locked');
                        select.style.backgroundColor = '#edf2f7';
                        select.style.cursor = 'not-allowed';
                    });
                }
                
                fecharModalBaixa();
                
                cacheQuantidades = {};
                await carregarTodosRegistros();
                await carregarItensManuais();
                
            } else {
                mostrarToast(`❌ Erro ao dar baixa: ${resultado.error || 'Erro desconhecido'}`, 'erro');
                document.getElementById('modal-confirmar').disabled = false;
                document.getElementById('modal-confirmar').textContent = '✅ Confirmar Baixa';
            }
            
        } catch (error) {
            console.error('❌ Erro ao executar baixa:', error);
            mostrarToast('❌ Erro de conexão ao dar baixa.', 'erro');
            document.getElementById('modal-confirmar').disabled = false;
            document.getElementById('modal-confirmar').textContent = '✅ Confirmar Baixa';
        }
    }
    
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
        const categoriasRotativas = ['lacos', 'alcas', 'parafusos', 'cabos', 'miscelaneas1', 'miscelaneas2', 'medidores'];
        
        if (categoria === 'miscelaneas' || categoria === 'especificos' || categoriasRotativas.includes(categoria)) {
            return { valido: true };
        }
        
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
    // CARREGAR TODOS OS REGISTROS DO BANCO
    // ============================================
    
    async function carregarTodosRegistros() {
        try {
            console.log('🔄 Carregando registros do banco...');
            const response = await fetch(`${API_URL}/api/dados`);
            const resultados = await response.json();
            
            todosRegistrosDB = resultados.filter(r => r.ativo === 1 || r.ativo === true);
            
            console.log('📊 Total de registros no banco:', resultados.length);
            console.log('📊 Registros ativos:', todosRegistrosDB.length);
            
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
    // CARREGAR ITENS MANUAIS DO BANCO
    // ============================================
    
    async function carregarItensManuais() {
        try {
            if (!registrosCarregados || todosRegistrosDB.length === 0) {
                console.log('🔄 Recarregando registros...');
                await carregarTodosRegistros();
            }
            
            const resultados = todosRegistrosDB;
            
            codigosExistentesDB = new Set();
            const trafosList = [];
            const bobinasList = [];
            
            resultados.forEach(item => {
                const isAtivo = item.ativo === 1 || item.ativo === true;
                const tipoMaterial = item.tipo_material || '';
                
                if ((tipoMaterial === 'trafo' || (item.numero_serie || item.oleo || item.cor)) && isAtivo) {
                    codigosExistentesDB.add(item.codigo);
                    
                    trafosList.push({
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
                        _qtd: item.qtd || '',
                        _n_obra: item.obs || '',
                        _data: item.data || '',
                        _created_at: item.created_at || '',
                        _jaRegistrado: true
                    });
                }
                else if (tipoMaterial === 'bobina' || 
                        (item.descricao && item.descricao.toUpperCase().startsWith('CABO') && 
                         !item.numero_serie && !item.oleo && !item.cor)) {
                    if (isAtivo) {
                        codigosExistentesDB.add(item.codigo);
                        
                        bobinasList.push({
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
                            _qtd: item.qtd || '',
                            _n_obra: item.obs || '',
                            _data: item.data || '',
                            _created_at: item.created_at || '',
                            _jaRegistrado: true
                        });
                    }
                }
            });
            
            materiaisManuais = trafosList;
            bobinasManuais = bobinasList;
            
            materiaisPorCategoria['trafos'] = materiaisManuais;
            materiaisPorCategoria['bobinas'] = bobinasManuais;
            
            console.log('⚡ ' + materiaisManuais.length + ' trafos ativos carregados');
            console.log('🧵 ' + bobinasManuais.length + ' bobinas ativas carregadas');
            console.log('📊 Códigos existentes no banco: ' + codigosExistentesDB.size);
            
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
            if (categoria.tipo === 'predefinido' && categoria.codigos && categoria.codigos.length > 0) {
                const materiais = materiaisBanco.filter(material => 
                    categoria.codigos.includes(material.codigo)
                );
                materiais.sort((a, b) => a.codigo.localeCompare(b.codigo));
                materiaisPorCategoria[chave] = materiais;
                console.log(`📦 ${categoria.nome}: ${materiais.length} itens encontrados`);
            }
        }
    }
    
    // ============================================
    // CRIAR SISTEMA DE ABAS
    // ============================================
    
    function criarAbas() {
        const loading = document.getElementById('loading-materiais');
        
        // Configuração das subdivisões e suas categorias
        const subdivisoes = {
            'diaria': {
                nome: 'Contagem Diária',
                icone: '📋',
                categorias: ['concretos', 'trafos', 'bobinas', 'especificos']
            },
            'semanal': {
                nome: 'Contagem Semanal',
                icone: '📅',
                categorias: ['miscelaneas']
            },
            'rotativas': {
                nome: 'Contagens Rotativas',
                icone: '🔄',
                categorias: ['lacos', 'alcas', 'parafusos', 'cabos', 'miscelaneas1', 'miscelaneas2', 'medidores']
            }
        };
        
        for (const [subId, subConfig] of Object.entries(subdivisoes)) {
            const tabsNav = document.getElementById(`tabs-nav-${subId}`);
            const tabsContent = document.getElementById(`tabs-content-${subId}`);
            
            if (!tabsNav || !tabsContent) continue;
            
            let htmlNav = '';
            let htmlContent = '';
            let primeiraCategoria = null;
            
            for (const chave of subConfig.categorias) {
                const categoria = CATEGORIAS[chave];
                if (!categoria) continue;
                
                const materiais = materiaisPorCategoria[chave] || [];
                
                if (!primeiraCategoria) {
                    primeiraCategoria = chave;
                }
                
                let contador = materiais.length;
                if (chave === 'trafos') {
                    contador = materiais.filter(t => t.ativo !== false && t.tipo_material === 'trafo').length;
                } else if (chave === 'bobinas') {
                    contador = materiais.filter(b => b.ativo !== false && b.tipo_material === 'bobina').length;
                }
                
                htmlNav += `
                    <button type="button" class="tab-btn" data-categoria="${chave}" data-subdivisao="${subId}" onclick="ativarAbaSubdivisao('${subId}', '${chave}')">
                        <span class="tab-icone">${categoria.icone}</span>
                        ${categoria.nome}
                        <span class="tab-contador">${contador}</span>
                    </button>
                `;
                
                htmlContent += `
                    <div class="tab-content" id="tab-${subId}-${chave}">
                        ${chave === 'trafos' ? renderizarTrafos(materiais) : 
                          chave === 'bobinas' ? renderizarBobinas(materiais) : 
                          chave === 'concretos' ? renderizarConcretos(materiais, chave) :
                          chave === 'miscelaneas' ? renderizarMiscelaneas(materiais) :
                          chave === 'especificos' ? renderizarEspecificos(materiais) :
                          renderizarCategoriaRotativa(materiais, chave)}
                    </div>
                `;
            }
            
            tabsNav.innerHTML = htmlNav;
            tabsContent.innerHTML = htmlContent;
            
            if (primeiraCategoria) {
                ativarAbaSubdivisao(subId, primeiraCategoria);
            }
        }
        
        loading.style.display = 'none';
        ativarTipoContagem('diaria');
    }
    
    // ============================================
    // ATIVAR TIPO DE CONTAGEM
    // ============================================
    
    function ativarTipoContagem(tipo) {
        document.querySelectorAll('.tab-principal-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tipo === tipo) {
                btn.classList.add('active');
            }
        });
        
        document.querySelectorAll('.tab-principal-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const contentAtivo = document.getElementById(`tab-principal-${tipo}`);
        if (contentAtivo) {
            contentAtivo.classList.add('active');
        }
        
        const tituloMap = {
            'diaria': '📋 Contagem Diária',
            'semanal': '📅 Contagem Semanal',
            'rotativas': '🔄 Contagens Rotativas'
        };
        
        const titleElement = document.querySelector('.title');
        if (titleElement) {
            titleElement.textContent = `SICGM - ${tituloMap[tipo] || 'Contagem'}`;
        }
        
        setTimeout(() => {
            if (typeof aplicarFiltro === 'function') {
                aplicarFiltro();
            }
        }, 100);
    }
    
    // ============================================
    // ATIVAR ABA DENTRO DE UMA SUBDIVISÃO
    // ============================================
    
    function ativarAbaSubdivisao(subdivisao, categoria) {
        const btnSelector = `.tab-btn[data-subdivisao="${subdivisao}"]`;
        document.querySelectorAll(btnSelector).forEach(btn => btn.classList.remove('active'));
        
        const contentSelector = `#tabs-content-${subdivisao} .tab-content`;
        document.querySelectorAll(contentSelector).forEach(content => content.classList.remove('active'));
        
        const btnAtivo = document.querySelector(`.tab-btn[data-categoria="${categoria}"][data-subdivisao="${subdivisao}"]`);
        const contentAtivo = document.getElementById(`tab-${subdivisao}-${categoria}`);
        
        if (btnAtivo) btnAtivo.classList.add('active');
        if (contentAtivo) contentAtivo.classList.add('active');
        
        categoriaAtiva = categoria;
        
        setTimeout(() => {
            if (typeof aplicarFiltro === 'function') {
                aplicarFiltro();
            }
        }, 100);
    }
    
    // ============================================
    // FUNÇÕES DE RENDERIZAÇÃO - CATEGORIAS ROTATIVAS
    // ============================================
    
    function renderizarCategoriaRotativa(materiais, chave) {
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">📭</p>
                <p>Nenhum material configurado nesta categoria</p>
            </div>`;
        }
        
        const categoriaConfig = CATEGORIAS[chave];
        const tipoMaterial = categoriaConfig?.tipo_material || chave;
        
        let html = '';
        
        materiais.forEach((material, index) => {
            const idUnico = `${chave}-${index}`;
            
            html += `
                <div class="material-item ${chave}-item" 
                     data-codigo="${material.codigo}" 
                     data-categoria="${chave}" 
                     data-tipo="${tipoMaterial}" 
                     data-index="${index}" 
                     data-tombamento=""
                     data-ja-registrado="false">
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
                                class="input-qtd" 
                                onchange="calcularDiferencaRotativa('${idUnico}', '${material.codigo}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
                            <label for="justificativa-${idUnico}">Justificativa (opcional)</label>
                            <input type="text" id="justificativa-${idUnico}" placeholder="Justificativa (opcional)..." 
                                class="input-justificativa">
                        </div>
                    </div>
                </div>
            `;
        });
        
        setTimeout(() => {
            materiais.forEach((material, index) => {
                buscarQuantidadeAnterior(material.codigo, `${chave}-${index}`, null, tipoMaterial);
            });
        }, 100);
        
        return html;
    }
    
    function calcularDiferencaRotativa(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    // ============================================
    // RENDERIZAR CONCRETOS
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
                <div class="material-item concreto-item" 
                     data-codigo="${material.codigo}" 
                     data-categoria="${categoria}" 
                     data-tipo="${tipoMaterial}" 
                     data-index="${index}" 
                     data-tombamento=""
                     data-ja-registrado="false">
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
                                class="input-qtd" 
                                onchange="calcularDiferencaConcreto('${idUnico}', '${material.codigo}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
    // FUNÇÕES DE ENTRADAS DE CONCRETO
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
        
        const qtdPrincipal = document.getElementById(`qtd-${idUnico}`);
        if (qtdPrincipal && qtdPrincipal.value !== '' && qtdPrincipal.value !== null) {
            atualizarTotalConcreto(idUnico);
        }
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
            const qtdPrincipal = document.getElementById(`qtd-${idUnico}`);
            if (qtdPrincipal && qtdPrincipal.value !== '' && qtdPrincipal.value !== null) {
                atualizarTotalConcreto(idUnico);
            } else {
                const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
                if (diferencaDiv) {
                    diferencaDiv.style.display = 'none';
                }
            }
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
        
        const qtdPrincipal = document.getElementById(`qtd-${idUnico}`);
        if (qtdPrincipal && qtdPrincipal.value !== '' && qtdPrincipal.value !== null) {
            atualizarTotalConcreto(idUnico);
        } else {
            const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
            if (diferencaDiv) {
                diferencaDiv.style.display = 'none';
            }
        }
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
        
        const qtdInput = document.getElementById(`qtd-${idUnico}`);
        if (!qtdInput || qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) {
            const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
            if (diferencaDiv) {
                diferencaDiv.style.display = 'none';
            }
            return;
        }
        
        const qtdAtual = parseFloat(qtdInput.value) || 0;
        const qtdAnterior = parseFloat(document.getElementById(`qtd-anterior-${idUnico}`)?.value) || 0;
        const diferenca = qtdAtual - qtdAnterior;
        
        const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
        if (!diferencaDiv) return;
        
        const materialItem = document.querySelector(`.concreto-item[data-index="${idUnico.split('-')[1]}"]`);
        const temContagemAnterior = materialItem?.dataset?.temContagemAnterior === 'true';
        
        if (!temContagemAnterior && qtdAnterior === 0 && qtdAtual === 0) {
            diferencaDiv.style.display = 'none';
            return;
        }
        
        if (!temContagemAnterior && qtdAnterior === 0 && qtdAtual > 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-ok';
            diferencaDiv.innerHTML = `✅ Primeira contagem - Total das entradas: ${total.toFixed(2)}`;
            return;
        }
        
        if (temContagemAnterior && total === 0 && diferenca === 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-igual';
            diferencaDiv.innerHTML = '✓ Sem alteração';
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
    
    function calcularDiferencaConcreto(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
        setTimeout(() => {
            atualizarTotalConcreto(idUnico);
        }, 100);
    }
    
    // ============================================
    // RENDERIZAR MISCELÂNEAS
    // ============================================

    function renderizarMiscelaneas(materiais) {
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">📦</p>
                <p>Nenhum material miscelânea encontrado</p>
            </div>`;
        }
        
        let html = '';
        const tipoMaterial = 'miscelanea';
        
        materiais.forEach((material, index) => {
            const idUnico = `miscelaneas-${index}`;
            
            html += `
                <div class="material-item miscelanea-item" 
                     data-codigo="${material.codigo}" 
                     data-categoria="miscelaneas" 
                     data-tipo="${tipoMaterial}" 
                     data-index="${index}" 
                     data-tombamento=""
                     data-ja-registrado="false">
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
                                class="input-qtd" 
                                onchange="calcularDiferencaMiscelanea('${idUnico}', '${material.codigo}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
                            <label>Entradas de Miscelânea</label>
                            <button type="button" class="btn-add-concreto-entrada" onclick="adicionarEntradaMiscelanea('${idUnico}')">
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
                buscarQuantidadeAnterior(material.codigo, `miscelaneas-${index}`, null, 'miscelanea');
                const idUnico = `miscelaneas-${index}`;
                adicionarEntradaMiscelanea(idUnico);
            });
        }, 100);
        
        return html;
    }
    
    // ============================================
    // RENDERIZAR ESPECÍFICOS
    // ============================================

    function renderizarEspecificos(materiais) {
        if (materiais.length === 0) {
            return `<div style="text-align: center; padding: 30px; color: #A0AEC0;">
                <p style="font-size: 2em;">🎯</p>
                <p>Nenhum material específico encontrado</p>
            </div>`;
        }
        
        let html = '';
        const tipoMaterial = 'especifico';
        
        materiais.forEach((material, index) => {
            const idUnico = `especificos-${index}`;
            
            html += `
                <div class="material-item especifico-item" 
                     data-codigo="${material.codigo}" 
                     data-categoria="especificos" 
                     data-tipo="${tipoMaterial}" 
                     data-index="${index}" 
                     data-tombamento=""
                     data-ja-registrado="false">
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
                                class="input-qtd" 
                                onchange="calcularDiferencaEspecifico('${idUnico}', '${material.codigo}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
                            <label>Entradas de Específicos</label>
                            <button type="button" class="btn-add-concreto-entrada" onclick="adicionarEntradaEspecifico('${idUnico}')">
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
                buscarQuantidadeAnterior(material.codigo, `especificos-${index}`, null, 'especifico');
                const idUnico = `especificos-${index}`;
                adicionarEntradaEspecifico(idUnico);
            });
        }, 100);
        
        return html;
    }
    
    // ============================================
    // FUNÇÕES PARA MISCELÂNEAS E ESPECÍFICOS
    // ============================================

    function adicionarEntradaMiscelanea(idUnico) {
        const listDiv = document.getElementById(`concreto-entradas-list-${idUnico}`);
        if (!listDiv) return;
        
        const entradaId = `entrada-misc-${idUnico}-${Date.now()}`;
        
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
        
        const qtdPrincipal = document.getElementById(`qtd-${idUnico}`);
        if (qtdPrincipal && qtdPrincipal.value !== '' && qtdPrincipal.value !== null) {
            atualizarTotalConcreto(idUnico);
        }
    }

    function calcularDiferencaMiscelanea(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
        setTimeout(() => {
            atualizarTotalConcreto(idUnico);
        }, 100);
    }

    function adicionarEntradaEspecifico(idUnico) {
        const listDiv = document.getElementById(`concreto-entradas-list-${idUnico}`);
        if (!listDiv) return;
        
        const entradaId = `entrada-esp-${idUnico}-${Date.now()}`;
        
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
        
        const qtdPrincipal = document.getElementById(`qtd-${idUnico}`);
        if (qtdPrincipal && qtdPrincipal.value !== '' && qtdPrincipal.value !== null) {
            atualizarTotalConcreto(idUnico);
        }
    }

    function calcularDiferencaEspecifico(idUnico, codigo) {
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
            const jaRegistrado = material._jaRegistrado || false;
            
            const estaBaixado = jaRegistrado && material.ativo === false;
            
            const lockedClass = (existeNoBanco || jaRegistrado) ? 'input-locked' : '';
            const itemBloqueado = (existeNoBanco || jaRegistrado) ? 'material-bloqueado' : '';
            const readonlyAttr = (existeNoBanco || jaRegistrado) ? 'readonly' : '';
            const disabledAttr = (existeNoBanco || jaRegistrado) ? 'disabled' : '';
            
            const botaoBaixaDesabilitado = estaBaixado;
            
            html += `
                <div class="material-item bobina-item ${itemBloqueado} ${jaRegistrado ? 'item-registrado' : ''} ${estaBaixado ? 'item-baixado' : ''}" 
                     data-codigo="${codigoBobina}" 
                     data-categoria="bobinas" 
                     data-tipo="bobina" 
                     data-id="${idRegistro}" 
                     data-tombamento="${material.tombamento || ''}"
                     data-index="${idx}"
                     data-ja-registrado="${jaRegistrado}"
                     data-ativo="${material.ativo !== false ? '1' : '0'}">
                    <div class="material-header">
                        <span class="material-number">Bobina #${idx + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <button type="button" 
                                class="btn-dar-baixa" 
                                onclick="abrirModalBaixa('bobina', ${idx}, 'bobina')"
                                ${botaoBaixaDesabilitado ? 'disabled' : ''}
                                ${estaBaixado ? 'style="opacity:0.5;cursor:not-allowed;"' : ''}>
                                ${estaBaixado ? '🔴 Baixado' : '🔴 Dar baixa'}
                            </button>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${idx}"
                                onclick="removerBobina(${idx})"
                                title="Remover esta bobina">
                                ✕
                            </button>
                            `}
                            ${jaRegistrado ? `<span class="badge-registrado ${estaBaixado ? 'baixado' : ''}">${estaBaixado ? '🔴 Baixado' : '✅ Registrado'}</span>` : ''}
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
                                ${readonlyAttr} required>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label>QTD *</label>
                            <input type="number" id="qtd-${idUnico}" step="0.01" min="0" placeholder="0.00" 
                                class="input-qtd ${lockedClass}" value="${qtdSalva}" 
                                ${readonlyAttr}
                                onchange="calcularDiferencaBobina('${idUnico}', '${codigoBobina}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
                                placeholder="Digite o Nº da obra para dar baixa..." 
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
            const jaRegistrado = material._jaRegistrado || false;
            
            const estaBaixado = jaRegistrado && material.ativo === false;
            
            const lockedClass = (existeNoBanco || jaRegistrado) ? 'input-locked' : '';
            const itemBloqueado = (existeNoBanco || jaRegistrado) ? 'material-bloqueado' : '';
            const readonlyAttr = (existeNoBanco || jaRegistrado) ? 'readonly' : '';
            const disabledAttr = (existeNoBanco || jaRegistrado) ? 'disabled' : '';
            
            const botaoBaixaDesabilitado = estaBaixado;
            
            html += `
                <div class="material-item trafo-item ${itemBloqueado} ${jaRegistrado ? 'item-registrado' : ''} ${estaBaixado ? 'item-baixado' : ''}" 
                     data-codigo="${codigoTrafo}" 
                     data-categoria="trafos" 
                     data-tipo="trafo" 
                     data-id="${idRegistro}" 
                     data-tombamento="${material.tombamento || ''}"
                     data-index="${idx}"
                     data-ja-registrado="${jaRegistrado}"
                     data-ativo="${material.ativo !== false ? '1' : '0'}">
                    <div class="material-header">
                        <span class="material-number">Trafo #${idx + 1}</span>
                        <div class="trafo-header-actions">
                            ${existeNoBanco ? `
                            <button type="button" 
                                class="btn-dar-baixa" 
                                onclick="abrirModalBaixa('trafo', ${idx}, 'trafo')"
                                ${botaoBaixaDesabilitado ? 'disabled' : ''}
                                ${estaBaixado ? 'style="opacity:0.5;cursor:not-allowed;"' : ''}>
                                ${estaBaixado ? '🔴 Baixado' : '🔴 Dar baixa'}
                            </button>
                            ` : `
                            <button type="button" 
                                class="btn-remover-trafo-x" 
                                data-index="${idx}"
                                onclick="removerTrafo(${idx})"
                                title="Remover este trafo">
                                ✕
                            </button>
                            `}
                            ${jaRegistrado ? `<span class="badge-registrado ${estaBaixado ? 'baixado' : ''}">${estaBaixado ? '🔴 Baixado' : '✅ Registrado'}</span>` : ''}
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
                                ${readonlyAttr} required>
                        </div>
                        <div class="material-field">
                            <label>Tombamento *</label>
                            <input type="text" id="trafo-tombamento-${idx}" value="${material.tombamento || ''}" 
                                placeholder="Tombamento" class="input-extra ${lockedClass}" 
                                ${readonlyAttr} required>
                        </div>
                        <div class="material-field">
                            <label>Óleo *</label>
                            <select id="trafo-oleo-${idx}" class="input-extra ${lockedClass}" 
                                ${disabledAttr} required>
                                <option value="">Selecione...</option>
                                ${OLEOS.map(oleo => `<option value="${oleo}" ${material.oleo === oleo ? 'selected' : ''}>${oleo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="material-field">
                            <label>Cor *</label>
                            <select id="trafo-cor-${idx}" class="input-extra ${lockedClass}" 
                                ${disabledAttr} required>
                                <option value="">Selecione...</option>
                                ${CORES.map(cor => `<option value="${cor}" ${material.cor === cor ? 'selected' : ''}>${cor}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="material-row material-row-qtd">
                        <div class="material-field">
                            <label>QTD *</label>
                            <input type="number" id="qtd-${idUnico}" step="0.01" min="0" placeholder="0.00" 
                                class="input-qtd ${lockedClass}" value="${qtdSalva}" 
                                ${readonlyAttr}
                                onchange="calcularDiferencaTrafo('${idUnico}', '${codigoTrafo}')"
                                onkeyup="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }"
                                onblur="if(this.value === '' || this.value === null) { document.getElementById('diferenca-${idUnico}').style.display = 'none'; }">
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
                                placeholder="Digite o Nº da obra para dar baixa..." 
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
    // FUNÇÕES AUXILIARES
    // ============================================
    
    function verificarNObraBobina(index) {
        const nObraInput = document.getElementById(`n-obra-bobinas-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-bobina-${index}`);
        
        if (nObraInput && nObraInput.value.trim()) {
            if (alertaDiv) alertaDiv.style.display = 'none';
            nObraInput.classList.remove('input-error');
        }
    }
    
    function verificarNObraTrafo(index) {
        const nObraInput = document.getElementById(`n-obra-trafos-${index}`);
        const alertaDiv = document.getElementById(`alerta-baixa-trafo-${index}`);
        
        if (nObraInput && nObraInput.value.trim()) {
            if (alertaDiv) alertaDiv.style.display = 'none';
            nObraInput.classList.remove('input-error');
        }
    }
    
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
    
    function validarTrafoCompleto(index) {
        if (index === undefined || index === null || isNaN(index) || index < 0) {
            console.error('❌ Index inválido em validarTrafoCompleto:', index);
            return false;
        }
        
        const qtdInput = document.getElementById(`qtd-trafos-${index}`);
        
        if (!qtdInput || qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) {
            return true;
        }
        
        const qtd = parseFloat(qtdInput.value);
        
        if (isNaN(qtd)) {
            return false;
        }
        
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
        
        return true;
    }
    
    function validarBobinaCompleta(index) {
        if (index === undefined || index === null || isNaN(index) || index < 0) {
            console.error('❌ Index inválido em validarBobinaCompleta:', index);
            return false;
        }
        
        const qtdInput = document.getElementById(`qtd-bobinas-${index}`);
        
        if (!qtdInput || qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) {
            return true;
        }
        
        const qtd = parseFloat(qtdInput.value);
        
        if (isNaN(qtd)) {
            return false;
        }
        
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
        
        return true;
    }
    
    function calcularDiferencaBobina(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    function calcularDiferencaTrafo(idUnico, codigo) {
        calcularDiferenca(idUnico, codigo);
    }
    
    function calcularDiferenca(idUnico, codigo) {
        const inputQtd = document.getElementById(`qtd-${idUnico}`);
        const inputAnterior = document.getElementById(`qtd-anterior-${idUnico}`);
        const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
        
        if (!inputQtd || !inputAnterior || !diferencaDiv) return;
        
        if (inputQtd.value === '' || inputQtd.value === null || inputQtd.value === undefined) {
            diferencaDiv.style.display = 'none';
            return;
        }
        
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
        
        if (qtdAnterior === 0 && qtdAtual > 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-ok';
            diferencaDiv.innerHTML = `📝 Primeira contagem - QTD: ${qtdAtual.toFixed(2)}`;
        } else if (diferenca === 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-igual';
            diferencaDiv.innerHTML = '✓ Sem alteração';
        } else if (diferenca > 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-positiva';
            diferencaDiv.innerHTML = `▲ +${diferenca.toFixed(2)} a mais`;
        } else if (diferenca < 0) {
            diferencaDiv.style.display = 'flex';
            diferencaDiv.className = 'diferenca-indicador diferenca-negativa';
            diferencaDiv.innerHTML = `▼ ${diferenca.toFixed(2)} a menos`;
        } else {
            diferencaDiv.style.display = 'none';
        }
    }
    
    // ============================================
    // FUNÇÕES PARA ADICIONAR BOBINAS E TRAFOS
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
            id: null,
            _jaRegistrado: false
        };
        
        bobinasManuais.unshift(novaBobina);
        materiaisPorCategoria['bobinas'] = bobinasManuais;
        
        const tabBobinas = document.getElementById('tab-diaria-bobinas');
        if (tabBobinas) {
            tabBobinas.innerHTML = renderizarBobinas(bobinasManuais);
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
            
            const primeiroItem = tabBobinas.querySelector('.bobina-item:first-child');
            if (primeiroItem) {
                primeiroItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = primeiroItem.querySelector('#bobina-codigo-0');
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        }
    }
    
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
            
            const tabBobinas = document.getElementById('tab-diaria-bobinas');
            if (tabBobinas) {
                tabBobinas.innerHTML = renderizarBobinas(bobinasManuais);
            }
            atualizarContadorBobinas();
            
            mostrarToast('✅ Bobina removida com sucesso!', 'sucesso');
        }
    }
    
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
            id: null,
            _jaRegistrado: false
        };
        
        materiaisManuais.unshift(novoTrafo);
        materiaisPorCategoria['trafos'] = materiaisManuais;
        
        const tabTrafos = document.getElementById('tab-diaria-trafos');
        if (tabTrafos) {
            tabTrafos.innerHTML = renderizarTrafos(materiaisManuais);
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
            
            const primeiroItem = tabTrafos.querySelector('.trafo-item:first-child');
            if (primeiroItem) {
                primeiroItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const novoCodigoInput = primeiroItem.querySelector('#trafo-codigo-0');
                if (novoCodigoInput) {
                    setTimeout(() => novoCodigoInput.focus(), 300);
                }
            }
        }
    }
    
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
            
            const tabTrafos = document.getElementById('tab-diaria-trafos');
            if (tabTrafos) {
                tabTrafos.innerHTML = renderizarTrafos(materiaisManuais);
            }
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
        if (tipoMaterial && tipoMaterial !== 'concreto' && tipoMaterial !== 'miscelanea' && tipoMaterial !== 'especifico' && 
            tipoMaterial !== 'laco' && tipoMaterial !== 'alca' && tipoMaterial !== 'parafuso' && 
            tipoMaterial !== 'cabo' && tipoMaterial !== 'miscelanea1' && tipoMaterial !== 'miscelanea2' && 
            tipoMaterial !== 'medidor' && tombamento && tombamento !== '') {
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
            
            if (tipoMaterial && tipoMaterial !== 'concreto' && tipoMaterial !== 'miscelanea' && tipoMaterial !== 'especifico' &&
                tipoMaterial !== 'laco' && tipoMaterial !== 'alca' && tipoMaterial !== 'parafuso' && 
                tipoMaterial !== 'cabo' && tipoMaterial !== 'miscelanea1' && tipoMaterial !== 'miscelanea2' && 
                tipoMaterial !== 'medidor' && tombamento && tombamento !== '') {
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
    // FUNÇÕES DE FILTRO
    // ============================================

    function aplicarFiltro() {
        const texto = document.getElementById('filtro-texto').value.toLowerCase().trim();
        const tipo = document.getElementById('filtro-tipo').value;
        
        const subdivisaoAtiva = document.querySelector('.tab-principal-content.active');
        if (!subdivisaoAtiva) {
            document.getElementById('filtro-contagem').textContent = 'Mostrando 0 itens';
            return;
        }
        
        const items = subdivisaoAtiva.querySelectorAll('.material-item');
        let visiveis = 0;
        
        if (!texto) {
            items.forEach(item => {
                item.classList.remove('filtro-oculto');
                visiveis++;
            });
            document.getElementById('filtro-contagem').textContent = `Mostrando ${visiveis} itens`;
            return;
        }
        
        items.forEach(item => {
            let textoBusca = '';
            const codigo = item.dataset.codigo || '';
            const descricaoInput = item.querySelector('.input-descricao');
            const descricao = descricaoInput ? descricaoInput.value.toLowerCase() : '';
            const tombamento = item.dataset.tombamento || '';
            
            switch(tipo) {
                case 'codigo':
                    textoBusca = codigo.toLowerCase();
                    break;
                case 'descricao':
                    textoBusca = descricao.toLowerCase();
                    break;
                case 'tombamento':
                    textoBusca = tombamento.toLowerCase();
                    break;
                case 'todos':
                default:
                    textoBusca = `${codigo} ${descricao} ${tombamento}`.toLowerCase();
                    break;
            }
            
            if (textoBusca.includes(texto)) {
                item.classList.remove('filtro-oculto');
                visiveis++;
            } else {
                item.classList.add('filtro-oculto');
            }
        });
        
        document.getElementById('filtro-contagem').textContent = `Mostrando ${visiveis} itens`;
    }

    function limparFiltro() {
        document.getElementById('filtro-texto').value = '';
        document.getElementById('filtro-tipo').value = 'todos';
        aplicarFiltro();
        document.getElementById('filtro-texto').focus();
    }   
    
    // ============================================
    // FUNÇÕES DE NAVEGAÇÃO
    // ============================================

    function irParaTopo() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function irParaFim() {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }

    function controlarBotoesNavegacao() {
        const btnTopo = document.getElementById('btnTopo');
        const btnFim = document.getElementById('btnFim');
        
        if (!btnTopo || !btnFim) return;
        
        const scrollY = window.scrollY;
        const alturaTotal = document.body.scrollHeight;
        const alturaVisivel = window.innerHeight;
        
        if (scrollY > 200) {
            btnTopo.classList.add('visivel');
        } else {
            btnTopo.classList.remove('visivel');
        }
        
        if (scrollY + alturaVisivel < alturaTotal - 100) {
            btnFim.classList.add('visivel');
        } else {
            btnFim.classList.remove('visivel');
        }
    }
    
    // ============================================
    // FUNÇÕES AUXILIARES DE VALIDAÇÃO
    // ============================================
    
    function verificarDuplicata(codigo, tombamento, tipoMaterial) {
        if (!codigo) return false;
        
        const categoriasRotativas = ['laco', 'alca', 'parafuso', 'cabo', 'miscelanea1', 'miscelanea2', 'medidor'];
        const categoriasMultiplas = ['concreto', 'miscelanea', 'especifico'];
        const categoriasSemDuplicata = [...categoriasRotativas, ...categoriasMultiplas];
        
        if (categoriasSemDuplicata.includes(tipoMaterial)) {
            console.log(`✅ ${tipoMaterial} ${codigo} - duplicata PERMITIDA (contagens múltiplas)`);
            return false;
        }
        
        if (!tombamento) {
            console.log(`⚠️ ${tipoMaterial} sem tombamento - não verifica duplicata`);
            return false;
        }
        
        const existe = todosRegistrosDB.some(r => 
            r.codigo === codigo && 
            r.tombamento === tombamento && 
            r.ativo === 1 &&
            r.tipo_material === tipoMaterial
        );
        console.log(`🔍 Verificando duplicata ${tipoMaterial} ${codigo} (${tombamento}): ${existe ? 'EXISTE' : 'NÃO EXISTE'}`);
        return existe;
    }
    
    function itemFoiModificado(inputQtd, item) {
        if (!inputQtd) return false;
        
        const valor = inputQtd.value;
        if (valor === '' || valor === null || valor === undefined || valor.trim() === '') {
            return false;
        }
        
        const qtdAtual = parseFloat(valor);
        if (isNaN(qtdAtual)) return false;
        if (qtdAtual === 0) return false;
        
        const qtdAnteriorInput = item.querySelector('.input-qtd-anterior');
        const qtdAnterior = parseFloat(qtdAnteriorInput?.value) || 0;
        const idRegistro = item.dataset.id || null;
        
        if (item.dataset.jaRegistrado === 'true') return false;
        if (idRegistro && idRegistro !== 'null' && qtdAtual === qtdAnterior) return false;
        if (!idRegistro || idRegistro === 'null') return qtdAtual > 0;
        
        return qtdAtual !== qtdAnterior;
    }
    
    function quantidadeMenorQueAnterior(qtdAtual, qtdAnterior) {
        return qtdAtual < qtdAnterior;
    }
    
    // ============================================
    // ENVIAR FORMULÁRIO
    // ============================================
    
    document.getElementById('contagemForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (enviandoDados) {
            mostrarToast('⏳ Aguarde o envio atual ser concluído...', 'aviso');
            return;
        }
        
        salvarDadosTrafosAtuais();
        salvarDadosBobinasAtuais();
        
        const botaoSubmit = e.target.querySelector('.submit-btn');
        
        const nome = document.getElementById('nome').value;
        const matricula = document.getElementById('matricula').value;
        const data = document.getElementById('data').value;
        
        if (!nome.trim()) {
            mostrarToast('❌ Por favor, preencha o nome!', 'erro');
            return;
        }
        
        // ============================================
        // VALIDAÇÕES
        // ============================================
        
        const trafoItems = document.querySelectorAll('.trafo-item');
        let trafoIncompleto = false;
        trafoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            if (item.dataset.jaRegistrado === 'true') return;
            
            const qtdInput = document.getElementById(`qtd-trafos-${index}`);
            
            if (!qtdInput || qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) {
                return;
            }
            
            const qtd = parseFloat(qtdInput.value);
            if (isNaN(qtd) || qtd === 0) return;
            
            if (!validarTrafoCompleto(index)) {
                trafoIncompleto = true;
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
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
            if (isNaN(index)) return;
            
            if (item.dataset.jaRegistrado === 'true') return;
            
            const qtdInput = document.getElementById(`qtd-bobinas-${index}`);
            
            if (!qtdInput || qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) {
                return;
            }
            
            const qtd = parseFloat(qtdInput.value);
            if (isNaN(qtd) || qtd === 0) return;
            
            if (!validarBobinaCompleta(index)) {
                bobinaIncompleta = true;
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
            }
        });
        
        if (bobinaIncompleta) {
            mostrarToast('❌ Todos os campos das bobinas são obrigatórios!', 'erro');
            return;
        }
        
        const concretoItems = document.querySelectorAll('.concreto-item');
        let concretoInvalido = false;
        concretoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            const idUnico = `concretos-${index}`;
            const diferencaDiv = document.getElementById(`diferenca-${idUnico}`);
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
        
        // ============================================
        // IDENTIFICAR APENAS ITENS MODIFICADOS
        // ============================================
        
        const materiaisParaEnviar = [];
        let temErroValidacao = false;
        let temDuplicata = false;
        let temQuantidadeMenor = false;
        
        // TRAFOS
        trafoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            if (item.dataset.jaRegistrado === 'true') return;
            
            const qtdInput = document.getElementById(`qtd-trafos-${index}`);
            if (!qtdInput) return;
            if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
            
            const qtdAtual = parseFloat(qtdInput.value) || 0;
            if (!itemFoiModificado(qtdInput, item)) {
                console.log(`⏭️ Trafo #${index} não foi modificado - pulando`);
                return;
            }
            if (qtdAtual === 0) return;
            
            const qtdAnteriorInput = item.querySelector('.input-qtd-anterior');
            const qtdAnterior = parseFloat(qtdAnteriorInput?.value) || 0;
            
            if (quantidadeMenorQueAnterior(qtdAtual, qtdAnterior)) {
                temQuantidadeMenor = true;
                mostrarToast(`⚠️ Trafo #${index + 1}: Quantidade (${qtdAtual}) é menor que a contagem anterior (${qtdAnterior}). Confirme se deseja continuar.`, 'aviso');
                item.style.borderColor = '#ED8936';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
                return;
            }
            
            const codigoTrafo = document.getElementById(`trafo-codigo-${index}`)?.value || '';
            const tombamentoTrafo = document.getElementById(`trafo-tombamento-${index}`)?.value || '';
            
            if (verificarDuplicata(codigoTrafo, tombamentoTrafo, 'trafo')) {
                temDuplicata = true;
                mostrarToast(`❌ Trafo #${index + 1} (${codigoTrafo} - ${tombamentoTrafo}) já está registrado no banco!`, 'erro');
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '3px';
                item.style.borderStyle = 'solid';
                return;
            }
            
            const descricaoTrafo = document.getElementById(`trafo-descricao-${index}`)?.value || '';
            const undTrafo = document.getElementById(`trafo-und-${index}`)?.value || '';
            const serie = document.getElementById(`trafo-serie-${index}`)?.value || '';
            const oleo = document.getElementById(`trafo-oleo-${index}`)?.value || '';
            const cor = document.getElementById(`trafo-cor-${index}`)?.value || '';
            const nObra = document.getElementById(`n-obra-trafos-${index}`)?.value || '';
            
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
            
            item.style.borderColor = '';
            item.style.borderWidth = '';
            item.style.borderStyle = '';
            
            materiaisParaEnviar.push({
                nome, matricula, data,
                codigo: codigoTrafo,
                descricao: descricaoTrafo,
                und: undTrafo,
                qtd: qtdAtual,
                numero_serie: serie,
                tombamento: tombamentoTrafo,
                oleo: oleo,
                cor: cor,
                n_obra: nObra || `Contagem diária - ${nome}`,
                ativo: 1,
                tipo_material: 'trafo'
            });
        });
        
        // BOBINAS
        bobinaItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            if (item.dataset.jaRegistrado === 'true') return;
            
            const qtdInput = document.getElementById(`qtd-bobinas-${index}`);
            if (!qtdInput) return;
            if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
            
            const qtdAtual = parseFloat(qtdInput.value) || 0;
            if (!itemFoiModificado(qtdInput, item)) {
                console.log(`⏭️ Bobina #${index} não foi modificada - pulando`);
                return;
            }
            if (qtdAtual === 0) return;
            
            const qtdAnteriorInput = item.querySelector('.input-qtd-anterior');
            const qtdAnterior = parseFloat(qtdAnteriorInput?.value) || 0;
            
            if (quantidadeMenorQueAnterior(qtdAtual, qtdAnterior)) {
                temQuantidadeMenor = true;
                mostrarToast(`⚠️ Bobina #${index + 1}: Quantidade (${qtdAtual}) é menor que a contagem anterior (${qtdAnterior}). Confirme se deseja continuar.`, 'aviso');
                item.style.borderColor = '#ED8936';
                item.style.borderWidth = '2px';
                item.style.borderStyle = 'solid';
                return;
            }
            
            const codigoBobina = document.getElementById(`bobina-codigo-${index}`)?.value || '';
            const tombamentoBobina = document.getElementById(`bobina-tombamento-${index}`)?.value || '';
            
            if (verificarDuplicata(codigoBobina, tombamentoBobina, 'bobina')) {
                temDuplicata = true;
                mostrarToast(`❌ Bobina #${index + 1} (${codigoBobina} - ${tombamentoBobina}) já está registrada no banco!`, 'erro');
                item.style.borderColor = '#FC8181';
                item.style.borderWidth = '3px';
                item.style.borderStyle = 'solid';
                return;
            }
            
            const descricaoBobina = document.getElementById(`bobina-descricao-${index}`)?.value || '';
            const undBobina = document.getElementById(`bobina-und-${index}`)?.value || '';
            const nObra = document.getElementById(`n-obra-bobinas-${index}`)?.value || '';
            
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
            
            item.style.borderColor = '';
            item.style.borderWidth = '';
            item.style.borderStyle = '';
            
            materiaisParaEnviar.push({
                nome, matricula, data,
                codigo: codigoBobina,
                descricao: descricaoBobina,
                und: undBobina,
                qtd: qtdAtual,
                numero_serie: null,
                tombamento: tombamentoBobina,
                oleo: null,
                cor: null,
                n_obra: nObra || `Contagem diária - ${nome}`,
                ativo: 1,
                tipo_material: 'bobina'
            });
        });
        
        if (temQuantidadeMenor) {
            const continuar = confirm('⚠️ Uma ou mais quantidades são menores que a contagem anterior. Deseja continuar mesmo assim?');
            if (!continuar) {
                mostrarToast('⏸️ Envio cancelado pelo usuário.', 'info');
                return;
            }
        }
        
        // CONCRETOS
        concretoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            const idUnico = `concretos-${index}`;
            const qtdInput = document.getElementById(`qtd-${idUnico}`);
            if (!qtdInput) return;
            if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
            
            const qtdAtual = parseFloat(qtdInput.value) || 0;
            const codigo = item.dataset.codigo;
            
            if (!itemFoiModificado(qtdInput, item)) {
                console.log(`⏭️ Concreto ${codigo} não foi modificado - pulando`);
                return;
            }
            if (qtdAtual === 0) return;
            
            console.log(`✅ Concreto ${codigo} - novo registro permitido (contagem múltipla)`);
            
            const entradaItems = document.querySelectorAll(`#concreto-entradas-list-${idUnico} .concreto-entrada-item`);
            let justificativaCompleta = '';
            
            entradaItems.forEach(entradaItem => {
                const tipo = entradaItem.querySelector('.concreto-entrada-tipo')?.value || '';
                const valor = entradaItem.querySelector('.concreto-entrada-valor')?.value || '';
                const qtdEntrada = parseFloat(entradaItem.querySelector('.concreto-entrada-qtd')?.value) || 0;
                
                if (valor && qtdEntrada !== 0) {
                    const tipoLabel = tipo === 'n_obra' ? 'Nº Obra' : 'Nº Recebimento';
                    justificativaCompleta += `${tipoLabel}: ${valor} (${qtdEntrada > 0 ? '+' : ''}${qtdEntrada.toFixed(2)}) `;
                }
            });
            
            const entradas = [];
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
            
            const materiaisDaCategoria = materiaisPorCategoria['concretos'] || [];
            const material = materiaisDaCategoria.find(m => m.codigo === codigo);
            
            if (material) {
                const justificativaCampo = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                const obsFinal = justificativaCompleta.trim() || justificativaCampo.trim() || `Contagem: ${qtdAtual}`;
                
                materiaisParaEnviar.push({
                    nome, matricula, data,
                    codigo: material.codigo,
                    descricao: material.descricao,
                    und: material.und,
                    qtd: qtdAtual,
                    numero_serie: null,
                    tombamento: null,
                    oleo: null,
                    cor: null,
                    n_obra: '',
                    ativo: 1,
                    tipo_material: 'concreto',
                    entradas_concreto: entradas,
                    obs: obsFinal
                });
                console.log(`✅ Concreto ${codigo} adicionado para envio. QTD: ${qtdAtual}, Justificativa: ${obsFinal}`);
            }
        });
        
        // MISCELÂNEAS
        const miscelaneaItems = document.querySelectorAll('.miscelanea-item');
        miscelaneaItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            const idUnico = `miscelaneas-${index}`;
            const qtdInput = document.getElementById(`qtd-${idUnico}`);
            if (!qtdInput) return;
            if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
            
            const qtdAtual = parseFloat(qtdInput.value) || 0;
            const codigo = item.dataset.codigo;
            
            if (!itemFoiModificado(qtdInput, item)) {
                console.log(`⏭️ Miscelânea ${codigo} não foi modificada - pulando`);
                return;
            }
            if (qtdAtual === 0) return;
            
            console.log(`✅ Miscelânea ${codigo} - novo registro permitido (contagem múltipla)`);
            
            const entradaItems = document.querySelectorAll(`#concreto-entradas-list-${idUnico} .concreto-entrada-item`);
            let justificativaCompleta = '';
            
            entradaItems.forEach(entradaItem => {
                const tipo = entradaItem.querySelector('.concreto-entrada-tipo')?.value || '';
                const valor = entradaItem.querySelector('.concreto-entrada-valor')?.value || '';
                const qtdEntrada = parseFloat(entradaItem.querySelector('.concreto-entrada-qtd')?.value) || 0;
                
                if (valor && qtdEntrada !== 0) {
                    const tipoLabel = tipo === 'n_obra' ? 'Nº Obra' : 'Nº Recebimento';
                    justificativaCompleta += `${tipoLabel}: ${valor} (${qtdEntrada > 0 ? '+' : ''}${qtdEntrada.toFixed(2)}) `;
                }
            });
            
            const entradas = [];
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
            
            const materiaisDaCategoria = materiaisPorCategoria['miscelaneas'] || [];
            const material = materiaisDaCategoria.find(m => m.codigo === codigo);
            
            if (material) {
                const justificativaCampo = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                const obsFinal = justificativaCompleta.trim() || justificativaCampo.trim() || `Contagem: ${qtdAtual}`;
                
                materiaisParaEnviar.push({
                    nome, matricula, data,
                    codigo: material.codigo,
                    descricao: material.descricao,
                    und: material.und,
                    qtd: qtdAtual,
                    numero_serie: null,
                    tombamento: null,
                    oleo: null,
                    cor: null,
                    n_obra: '',
                    ativo: 1,
                    tipo_material: 'miscelanea',
                    entradas_concreto: entradas,
                    obs: obsFinal
                });
                console.log(`✅ Miscelânea ${codigo} adicionada para envio. QTD: ${qtdAtual}, Justificativa: ${obsFinal}`);
            }
        });
        
        // ESPECÍFICOS
        const especificoItems = document.querySelectorAll('.especifico-item');
        especificoItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            if (isNaN(index)) return;
            
            const idUnico = `especificos-${index}`;
            const qtdInput = document.getElementById(`qtd-${idUnico}`);
            if (!qtdInput) return;
            if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
            
            const qtdAtual = parseFloat(qtdInput.value) || 0;
            const codigo = item.dataset.codigo;
            
            if (!itemFoiModificado(qtdInput, item)) {
                console.log(`⏭️ Específico ${codigo} não foi modificado - pulando`);
                return;
            }
            if (qtdAtual === 0) return;
            
            console.log(`✅ Específico ${codigo} - novo registro permitido (contagem múltipla)`);
            
            const entradaItems = document.querySelectorAll(`#concreto-entradas-list-${idUnico} .concreto-entrada-item`);
            let justificativaCompleta = '';
            
            entradaItems.forEach(entradaItem => {
                const tipo = entradaItem.querySelector('.concreto-entrada-tipo')?.value || '';
                const valor = entradaItem.querySelector('.concreto-entrada-valor')?.value || '';
                const qtdEntrada = parseFloat(entradaItem.querySelector('.concreto-entrada-qtd')?.value) || 0;
                
                if (valor && qtdEntrada !== 0) {
                    const tipoLabel = tipo === 'n_obra' ? 'Nº Obra' : 'Nº Recebimento';
                    justificativaCompleta += `${tipoLabel}: ${valor} (${qtdEntrada > 0 ? '+' : ''}${qtdEntrada.toFixed(2)}) `;
                }
            });
            
            const entradas = [];
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
            
            const materiaisDaCategoria = materiaisPorCategoria['especificos'] || [];
            const material = materiaisDaCategoria.find(m => m.codigo === codigo);
            
            if (material) {
                const justificativaCampo = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                const obsFinal = justificativaCompleta.trim() || justificativaCampo.trim() || `Contagem: ${qtdAtual}`;
                
                materiaisParaEnviar.push({
                    nome, matricula, data,
                    codigo: material.codigo,
                    descricao: material.descricao,
                    und: material.und,
                    qtd: qtdAtual,
                    numero_serie: null,
                    tombamento: null,
                    oleo: null,
                    cor: null,
                    n_obra: '',
                    ativo: 1,
                    tipo_material: 'especifico',
                    entradas_concreto: entradas,
                    obs: obsFinal
                });
                console.log(`✅ Específico ${codigo} adicionado para envio. QTD: ${qtdAtual}, Justificativa: ${obsFinal}`);
            }
        });
        
        // CATEGORIAS ROTATIVAS
        const categoriasRotativas = ['lacos', 'alcas', 'parafusos', 'cabos', 'miscelaneas1', 'miscelaneas2', 'medidores'];
        
        for (const chaveRotativa of categoriasRotativas) {
            const itemsRotativos = document.querySelectorAll(`.${chaveRotativa}-item`);
            const tipoMaterial = CATEGORIAS[chaveRotativa]?.tipo_material || chaveRotativa;
            
            itemsRotativos.forEach((item) => {
                const index = parseInt(item.dataset.index);
                if (isNaN(index)) return;
                
                const idUnico = `${chaveRotativa}-${index}`;
                const qtdInput = document.getElementById(`qtd-${idUnico}`);
                if (!qtdInput) return;
                if (qtdInput.value === '' || qtdInput.value === null || qtdInput.value === undefined) return;
                
                const qtdAtual = parseFloat(qtdInput.value) || 0;
                const codigo = item.dataset.codigo;
                
                if (!itemFoiModificado(qtdInput, item)) {
                    console.log(`⏭️ ${chaveRotativa} ${codigo} não foi modificado - pulando`);
                    return;
                }
                if (qtdAtual === 0) return;
                
                console.log(`✅ ${chaveRotativa} ${codigo} - novo registro permitido (contagem múltipla)`);
                
                const materiaisDaCategoria = materiaisPorCategoria[chaveRotativa] || [];
                const material = materiaisDaCategoria.find(m => m.codigo === codigo);
                
                if (material) {
                    const justificativaCampo = document.getElementById(`justificativa-${idUnico}`)?.value || '';
                    const obsFinal = justificativaCampo.trim() || `Contagem: ${qtdAtual}`;
                    
                    materiaisParaEnviar.push({
                        nome, matricula, data,
                        codigo: material.codigo,
                        descricao: material.descricao,
                        und: material.und,
                        qtd: qtdAtual,
                        numero_serie: null,
                        tombamento: null,
                        oleo: null,
                        cor: null,
                        n_obra: '',
                        ativo: 1,
                        tipo_material: tipoMaterial,
                        entradas_concreto: [],
                        obs: obsFinal
                    });
                    console.log(`✅ ${chaveRotativa} ${codigo} adicionado para envio. QTD: ${qtdAtual}, Justificativa: ${obsFinal}`);
                }
            });
        }
        
        if (temErroValidacao || temDuplicata) {
            if (temDuplicata) {
                mostrarToast('❌ Um ou mais itens já estão registrados no banco! Verifique os itens destacados.', 'erro');
            }
            return;
        }
        
        if (materiaisParaEnviar.length === 0) {
            mostrarToast('ℹ️ Nenhum item foi modificado. Nada para salvar.', 'info');
            return;
        }
        
        // ============================================
        // ENVIAR
        // ============================================
        
        try {
            enviandoDados = true;
            botaoSubmit.disabled = true;
            botaoSubmit.textContent = 'Enviando...';
            
            let totalProcessados = 0;
            
            if (materiaisParaEnviar.length > 0) {
                mostrarToast(`⏳ Salvando ${materiaisParaEnviar.length} item(ns)...`, 'info');
            }
            
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
                        
                        if (material.tipo_material === 'trafo' || material.tipo_material === 'bobina') {
                            const itemElement = document.querySelector(`.${material.tipo_material}-item[data-codigo="${material.codigo}"][data-tombamento="${material.tombamento || ''}"]`);
                            if (itemElement) {
                                travarItemAposRegistro(itemElement, material.tipo_material);
                            }
                        }
                    } else {
                        const errorText = await response.text();
                        console.error(`❌ Erro ao salvar ${material.codigo}:`, errorText);
                        mostrarToast(`❌ Erro ao salvar ${material.codigo}: ${errorText}`, 'erro');
                    }
                } catch (error) {
                    console.error(`❌ Erro ao salvar ${material.codigo}:`, error);
                    mostrarToast(`❌ Erro de conexão ao salvar ${material.codigo}`, 'erro');
                }
            }
            
            if (totalProcessados > 0) {
                mostrarToast(`✅ ${totalProcessados} item(ns) registrado(s) com sucesso!`, 'sucesso');
            } else {
                mostrarToast('❌ Nenhum item foi salvo. Verifique os erros acima.', 'erro');
            }
            
            cacheQuantidades = {};
            setTimeout(async () => {
                await carregarTodosRegistros();
                await carregarItensManuais();
                
                const tabTrafos = document.getElementById('tab-diaria-trafos');
                if (tabTrafos) {
                    tabTrafos.innerHTML = renderizarTrafos(materiaisManuais);
                    atualizarContadorTrafos();
                }
                const tabBobinas = document.getElementById('tab-diaria-bobinas');
                if (tabBobinas) {
                    tabBobinas.innerHTML = renderizarBobinas(bobinasManuais);
                    atualizarContadorBobinas();
                }
            }, 500);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            mostrarToast('❌ Erro de conexão com o servidor.', 'erro');
            
        } finally {
            enviandoDados = false;
            botaoSubmit.disabled = false;
            botaoSubmit.textContent = '📝 Registrar Contagem';
        }
    });
    
    // ============================================
    // EXPOR FUNÇÕES GLOBAIS
    // ============================================
    
    window.ativarTipoContagem = ativarTipoContagem;
    window.ativarAbaSubdivisao = ativarAbaSubdivisao;
    window.calcularDiferenca = calcularDiferenca;
    window.calcularDiferencaBobina = calcularDiferencaBobina;
    window.calcularDiferencaTrafo = calcularDiferencaTrafo;
    window.calcularDiferencaConcreto = calcularDiferencaConcreto;
    window.calcularDiferencaMiscelanea = calcularDiferencaMiscelanea;
    window.calcularDiferencaEspecifico = calcularDiferencaEspecifico;
    window.calcularDiferencaRotativa = calcularDiferencaRotativa;
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
    window.abrirModalBaixa = abrirModalBaixa;
    window.fecharModalBaixa = fecharModalBaixa;
    window.verificarNObraTrafo = verificarNObraTrafo;
    window.verificarNObraBobina = verificarNObraBobina;
    window.adicionarEntradaConcreto = adicionarEntradaConcreto;
    window.adicionarEntradaMiscelanea = adicionarEntradaMiscelanea;
    window.adicionarEntradaEspecifico = adicionarEntradaEspecifico;
    window.toggleConcretoEntradaFields = toggleConcretoEntradaFields;
    window.removerEntradaConcreto = removerEntradaConcreto;
    window.validarConcretoEntrada = validarConcretoEntrada;
    window.redirecionarParaHome = redirecionarParaHome;
    window.aplicarFiltro = aplicarFiltro;
    window.limparFiltro = limparFiltro;
    window.irParaTopo = irParaTopo;
    window.irParaFim = irParaFim;
    window.controlarBotoesNavegacao = controlarBotoesNavegacao;
    window.travarItemAposRegistro = travarItemAposRegistro;
    window.itemFoiModificado = itemFoiModificado;
    window.atualizarTotalConcreto = atualizarTotalConcreto;
    window.quantidadeMenorQueAnterior = quantidadeMenorQueAnterior;
    
    // ============================================
    // INICIALIZAR
    // ============================================
    
    carregarDadosUsuarioSessao();
    carregarMateriais();
    
    // ============================================
    // INICIALIZAR BOTÕES DE NAVEGAÇÃO
    // ============================================
    
    window.addEventListener('scroll', controlarBotoesNavegacao);
    window.addEventListener('load', function() {
        setTimeout(controlarBotoesNavegacao, 500);
    });
    window.addEventListener('resize', controlarBotoesNavegacao);
    
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