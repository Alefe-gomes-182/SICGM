// ============================================
// RELATÓRIOS - SICGM
// ============================================

const API_URL = 'https://noisy-snow-0359.alefe-gomes-72f.workers.dev';

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
        
        // Caminho relativo para o arquivo na pasta data
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
        
        // O cabeçalho é: "codmat	dscmat	codund_mda_mat	vlrult_cot	saldo_oper"
        // Pular a primeira linha (cabeçalho)
        let linhasProcessadas = 0;
        
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;
            
            // Separar por tabulação
            const partes = linha.split('\t');
            
            // Verificar se tem pelo menos 5 colunas
            if (partes.length >= 5) {
                // Mapeamento correto das colunas:
                // 0: codmat, 1: dscmat, 2: codund_mda_mat, 3: vlrult_cot, 4: saldo_oper
                const codmat = partes[0].trim();
                const dscmat = partes[1]?.trim() || '';
                const codund = partes[2]?.trim() || '';
                
                // Converter valor (pode vir com vírgula decimal)
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
        console.log(`📊 Exemplo dos primeiros 3 itens:`, Object.values(posicaoEstoque).slice(0, 3));
        
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
// PROCESSAR DADOS PARA RELATÓRIO
// ============================================

function processarDados(dados, filtros) {
    // Filtrar apenas ativos
    let dadosFiltrados = dados.filter(item => item.ativo === 1 || item.ativo === true);
    
    // Aplicar filtros
    if (filtros) {
        // Filtro de data
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
        
        // Filtro de tipo de material
        if (filtros.tipoMaterial) {
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.tipo_material === filtros.tipoMaterial
            );
        }
        
        // Filtro de código
        if (filtros.codigo && filtros.codigo.trim()) {
            const codigoBusca = filtros.codigo.trim();
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.codigo && item.codigo.includes(codigoBusca)
            );
        }
    }
    
    // Agrupar por código
    const grupos = {};
    
    dadosFiltrados.forEach(item => {
        const codigo = item.codigo;
        if (!grupos[codigo]) {
            grupos[codigo] = {
                codigo: codigo,
                descricao: item.descricao || codigo,
                und: item.und || '-',
                tipo_material: item.tipo_material || 'desconhecido',
                quantidade_total: 0,
                ultima_contagem: null,
                ultimo_usuario: null,
                ultima_data: null,
                registros: [],
                bobinas_unicas: new Set()
            };
        }
        
        grupos[codigo].quantidade_total += parseFloat(item.qtd) || 0;
        grupos[codigo].registros.push(item);
        
        // Para bobinas, adicionar tombamento ao set de únicos
        if (item.tipo_material === 'bobina' && item.tombamento) {
            grupos[codigo].bobinas_unicas.add(item.tombamento);
        }
        
        // Atualizar última contagem
        const dataItem = new Date(item.created_at || item.data);
        if (!grupos[codigo].ultima_data || dataItem > new Date(grupos[codigo].ultima_data)) {
            grupos[codigo].ultima_contagem = item.qtd;
            grupos[codigo].ultimo_usuario = item.nome;
            grupos[codigo].ultima_data = item.created_at || item.data;
        }
    });
    
    // Converter para array e ordenar por código
    const resultado = Object.values(grupos);
    resultado.sort((a, b) => a.codigo.localeCompare(b.codigo));
    
    return resultado;
}

// ============================================
// RENDERIZAR RELATÓRIO
// ============================================

