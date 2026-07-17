// ============================================
// RELATÓRIOS - SICGM
// ============================================

const API_URL = 'https://noisy-snow-0359.alefe-gomes-72f.workers.dev';

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let perfilUsuario = 'OPERACIONAL'; // Padrão
let dadosCompletos = [];
let dadosProcessados = [];

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
// FUNÇÃO PARA FORMATAR DATA
// ============================================

function formatarData(dataString) {
    if (!dataString) return '-';
    try {
        const data = new Date(dataString + 'T00:00:00');
        return data.toLocaleDateString('pt-BR');
    } catch {
        return dataString;
    }
}

function formatarDataHora(dataString) {
    if (!dataString) return '-';
    try {
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dataString;
    }
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
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
// CARREGAR POSIÇÃO DE ESTOQUE
// ============================================

let posicaoEstoque = {};

async function carregarPosicaoEstoque() {
    try {
        console.log('🔄 Carregando posição de estoque...');
        
        const response = await fetch('../data/posicao-de-estoque.txt');
        
        if (!response.ok) {
            console.warn('⚠️ Arquivo posicao-de-estoque.txt não encontrado');
            mostrarToast('⚠️ Arquivo de posição de estoque não encontrado', 'aviso');
            return;
        }
        
        const texto = await response.text();
        const linhas = texto.trim().split('\n');
        
        if (linhas.length === 0) {
            console.warn('⚠️ Arquivo posicao-de-estoque.txt vazio');
            return;
        }
        
        console.log(`📄 Arquivo carregado: ${linhas.length} linhas`);
        
        let linhasProcessadas = 0;
        
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;
            
            const partes = linha.split('\t');
            
            if (partes.length >= 5) {
                const codmat = partes[0].trim();
                const dscmat = partes[1]?.trim() || '';
                const codund = partes[2]?.trim() || '';
                
                let vlrultCot = 0;
                try {
                    const valorStr = partes[3]?.trim().replace(',', '.') || '0';
                    vlrultCot = parseFloat(valorStr) || 0;
                } catch (e) {
                    vlrultCot = 0;
                }
                
                let saldoOper = 0;
                try {
                    const saldoStr = partes[4]?.trim().replace(',', '.') || '0';
                    saldoOper = parseFloat(saldoStr) || 0;
                } catch (e) {
                    saldoOper = 0;
                }
                
                if (codmat) {
                    posicaoEstoque[codmat] = {
                        codmat: codmat,
                        descricao: dscmat,
                        und: codund,
                        valor_unitario: vlrultCot,
                        saldo_sistemico: saldoOper
                    };
                    linhasProcessadas++;
                }
            }
        }
        
        console.log(`📦 Posição de estoque carregada: ${linhasProcessadas} códigos`);
        
        if (linhasProcessadas === 0) {
            mostrarToast('⚠️ Nenhum dado válido encontrado no arquivo de estoque', 'aviso');
        } else {
            mostrarToast(`✅ ${linhasProcessadas} itens carregados da posição de estoque`, 'sucesso');
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar posição de estoque:', error);
        mostrarToast('❌ Erro ao carregar posição de estoque', 'erro');
    }
}

function getPosicaoEstoque(codigo) {
    if (!codigo) return null;
    return posicaoEstoque[codigo] || null;
}

// ============================================
// CARREGAR DADOS DO D1
// ============================================

async function carregarDados() {
    try {
        mostrarToast('⏳ Carregando dados do banco...', 'info');
        
        const response = await fetch(`${API_URL}/api/dados`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }
        
        const dados = await response.json();
        console.log(`📊 Dados carregados: ${dados.length} registros`);
        return dados;
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        mostrarToast('❌ Erro ao carregar dados do servidor', 'erro');
        return [];
    }
}

// ============================================
// PROCESSAR DADOS PARA RELATÓRIO - CORRIGIDO
// ============================================

function processarDados(dados, filtros) {
    // Filtrar apenas ativos
    let dadosFiltrados = dados.filter(item => item.ativo === 1 || item.ativo === true);
    
    // Aplicar filtros
    if (filtros) {
        if (filtros.dataInicio) {
            const dataInicio = new Date(filtros.dataInicio + 'T00:00:00');
            dadosFiltrados = dadosFiltrados.filter(item => {
                const dataItem = new Date(item.data + 'T00:00:00');
                return dataItem >= dataInicio;
            });
        }
        
        if (filtros.dataFim) {
            const dataFim = new Date(filtros.dataFim + 'T00:00:00');
            dadosFiltrados = dadosFiltrados.filter(item => {
                const dataItem = new Date(item.data + 'T00:00:00');
                return dataItem <= dataFim;
            });
        }
        
        if (filtros.tipoMaterial) {
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.tipo_material === filtros.tipoMaterial
            );
        }
        
        if (filtros.codigo && filtros.codigo.trim()) {
            const codigoBusca = filtros.codigo.trim();
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.codigo && item.codigo.includes(codigoBusca)
            );
        }
    }
    
    // ============================================================
    // REGRA DE PROCESSAMENTO POR TIPO DE MATERIAL:
    // - Concretos, Miscelâneas, Específicos: pegar APENAS a última contagem
    // - Trafos e Bobinas: SOMAR todas as quantidades (cada item é único)
    // ============================================================
    
    // Definir quais tipos usam apenas a última contagem
    const tiposUltimaContagem = ['concreto', 'miscelanea', 'especifico'];
    const tiposSomaTudo = ['trafo', 'bobina'];
    
    // Agrupar por código
    const gruposPorCodigo = {};
    
    dadosFiltrados.forEach(item => {
        const codigo = item.codigo;
        if (!gruposPorCodigo[codigo]) {
            gruposPorCodigo[codigo] = {
                codigo: codigo,
                tipo_material: item.tipo_material || 'desconhecido',
                registros: []
            };
        }
        gruposPorCodigo[codigo].registros.push(item);
    });
    
    // Processar cada grupo
    const registrosProcessados = [];
    
    Object.values(gruposPorCodigo).forEach(grupo => {
        const tipoMaterial = grupo.tipo_material;
        const registros = grupo.registros;
        
        // Ordenar registros por data (do mais antigo para o mais novo)
        registros.sort((a, b) => {
            const dateA = new Date(a.created_at || a.data);
            const dateB = new Date(b.created_at || b.data);
            return dateA - dateB;
        });
        
        if (tiposUltimaContagem.includes(tipoMaterial)) {
            // ==========================================
            // CONCRETOS, MISCELÂNEAS, ESPECÍFICOS
            // Pegar APENAS a ÚLTIMA contagem
            // ==========================================
            const ultimoRegistro = registros[registros.length - 1];
            registrosProcessados.push(ultimoRegistro);
            
            console.log(`📊 ${tipoMaterial} ${grupo.codigo}: usando ÚLTIMA contagem = ${ultimoRegistro.qtd} (total de ${registros.length} registros)`);
            
        } else if (tiposSomaTudo.includes(tipoMaterial)) {
            // ==========================================
            // TRAFOS E BOBINAS
            // Manter TODOS os registros para somar
            // ==========================================
            registros.forEach(registro => {
                registrosProcessados.push(registro);
            });
            
            const totalQtd = registros.reduce((sum, r) => sum + (parseFloat(r.qtd) || 0), 0);
            console.log(`📊 ${tipoMaterial} ${grupo.codigo}: ${registros.length} registros, soma total = ${totalQtd}`);
            
        } else {
            // Fallback para tipos desconhecidos
            const ultimoRegistro = registros[registros.length - 1];
            registrosProcessados.push(ultimoRegistro);
            console.log(`📊 ${tipoMaterial} ${grupo.codigo}: tipo desconhecido, usando último registro`);
        }
    });
    
    // ============================================================
    // AGRUPAR PARA O RELATÓRIO FINAL
    // ============================================================
    
    const grupos = {};
    
    registrosProcessados.forEach(item => {
        const codigo = item.codigo;
        const tipoMaterial = item.tipo_material || 'desconhecido';
        
        if (!grupos[codigo]) {
            grupos[codigo] = {
                codigo: codigo,
                descricao: item.descricao || codigo,
                und: item.und || '-',
                tipo_material: tipoMaterial,
                quantidade_total: 0,
                ultima_contagem: null,
                ultimo_usuario: null,
                ultima_data: null,
                registros: [],
                bobinas_unicas: new Set(),
                qtds_utilizadas: []
            };
        }
        
        // Adicionar a quantidade ao total
        const qtd = parseFloat(item.qtd) || 0;
        grupos[codigo].quantidade_total += qtd;
        grupos[codigo].registros.push(item);
        grupos[codigo].qtds_utilizadas.push({
            qtd: qtd,
            data: item.data,
            created_at: item.created_at,
            nome: item.nome
        });
        
        // Para bobinas, contar tombamentos únicos
        if (item.tipo_material === 'bobina' && item.tombamento) {
            grupos[codigo].bobinas_unicas.add(item.tombamento);
        }
        
        // Atualizar última contagem (para exibição)
        const dataItem = new Date(item.created_at || item.data);
        if (!grupos[codigo].ultima_data || dataItem > new Date(grupos[codigo].ultima_data)) {
            grupos[codigo].ultima_contagem = item.qtd;
            grupos[codigo].ultimo_usuario = item.nome;
            grupos[codigo].ultima_data = item.created_at || item.data;
        }
    });
    
    const resultado = Object.values(grupos);
    resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
    
    // Log de debug
    console.log('📊 ===== RELATÓRIO PROCESSADO =====');
    resultado.forEach(item => {
        const qtds = item.qtds_utilizadas.map(q => q.qtd).join(', ');
        console.log(`  ${item.codigo} (${item.tipo_material}): QTD TOTAL = ${item.quantidade_total} | QTDs usadas: [${qtds}]`);
    });
    console.log('📊 ================================');
    
    return resultado;
}

