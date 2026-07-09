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
        const response = await fetch('../data/posicao-de-estoque.txt');
        if (!response.ok) {
            console.warn('⚠️ Arquivo posicao-de-estoque.txt não encontrado');
            return;
        }
        
        const texto = await response.text();
        const linhas = texto.trim().split('\n');
        
        // Pular cabeçalho
        for (let i = 1; i < linhas.length; i++) {
            const linha = linhas[i].trim();
            if (!linha) continue;
            
            // Separar por tabulação
            const partes = linha.split('\t');
            if (partes.length >= 7) {
                const codmat = partes[1].trim(); // coluna 2 (índice 1)
                const saldoOper = parseFloat(partes[6].trim()) || 0; // coluna 7 (índice 6)
                
                if (codmat) {
                    posicaoEstoque[codmat] = saldoOper;
                }
            }
        }
        
        console.log('📦 Posição de estoque carregada:', Object.keys(posicaoEstoque).length, 'códigos');
    } catch (error) {
        console.error('❌ Erro ao carregar posição de estoque:', error);
    }
}

// ============================================
// CARREGAR DADOS DO D1
// ============================================

async function carregarDados() {
    try {
        mostrarToast('⏳ Carregando dados...', 'info');
        
        const response = await fetch(`${API_URL}/api/dados`);
        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }
        
        const dados = await response.json();
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
    const bobinasUnicas = new Set();
    
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
                // Para bobinas, contar itens únicos por tombamento
                bobinas_unicas: new Set()
            };
        }
        
        grupos[codigo].quantidade_total += parseFloat(item.qtd) || 0;
        grupos[codigo].registros.push(item);
        
        // Para bobinas, adicionar tombamento ao set de únicos
        if (item.tipo_material === 'bobina' && item.tombamento) {
            grupos[codigo].bobinas_unicas.add(item.tombamento);
            bobinasUnicas.add(item.tombamento);
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
    
    if (loading) loading.style.display = 'none';
    
    if (!dados || dados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" class="text-center">📭 Nenhum dado encontrado para os filtros selecionados</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    let totalBobinasUnicas = 0;
    
    dados.forEach(item => {
        const badgeClass = `badge-${item.tipo_material}`;
        const tipoLabel = item.tipo_material.charAt(0).toUpperCase() + item.tipo_material.slice(1);
        
        // Buscar saldo sistemico
        const saldoSistemico = posicaoEstoque[item.codigo] || 0;
        const saldoFisico = item.quantidade_total;
        
        // Calcular acuracidade
        let acuracidade = '-';
        if (saldoSistemico > 0) {
            const diferenca = Math.abs(saldoFisico - saldoSistemico);
            const percentual = ((1 - (diferenca / saldoSistemico)) * 100);
            acuracidade = percentual.toFixed(1) + '%';
            
            // Colorir baseado no percentual
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
            totalBobinasUnicas += item.bobinas_unicas.size;
        }
        
        html += `
            <tr>
                <td><strong>${item.codigo}</strong></td>
                <td>${item.descricao}</td>
                <td>${item.und}</td>
                <td><span class="badge-tipo ${badgeClass}">${tipoLabel}</span></td>
                <td><strong>${item.quantidade_total.toFixed(2)}</strong></td>
                <td>${saldoSistemico.toFixed(2)}</td>
                <td>${acuracidade}</td>
                <td>${bobinasUnicasCount}</td>
                <td>${item.ultimo_usuario || '-'}</td>
                <td>${formatarDataHora(item.ultima_data)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Atualizar contador de bobinas únicas no total
    document.getElementById('total-bobinas-unicas').textContent = totalBobinasUnicas;
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
        // Buscar dados
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
        // Cabeçalho
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
                    table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
                    th { background-color: #4299E1; color: white; font-weight: bold; padding: 8px 12px; border: 1px solid #2B6CB0; }
                    td { padding: 6px 12px; border: 1px solid #CBD5E0; }
                    .text-center { text-align: center; }
                    .badge-trafo { background: #EBF8FF; }
                    .badge-bobina { background: #FAF5FF; }
                    .badge-concreto { background: #F0FFF4; }
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
                            <th>Acuracidade</th>
                            <th>Bobinas Únicas</th>
                            <th>Último Usuário</th>
                            <th>Data da Última</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // Dados
        linhas.forEach(linha => {
            const colunas = linha.querySelectorAll('td');
            if (colunas.length > 0 && !linha.textContent.includes('Nenhum dado')) {
                htmlContent += `<tr>`;
                colunas.forEach(col => {
                    let texto = col.textContent.trim();
                    // Remover tags HTML (cores, etc)
                    texto = texto.replace(/<[^>]*>/g, '').trim();
                    htmlContent += `<td>${texto}</td>`;
                });
                htmlContent += `</tr>`;
            }
        });
        
        htmlContent += `
                    </tbody>
                </table>
                <br>
                <p style="font-size: 10px; color: #718096;">
                    * Relatório gerado automaticamente pelo sistema SICGM
                </p>
            </body>
            </html>
        `;
        
        // Criar blob com o conteúdo HTML
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
    // Verificar se há dados
    const tbody = document.getElementById('relatorio-body');
    const linhas = tbody.querySelectorAll('tr');
    
    if (linhas.length === 0 || linhas[0].textContent.includes('Nenhum dado')) {
        mostrarToast('⚠️ Não há dados para exportar', 'aviso');
        return;
    }
    
    mostrarToast('🔄 Preparando PDF...', 'info');
    
    setTimeout(() => {
        // Salvar título original
        const tituloOriginal = document.querySelector('.tabela-header h2')?.textContent || '';
        
        // Criar título para impressão
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
        
        // Adicionar título para impressão
        const tabelaContainer = document.querySelector('.tabela-container');
        if (tabelaContainer) {
            tabelaContainer.prepend(tituloImpressao);
            tituloImpressao.style.display = 'block';
        }
        
        // Adicionar estilo para impressão
        const styleImpressao = document.createElement('style');
        styleImpressao.id = 'style-impressao';
        styleImpressao.textContent = `
            @media print {
                .filtros-relatorio, .stats-container, .tabela-actions, 
                .btn-voltar-home, .header-container .title, 
                #filtro-resultado, .loading-message, #mensagem {
                    display: none !important;
                }
                #titulo-impressao {
                    display: block !important;
                }
                .tabela-container {
                    margin-top: 0 !important;
                }
                table {
                    font-size: 10px !important;
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
            }
        `;
        document.head.appendChild(styleImpressao);
        
        // Imprimir
        window.print();
        
        // Remover elementos de impressão após a impressão
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
// INICIALIZAR
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // Verificar sessão
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (!sessao) {
        window.location.href = '../index.html';
        return;
    }
    
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