function renderizarRelatorio(dados) {
    const tbody = document.getElementById('relatorio-body');
    const loading = document.getElementById('loading-relatorio');
    const resumoDiv = document.getElementById('divergencia-resumo');
    
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
    
    let html = '';
    let totalDivergenciaQtd = 0;
    let totalDivergenciaValor = 0;
    let totalItensDivergentes = 0;
    let itensComDivergencia = [];
    
    dados.forEach(item => {
        const badgeClass = `badge-${item.tipo_material}`;
        const tipoLabel = item.tipo_material.charAt(0).toUpperCase() + item.tipo_material.slice(1);
        
        // Buscar dados da posição de estoque
        const estoque = getPosicaoEstoque(item.codigo);
        const saldoSistemico = estoque ? estoque.saldo_sistemico : 0;
        const valorUnitario = estoque ? estoque.valor_unitario : 0;
        const descricaoEstoque = estoque ? estoque.descricao : '';
        const undEstoque = estoque ? estoque.und : '';
        
        // Usar descrição do estoque se disponível, senão a do banco
        const descricaoFinal = descricaoEstoque || item.descricao || item.codigo;
        const undFinal = undEstoque || item.und || '-';
        
        const saldoFisico = item.quantidade_total;
        
        // Calcular divergência
        const divergenciaQtd = saldoFisico - saldoSistemico;
        const divergenciaValor = divergenciaQtd * valorUnitario;
        
        // Acumular totais
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
        
        // Calcular acuracidade
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
        
        // Contar bobinas únicas
        let bobinasUnicasCount = '-';
        if (item.tipo_material === 'bobina' && item.bobinas_unicas) {
            bobinasUnicasCount = item.bobinas_unicas.size;
        }
        
        // Cor da divergência
        let divergenciaQtdDisplay = divergenciaQtd.toFixed(2);
        let divergenciaValorDisplay = formatarMoeda(divergenciaValor);
        
        if (divergenciaQtd > 0) {
            divergenciaQtdDisplay = `<span style="color: #48BB78; font-weight: 600;">▲ +${divergenciaQtd.toFixed(2)}</span>`;
            divergenciaValorDisplay = `<span style="color: #48BB78; font-weight: 600;">${formatarMoeda(divergenciaValor)}</span>`;
        } else if (divergenciaQtd < 0) {
            divergenciaQtdDisplay = `<span style="color: #FC8181; font-weight: 600;">▼ ${divergenciaQtd.toFixed(2)}</span>`;
            divergenciaValorDisplay = `<span style="color: #FC8181; font-weight: 600;">${formatarMoeda(divergenciaValor)}</span>`;
        }
        
        // Valor unitário
        const valorUnitarioDisplay = valorUnitario > 0 ? formatarMoeda(valorUnitario) : '-';
        
        html += `
            <tr>
                <td><strong>${item.codigo}</strong></td>
                <td>${descricaoFinal}</td>
                <td>${undFinal}</td>
                <td><span class="badge-tipo ${badgeClass}">${tipoLabel}</span></td>
                <td><strong>${saldoFisico.toFixed(2)}</strong></td>
                <td>${saldoSistemico.toFixed(2)}</td>
                <td>${divergenciaQtdDisplay}</td>
                <td>${valorUnitarioDisplay}</td>
                <td>${divergenciaValorDisplay}</td>
                <td>${acuracidade}</td>
                <td>${bobinasUnicasCount}</td>
                <td>${item.ultimo_usuario || '-'}</td>
                <td>${formatarDataHora(item.ultima_data)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Atualizar resumo de divergências
    if (resumoDiv) {
        if (totalItensDivergentes > 0) {
            resumoDiv.style.display = 'block';
            document.getElementById('total-divergencia-valor').textContent = formatarMoeda(totalDivergenciaValor);
            document.getElementById('total-divergencia-qtd').textContent = totalDivergenciaQtd.toFixed(2);
            document.getElementById('total-itens-divergentes').textContent = totalItensDivergentes;
            
            // Log dos itens divergentes para debug
            console.log('📊 Itens com divergência:', itensComDivergencia);
        } else {
            resumoDiv.style.display = 'none';
        }
    }
}

// ============================================
// ATUALIZAR ESTATÍSTICAS
// ============================================

function atualizarEstatisticas(dados, dadosBrutos) {
    // Total de registros ativos
    const totalRegistros = dadosBrutos ? dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true).length : 0;
    document.getElementById('total-registros').textContent = totalRegistros;
    
    // Códigos únicos
    document.getElementById('total-codigos').textContent = dados ? dados.length : 0;
    
    // Última contagem
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
    
    // Total por tipo de material
    if (dadosBrutos) {
        const ativos = dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true);
        
        // Trafos
        const trafos = ativos.filter(i => i.tipo_material === 'trafo');
        const totalTrafos = trafos.reduce((sum, item) => sum + (parseFloat(item.qtd) || 0), 0);
        document.getElementById('total-trafos').textContent = totalTrafos.toFixed(0);
        
        // Bobinas
        const bobinas = ativos.filter(i => i.tipo_material === 'bobina');
        const totalBobinas = bobinas.reduce((sum, item) => sum + (parseFloat(item.qtd) || 0), 0);
        document.getElementById('total-bobinas').textContent = totalBobinas.toFixed(0);
        
        // Concretos
        const concretos = ativos.filter(i => i.tipo_material === 'concreto');
        const totalConcretos = concretos.reduce((sum, item) => sum + (parseFloat(item.qtd) || 0), 0);
        document.getElementById('total-concretos').textContent = totalConcretos.toFixed(0);
    }
}

// ============================================
// CARREGAR RELATÓRIOS COM FILTROS
// ============================================

async function carregarRelatorios() {
    const loading = document.getElementById('loading-relatorio');
    if (loading) loading.style.display = 'block';
    
    try {
        // Buscar dados do banco
        const dadosBrutos = await carregarDados();
        
        if (!dadosBrutos || dadosBrutos.length === 0) {
            mostrarToast('⚠️ Nenhum dado encontrado no banco', 'aviso');
            if (loading) loading.style.display = 'none';
            return;
        }
        
        // Coletar filtros
        const filtros = {
            dataInicio: document.getElementById('filtro-data-inicio')?.value || '',
            dataFim: document.getElementById('filtro-data-fim')?.value || '',
            tipoMaterial: document.getElementById('filtro-tipo-material')?.value || '',
            codigo: document.getElementById('filtro-codigo')?.value || ''
        };
        
        // Processar dados
        const dadosProcessados = processarDados(dadosBrutos, filtros);
        
        // Renderizar
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
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>UND</th>
                            <th>Tipo</th>
                            <th>QTD Física</th>
                            <th>Saldo Sistêmico</th>
                            <th>Divergência QTD</th>
                            <th>Valor Unitário</th>
                            <th>Valor Divergência</th>
                            <th>Acuracidade</th>
                            <th>Bobinas Únicas</th>
                            <th>Último Usuário</th>
                            <th>Data da Última</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalDivergenciaQtd = 0;
        let totalDivergenciaValor = 0;
        
        linhas.forEach(linha => {
            const colunas = linha.querySelectorAll('td');
            if (colunas.length > 0 && !linha.textContent.includes('Nenhum dado')) {
                let valores = [];
                colunas.forEach(col => {
                    let texto = col.textContent.trim();
                    texto = texto.replace(/<[^>]*>/g, '').trim();
                    texto = texto.replace(/[▲▼+]/g, '').trim();
                    valores.push(texto);
                });
                
                // Tentar extrair divergência para total
                if (valores.length >= 9) {
                    const divText = valores[6].trim().replace(/[^0-9,.-]/g, '');
                    const divValor = parseFloat(divText.replace(',', '.')) || 0;
                    totalDivergenciaQtd += divValor;
                    
                    const valText = valores[8].trim().replace(/[^0-9,.-]/g, '');
                    const valValor = parseFloat(valText.replace(',', '.')) || 0;
                    totalDivergenciaValor += valValor;
                }
                
                htmlContent += `<tr><td>${valores.join('</td><td>')}</td></tr>`;
            }
        });
        
        // Linha de total
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
                Gerado em: ${new Date().toLocaleString('pt-BR')}
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
    // Verificar sessão
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (!sessao) {
        window.location.href = '../index.html';
        return;
    }
    
    console.log('🚀 Inicializando página de relatórios...');
    
    // Inicializar botões de navegação
    window.addEventListener('scroll', controlarBotoesNavegacao);
    window.addEventListener('load', function() {
        setTimeout(controlarBotoesNavegacao, 500);
    });
    window.addEventListener('resize', controlarBotoesNavegacao);
    
    // Carregar posição de estoque
    await carregarPosicaoEstoque();
    
    // Carregar relatórios
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