// ============================================
// DEFINIR COLUNAS POR PERFIL
// ============================================

function getColunasPorPerfil() {
    // Colunas completas para GESTÃO
    const colunasCompletas = [
        { key: 'codigo', label: 'Código', width: 'auto' },
        { key: 'descricao', label: 'Descrição', width: 'auto' },
        { key: 'und', label: 'UND', width: 'auto' },
        { key: 'tipo', label: 'Tipo', width: 'auto' },
        { key: 'qtd_fisica', label: 'QTD Física', width: 'auto' },
        { key: 'saldo_sistemico', label: 'Saldo Sistêmico', width: 'auto' },
        { key: 'divergencia_qtd', label: 'Divergência QTD', width: 'auto' },
        { key: 'valor_unitario', label: 'Valor Unitário', width: 'auto' },
        { key: 'valor_divergencia', label: 'Valor Divergência', width: 'auto' },
        { key: 'acuracidade', label: 'Acuracidade', width: 'auto' },
        { key: 'bobinas_unicas', label: 'Bobinas Únicas', width: 'auto' },
        { key: 'ultimo_usuario', label: 'Último Usuário', width: 'auto' },
        { key: 'ultima_data', label: 'Data da Última', width: 'auto' }
    ];
    
    // Colunas reduzidas para OPERACIONAL e VISUALIZACAO
    const colunasReduzidas = [
        { key: 'codigo', label: 'Código', width: 'auto' },
        { key: 'descricao', label: 'Descrição', width: 'auto' },
        { key: 'und', label: 'UND', width: 'auto' },
        { key: 'tipo', label: 'Tipo', width: 'auto' },
        { key: 'qtd_fisica', label: 'QTD Física', width: 'auto' },
        { key: 'bobinas_unicas', label: 'Bobinas Únicas', width: 'auto' },
        { key: 'ultimo_usuario', label: 'Último Usuário', width: 'auto' },
        { key: 'ultima_data', label: 'Data da Última', width: 'auto' }
    ];
    
    if (perfilUsuario === 'GESTAO') {
        return colunasCompletas;
    }
    
    return colunasReduzidas;
}

// ============================================
// RENDERIZAR RELATÓRIO - COM CORES NA DIVERGÊNCIA TOTAL
// ============================================

function renderizarRelatorio(dados) {
    const tbody = document.getElementById('relatorio-body');
    const loading = document.getElementById('loading-relatorio');
    const resumoDiv = document.getElementById('divergencia-resumo');
    const thead = document.querySelector('#relatorio-tabela thead');
    
    if (loading) loading.style.display = 'none';
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" class="text-center">📭 Nenhum dado encontrado para os filtros selecionados</td>
            </tr>
        `;
        if (resumoDiv) resumoDiv.style.display = 'none';
        return;
    }
    
    // Determinar colunas baseado no perfil
    const colunas = getColunasPorPerfil();
    const isGestao = perfilUsuario === 'GESTAO';
    
    // Renderizar cabeçalho
    let headerHtml = '<tr>';
    colunas.forEach(col => {
        headerHtml += `<th>${col.label}</th>`;
    });
    headerHtml += '</tr>';
    thead.innerHTML = headerHtml;
    
    // Renderizar corpo
    let html = '';
    let totalDivergenciaQtd = 0;
    let totalDivergenciaValor = 0;
    let totalItensDivergentes = 0;
    let itensComDivergencia = [];
    
    dados.forEach(item => {
        const badgeClass = `badge-${item.tipo_material}`;
        const tipoLabel = item.tipo_material.charAt(0).toUpperCase() + item.tipo_material.slice(1);
        
        const estoque = getPosicaoEstoque(item.codigo);
        const saldoSistemico = estoque ? estoque.saldo_sistemico : 0;
        const valorUnitario = estoque ? estoque.valor_unitario : 0;
        const descricaoEstoque = estoque ? estoque.descricao : '';
        const undEstoque = estoque ? estoque.und : '';
        
        const descricaoFinal = descricaoEstoque || item.descricao || item.codigo;
        const undFinal = undEstoque || item.und || '-';
        const saldoFisico = item.quantidade_total;
        
        const divergenciaQtd = saldoFisico - saldoSistemico;
        const divergenciaValor = divergenciaQtd * valorUnitario;
        
        if (divergenciaQtd !== 0) {
            totalDivergenciaQtd += divergenciaQtd;
            totalDivergenciaValor += divergenciaValor;
            totalItensDivergentes++;
            itensComDivergencia.push({
                codigo: item.codigo,
                descricao: descricaoFinal,
                divergenciaQtd: divergenciaQtd,
                divergenciaValor: divergenciaValor
            });
        }
        
        let acuracidade = '-';
        if (saldoSistemico > 0) {
            const diferenca = Math.abs(saldoFisico - saldoSistemico);
            const percentual = ((1 - (diferenca / saldoSistemico)) * 100);
            acuracidade = percentual.toFixed(1) + '%';
            
            if (percentual >= 95) {
                acuracidade = `<span style="color: #48BB78; font-weight: 600;">✅ ${acuracidade}</span>`;
            } else if (percentual >= 80) {
                acuracidade = `<span style="color: #ED8936; font-weight: 600;">⚠️ ${acuracidade}</span>`;
            } else {
                acuracidade = `<span style="color: #FC8181; font-weight: 600;">❌ ${acuracidade}</span>`;
            }
        }
        
        let bobinasUnicasCount = '-';
        if (item.tipo_material === 'bobina' && item.bobinas_unicas) {
            bobinasUnicasCount = item.bobinas_unicas.size;
        }
        
        let divergenciaQtdDisplay = divergenciaQtd.toFixed(2);
        let divergenciaValorDisplay = formatarMoeda(divergenciaValor);
        
        if (divergenciaQtd > 0) {
            divergenciaQtdDisplay = `<span style="color: #48BB78; font-weight: 600;">▲ +${divergenciaQtd.toFixed(2)}</span>`;
            divergenciaValorDisplay = `<span style="color: #48BB78; font-weight: 600;">${formatarMoeda(divergenciaValor)}</span>`;
        } else if (divergenciaQtd < 0) {
            divergenciaQtdDisplay = `<span style="color: #FC8181; font-weight: 600;">▼ ${divergenciaQtd.toFixed(2)}</span>`;
            divergenciaValorDisplay = `<span style="color: #FC8181; font-weight: 600;">${formatarMoeda(divergenciaValor)}</span>`;
        }
        
        const valorUnitarioDisplay = valorUnitario > 0 ? formatarMoeda(valorUnitario) : '-';
        
        // Construir linha baseada nas colunas
        let rowHtml = '<tr>';
        
        colunas.forEach(col => {
            let cellContent = '';
            
            switch (col.key) {
                case 'codigo':
                    cellContent = `<strong>${item.codigo}</strong>`;
                    break;
                case 'descricao':
                    cellContent = descricaoFinal;
                    break;
                case 'und':
                    cellContent = undFinal;
                    break;
                case 'tipo':
                    cellContent = `<span class="badge-tipo ${badgeClass}">${tipoLabel}</span>`;
                    break;
                case 'qtd_fisica':
                    cellContent = `<strong>${saldoFisico.toFixed(2)}</strong>`;
                    break;
                case 'saldo_sistemico':
                    cellContent = isGestao ? saldoSistemico.toFixed(2) : '-';
                    break;
                case 'divergencia_qtd':
                    cellContent = isGestao ? divergenciaQtdDisplay : '-';
                    break;
                case 'valor_unitario':
                    cellContent = isGestao ? valorUnitarioDisplay : '-';
                    break;
                case 'valor_divergencia':
                    cellContent = isGestao ? divergenciaValorDisplay : '-';
                    break;
                case 'acuracidade':
                    cellContent = isGestao ? acuracidade : '-';
                    break;
                case 'bobinas_unicas':
                    cellContent = bobinasUnicasCount;
                    break;
                case 'ultimo_usuario':
                    cellContent = item.ultimo_usuario || '-';
                    break;
                case 'ultima_data':
                    cellContent = formatarDataHora(item.ultima_data);
                    break;
                default:
                    cellContent = '-';
            }
            
            rowHtml += `<td>${cellContent}</td>`;
        });
        
        rowHtml += '</tr>';
        html += rowHtml;
    });
    
    tbody.innerHTML = html;
    
    // ============================================
    // ATUALIZAR RESUMO DE DIVERGÊNCIAS COM CORES
    // ============================================
    if (resumoDiv) {
        if (isGestao && totalItensDivergentes > 0) {
            resumoDiv.style.display = 'block';
            
            // Atualizar o valor total da divergência com cor
            const totalDivergenciaValorEl = document.getElementById('total-divergencia-valor');
            const totalDivergenciaQtdEl = document.getElementById('total-divergencia-qtd');
            
            // Colorir o VALOR TOTAL DA DIVERGÊNCIA
            if (totalDivergenciaValorEl) {
                let valorDisplay = formatarMoeda(totalDivergenciaValor);
                let valorColor = '#2D3748'; // cinza escuro padrão
                
                if (totalDivergenciaValor > 0) {
                    valorColor = '#48BB78'; // verde - mais físico que sistêmico
                    valorDisplay = `▲ ${valorDisplay}`;
                } else if (totalDivergenciaValor < 0) {
                    valorColor = '#FC8181'; // vermelho - menos físico que sistêmico
                    valorDisplay = `▼ ${valorDisplay}`;
                }
                
                totalDivergenciaValorEl.innerHTML = `<span style="color: ${valorColor}; font-weight: 700;">${valorDisplay}</span>`;
            }
            
            // Colorir a QUANTIDADE TOTAL DA DIVERGÊNCIA
            if (totalDivergenciaQtdEl) {
                let qtdDisplay = totalDivergenciaQtd.toFixed(2);
                let qtdColor = '#2D3748'; // cinza escuro padrão
                
                if (totalDivergenciaQtd > 0) {
                    qtdColor = '#48BB78'; // verde
                    qtdDisplay = `▲ +${qtdDisplay}`;
                } else if (totalDivergenciaQtd < 0) {
                    qtdColor = '#FC8181'; // vermelho
                    qtdDisplay = `▼ ${qtdDisplay}`;
                }
                
                totalDivergenciaQtdEl.innerHTML = `<span style="color: ${qtdColor}; font-weight: 700;">${qtdDisplay}</span>`;
            }
            
            // Atualizar total de itens divergentes
            document.getElementById('total-itens-divergentes').textContent = totalItensDivergentes;
            
        } else {
            resumoDiv.style.display = 'none';
        }
    }
}

// ============================================
// ATUALIZAR ESTATÍSTICAS - CORRIGIDO
// ============================================

function atualizarEstatisticas(dados, dadosBrutos) {
    const totalRegistros = dadosBrutos ? dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true).length : 0;
    document.getElementById('total-registros').textContent = totalRegistros;
    document.getElementById('total-codigos').textContent = dados ? dados.length : 0;
    
    if (dadosBrutos && dadosBrutos.length > 0) {
        const ativos = dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true);
        if (ativos.length > 0) {
            const ultimo = ativos.sort((a, b) => {
                const dateA = new Date(a.created_at || a.data);
                const dateB = new Date(b.created_at || b.data);
                return dateB - dateA;
            })[0];
            document.getElementById('ultima-contagem').textContent = formatarDataHora(ultimo.created_at || ultimo.data);
        }
    }
    
    if (dadosBrutos) {
        const ativos = dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true);
        
        // ============================================
        // TRAFOS - SOMAR TODOS (cada trafo é único)
        // ============================================
        const trafos = ativos.filter(i => i.tipo_material === 'trafo');
        const totalTrafos = trafos.reduce((sum, item) => sum + (parseFloat(item.qtd) || 0), 0);
        document.getElementById('total-trafos').textContent = totalTrafos.toFixed(0);
        
        // ============================================
        // BOBINAS - SOMAR TODOS (cada bobina é única)
        // ============================================
        const bobinas = ativos.filter(i => i.tipo_material === 'bobina');
        const totalBobinas = bobinas.reduce((sum, item) => sum + (parseFloat(item.qtd) || 0), 0);
        document.getElementById('total-bobinas').textContent = totalBobinas.toFixed(0);
        
        // ============================================
        // CONCRETOS - PEGAR APENAS A ÚLTIMA CONTAGEM DE CADA CÓDIGO
        // ============================================
        const concretos = ativos.filter(i => i.tipo_material === 'concreto');
        
        // Agrupar concretos por código
        const gruposConcretos = {};
        concretos.forEach(item => {
            const codigo = item.codigo;
            if (!gruposConcretos[codigo]) {
                gruposConcretos[codigo] = [];
            }
            gruposConcretos[codigo].push(item);
        });
        
        // Para cada código de concreto, pegar apenas a última contagem
        let totalConcretos = 0;
        Object.values(gruposConcretos).forEach(registros => {
            // Ordenar por data (do mais novo para o mais antigo)
            registros.sort((a, b) => {
                const dateA = new Date(a.created_at || a.data);
                const dateB = new Date(b.created_at || b.data);
                return dateB - dateA;
            });
            // Pegar o primeiro (mais recente)
            const ultimoRegistro = registros[0];
            totalConcretos += parseFloat(ultimoRegistro.qtd) || 0;
        });
        
        document.getElementById('total-concretos').textContent = totalConcretos.toFixed(0);
        
        // ============================================
        // MISCELÂNEAS - PEGAR APENAS A ÚLTIMA CONTAGEM DE CADA CÓDIGO
        // ============================================
        const miscelaneas = ativos.filter(i => i.tipo_material === 'miscelanea');
        
        const gruposMiscelaneas = {};
        miscelaneas.forEach(item => {
            const codigo = item.codigo;
            if (!gruposMiscelaneas[codigo]) {
                gruposMiscelaneas[codigo] = [];
            }
            gruposMiscelaneas[codigo].push(item);
        });
        
        let totalMiscelaneas = 0;
        Object.values(gruposMiscelaneas).forEach(registros => {
            registros.sort((a, b) => {
                const dateA = new Date(a.created_at || a.data);
                const dateB = new Date(b.created_at || b.data);
                return dateB - dateA;
            });
            const ultimoRegistro = registros[0];
            totalMiscelaneas += parseFloat(ultimoRegistro.qtd) || 0;
        });
        
        // Se existir um elemento para miscelâneas, atualizar
        const totalMiscelaneasEl = document.getElementById('total-miscelaneas');
        if (totalMiscelaneasEl) {
            totalMiscelaneasEl.textContent = totalMiscelaneas.toFixed(0);
        }
        
        // ============================================
        // ESPECÍFICOS - PEGAR APENAS A ÚLTIMA CONTAGEM DE CADA CÓDIGO
        // ============================================
        const especificos = ativos.filter(i => i.tipo_material === 'especifico');
        
        const gruposEspecificos = {};
        especificos.forEach(item => {
            const codigo = item.codigo;
            if (!gruposEspecificos[codigo]) {
                gruposEspecificos[codigo] = [];
            }
            gruposEspecificos[codigo].push(item);
        });
        
        let totalEspecificos = 0;
        Object.values(gruposEspecificos).forEach(registros => {
            registros.sort((a, b) => {
                const dateA = new Date(a.created_at || a.data);
                const dateB = new Date(b.created_at || b.data);
                return dateB - dateA;
            });
            const ultimoRegistro = registros[0];
            totalEspecificos += parseFloat(ultimoRegistro.qtd) || 0;
        });
        
        // Se existir um elemento para específicos, atualizar
        const totalEspecificosEl = document.getElementById('total-especificos');
        if (totalEspecificosEl) {
            totalEspecificosEl.textContent = totalEspecificos.toFixed(0);
        }
        
        console.log('📊 ===== ESTATÍSTICAS =====');
        console.log(`  Trafos: ${totalTrafos}`);
        console.log(`  Bobinas: ${totalBobinas}`);
        console.log(`  Concretos (última contagem): ${totalConcretos}`);
        console.log(`  Miscelâneas (última contagem): ${totalMiscelaneas}`);
        console.log(`  Específicos (última contagem): ${totalEspecificos}`);
        console.log('📊 ========================');
    }
}

// ============================================
// CARREGAR RELATÓRIOS COM FILTROS
// ============================================

async function carregarRelatorios() {
    const loading = document.getElementById('loading-relatorio');
    if (loading) loading.style.display = 'block';
    
    try {
        const dadosBrutos = await carregarDados();
        
        if (!dadosBrutos || dadosBrutos.length === 0) {
            mostrarToast('⚠️ Nenhum dado encontrado no banco', 'aviso');
            if (loading) loading.style.display = 'none';
            return;
        }
        
        const filtros = {
            dataInicio: document.getElementById('filtro-data-inicio')?.value || '',
            dataFim: document.getElementById('filtro-data-fim')?.value || '',
            tipoMaterial: document.getElementById('filtro-tipo-material')?.value || '',
            codigo: document.getElementById('filtro-codigo')?.value || ''
        };
        
        dadosProcessados = processarDados(dadosBrutos, filtros);
        dadosCompletos = dadosBrutos;
        
        renderizarRelatorio(dadosProcessados);
        atualizarEstatisticas(dadosProcessados, dadosBrutos);
        
        const total = dadosProcessados.length;
        mostrarToast(`✅ ${total} código(s) encontrado(s)`, 'sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao carregar relatórios:', error);
        mostrarToast('❌ Erro ao carregar relatórios', 'erro');
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// ============================================
// LIMPAR FILTROS
// ============================================

function limparFiltros() {
    document.getElementById('filtro-data-inicio').value = '';
    document.getElementById('filtro-data-fim').value = '';
    document.getElementById('filtro-tipo-material').value = '';
    document.getElementById('filtro-codigo').value = '';
    carregarRelatorios();
}

// ============================================
// EXPORTAR EXCEL (XLSX)
// ============================================

function exportarExcel() {
    const tbody = document.getElementById('relatorio-body');
    const linhas = tbody.querySelectorAll('tr');
    const colunas = getColunasPorPerfil();
    const isGestao = perfilUsuario === 'GESTAO';
    
    if (linhas.length === 0 || linhas[0].textContent.includes('Nenhum dado')) {
        mostrarToast('⚠️ Não há dados para exportar', 'aviso');
        return;
    }
    
    mostrarToast('🔄 Gerando arquivo Excel...', 'info');
    
    try {
        let htmlContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" 
                  xmlns:x="urn:schemas-microsoft-com:office:excel" 
                  xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Relatório</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 10px; }
                    th { background-color: #4299E1; color: white; font-weight: bold; padding: 6px 10px; border: 1px solid #2B6CB0; }
                    td { padding: 5px 10px; border: 1px solid #CBD5E0; }
                    .text-center { text-align: center; }
                    .total-row { background-color: #EDF2F7; font-weight: 700; }
                </style>
            </head>
            <body>
                <h2>📊 Relatório de Contagem - SICGM</h2>
                <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
                <p>Perfil: ${perfilUsuario}</p>
                <table>
                    <thead>
                        <tr>
                            ${colunas.map(col => `<th>${col.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalDivergenciaQtd = 0;
        let totalDivergenciaValor = 0;
        
        linhas.forEach(linha => {
            const colunasTd = linha.querySelectorAll('td');
            if (colunasTd.length > 0 && !linha.textContent.includes('Nenhum dado')) {
                let valores = [];
                colunasTd.forEach(col => {
                    let texto = col.textContent.trim();
                    texto = texto.replace(/<[^>]*>/g, '').trim();
                    texto = texto.replace(/[▲▼+]/g, '').trim();
                    valores.push(texto);
                });
                
                if (isGestao && valores.length >= 9) {
                    const divText = valores[6]?.trim().replace(/[^0-9,.-]/g, '') || '0';
                    const divValor = parseFloat(divText.replace(',', '.')) || 0;
                    totalDivergenciaQtd += divValor;
                    
                    const valText = valores[8]?.trim().replace(/[^0-9,.-]/g, '') || '0';
                    const valValor = parseFloat(valText.replace(',', '.')) || 0;
                    totalDivergenciaValor += valValor;
                }
                
                htmlContent += `<tr><td>${valores.join('</td><td>')}</td></tr>`;
            }
        });
        
        // Linha de total (apenas para GESTÃO)
        if (isGestao) {
            htmlContent += `
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="6" style="text-align: right; font-weight: 700;">TOTAL DIVERGÊNCIA</td>
                            <td style="font-weight: 700;">${totalDivergenciaQtd.toFixed(2)}</td>
                            <td></td>
                            <td style="font-weight: 700;">${formatarMoeda(totalDivergenciaValor)}</td>
                            <td colspan="4"></td>
                        </tr>
                    </tfoot>
            `;
        }
        
        htmlContent += `
                </table>
                <br>
                <p style="font-size: 10px; color: #718096;">
                    * Relatório gerado automaticamente pelo sistema SICGM
                </p>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8' 
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_contagem_${getDataBrasil()}.xls`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        mostrarToast('✅ Excel exportado com sucesso!', 'sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao exportar Excel:', error);
        mostrarToast('❌ Erro ao exportar Excel', 'erro');
    }
}

// ============================================
// EXPORTAR PDF (Impressão)
// ============================================

function exportarPDF() {
    const tbody = document.getElementById('relatorio-body');
    const linhas = tbody.querySelectorAll('tr');
    
    if (linhas.length === 0 || linhas[0].textContent.includes('Nenhum dado')) {
        mostrarToast('⚠️ Não há dados para exportar', 'aviso');
        return;
    }
    
    mostrarToast('🔄 Preparando PDF...', 'info');
    
    setTimeout(() => {
        const tituloImpressao = document.createElement('div');
        tituloImpressao.id = 'titulo-impressao';
        tituloImpressao.style.cssText = `
            display: none;
            text-align: center;
            padding: 20px;
            font-size: 18px;
            font-weight: 700;
            color: #2D3748;
            border-bottom: 2px solid #E2E8F0;
            margin-bottom: 20px;
        `;
        tituloImpressao.innerHTML = `
            📊 Relatório de Contagem - SICGM
            <br>
            <span style="font-size: 12px; font-weight: 400; color: #718096;">
                Gerado em: ${new Date().toLocaleString('pt-BR')} | Perfil: ${perfilUsuario}
            </span>
        `;
        
        const tabelaContainer = document.querySelector('.tabela-container');
        if (tabelaContainer) {
            tabelaContainer.prepend(tituloImpressao);
            tituloImpressao.style.display = 'block';
        }
        
        const styleImpressao = document.createElement('style');
        styleImpressao.id = 'style-impressao';
        styleImpressao.textContent = `
            @media print {
                .filtros-relatorio, .stats-container, .tabela-actions, 
                .btn-voltar-home, .header-container .title, 
                #filtro-resultado, .loading-message, #mensagem,
                .divergencia-resumo {
                    display: none !important;
                }
                #titulo-impressao {
                    display: block !important;
                }
                .tabela-container {
                    margin-top: 0 !important;
                }
                table {
                    font-size: 9px !important;
                }
                thead th {
                    background: #4299E1 !important;
                    color: white !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .badge-tipo {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .badge-trafo { background: #EBF8FF !important; }
                .badge-bobina { background: #FAF5FF !important; }
                .badge-concreto { background: #F0FFF4 !important; }
                body {
                    padding: 0 !important;
                    margin: 0 !important;
                }
                .container {
                    max-width: 100% !important;
                    padding: 10px !important;
                }
                .form-card {
                    padding: 10px !important;
                    box-shadow: none !important;
                    border: none !important;
                }
                .btn-navegacao {
                    display: none !important;
                }
                .total-row {
                    background-color: #EDF2F7 !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `;
        document.head.appendChild(styleImpressao);
        
        window.print();
        
        setTimeout(() => {
            const titulo = document.getElementById('titulo-impressao');
            if (titulo) titulo.remove();
            const style = document.getElementById('style-impressao');
            if (style) style.remove();
        }, 1000);
        
        mostrarToast('✅ PDF gerado com sucesso!', 'sucesso');
    }, 500);
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO - TOPO E FIM
// ============================================

function irParaTopo() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function irParaFim() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
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
// INICIALIZAR
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (!sessao) {
        window.location.href = '../index.html';
        return;
    }
    
    try {
        const dadosSessao = JSON.parse(sessao);
        perfilUsuario = dadosSessao.perfil || 'OPERACIONAL';
        console.log(`👤 Perfil do usuário: ${perfilUsuario}`);
        
        // Mostrar badge de perfil no título
        const perfilBadge = document.createElement('span');
        perfilBadge.style.cssText = `
            display: inline-block;
            background: ${perfilUsuario === 'GESTAO' ? '#48BB78' : perfilUsuario === 'OPERACIONAL' ? '#4299E1' : '#ED8936'};
            color: white;
            padding: 2px 12px;
            border-radius: 12px;
            font-size: 0.6em;
            font-weight: 600;
            margin-left: 10px;
            vertical-align: middle;
        `;
        perfilBadge.textContent = perfilUsuario;
        
        const title = document.querySelector('.header-container .title');
        if (title) {
            title.appendChild(perfilBadge);
        }
        
        // Ocultar elementos que só devem aparecer para GESTÃO
        const divergenciaResumo = document.getElementById('divergencia-resumo');
        if (divergenciaResumo && perfilUsuario !== 'GESTAO') {
            divergenciaResumo.style.display = 'none';
        }
        
        // Ajustar largura da tabela baseado no perfil
        const table = document.getElementById('relatorio-tabela');
        if (table) {
            if (perfilUsuario === 'GESTAO') {
                table.style.minWidth = '1100px';
            } else {
                table.style.minWidth = '700px';
            }
        }
        
    } catch (e) {
        console.error('❌ Erro ao ler sessão:', e);
        perfilUsuario = 'OPERACIONAL';
    }
    
    console.log('🚀 Inicializando página de relatórios...');
    
    window.addEventListener('scroll', controlarBotoesNavegacao);
    window.addEventListener('load', function() {
        setTimeout(controlarBotoesNavegacao, 500);
    });
    window.addEventListener('resize', controlarBotoesNavegacao);
    
    await carregarPosicaoEstoque();
    carregarRelatorios();
});

// ============================================
// EXPOR FUNÇÕES GLOBAIS
// ============================================

window.carregarRelatorios = carregarRelatorios;
window.limparFiltros = limparFiltros;
window.exportarExcel = exportarExcel;
window.exportarPDF = exportarPDF;
window.redirecionarParaHome = redirecionarParaHome;
window.irParaTopo = irParaTopo;
window.irParaFim = irParaFim;
window.controlarBotoesNavegacao = controlarBotoesNavegacao;