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
        
        // Filtro de usuário
        if (filtros.usuario && filtros.usuario.trim()) {
            const usuarioBusca = filtros.usuario.toLowerCase().trim();
            dadosFiltrados = dadosFiltrados.filter(item => 
                item.nome && item.nome.toLowerCase().includes(usuarioBusca)
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
                registros: []
            };
        }
        
        grupos[codigo].quantidade_total += parseFloat(item.qtd) || 0;
        grupos[codigo].registros.push(item);
        
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
                <td colspan="8" class="text-center">📭 Nenhum dado encontrado para os filtros selecionados</td>
            </tr>
        `;
        return;
    }
    
    let html = '';
    dados.forEach(item => {
        const badgeClass = `badge-${item.tipo_material}`;
        const tipoLabel = item.tipo_material.charAt(0).toUpperCase() + item.tipo_material.slice(1);
        
        html += `
            <tr>
                <td><strong>${item.codigo}</strong></td>
                <td>${item.descricao}</td>
                <td>${item.und}</td>
                <td><span class="badge-tipo ${badgeClass}">${tipoLabel}</span></td>
                <td><strong>${item.quantidade_total.toFixed(2)}</strong></td>
                <td>${item.ultima_contagem || '-'}</td>
                <td>${item.ultimo_usuario || '-'}</td>
                <td>${formatarDataHora(item.ultima_data)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ============================================
// ATUALIZAR ESTATÍSTICAS
// ============================================

function atualizarEstatisticas(dados, dadosBrutos) {
    document.getElementById('total-registros').textContent = dadosBrutos ? dadosBrutos.filter(i => i.ativo === 1 || i.ativo === true).length : 0;
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
    
    // Total em estoque
    if (dados) {
        let total = 0;
        dados.forEach(item => {
            total += item.quantidade_total || 0;
        });
        document.getElementById('total-estoque').textContent = total.toFixed(2);
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
            usuario: document.getElementById('filtro-usuario')?.value || ''
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
    document.getElementById('filtro-usuario').value = '';
    carregarRelatorios();
}

// ============================================
// EXPORTAR CSV
// ============================================

function exportarCSV() {
    const tbody = document.getElementById('relatorio-body');
    const linhas = tbody.querySelectorAll('tr');
    
    if (linhas.length === 0 || linhas[0].textContent.includes('Nenhum dado')) {
        mostrarToast('⚠️ Não há dados para exportar', 'aviso');
        return;
    }
    
    // Cabeçalho
    let csv = 'Código;Descrição;UND;Tipo;Quantidade Total;Última Contagem;Último Usuário;Data da Última\n';
    
    // Dados
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll('td');
        if (colunas.length > 0 && !linha.textContent.includes('Nenhum dado')) {
            const valores = [];
            colunas.forEach(col => {
                let texto = col.textContent.trim();
                texto = texto.replace(/<[^>]*>/g, '').trim();
                valores.push(`"${texto}"`);
            });
            csv += valores.join(';') + '\n';
        }
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_contagem_${getDataBrasil()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    mostrarToast('✅ CSV exportado com sucesso!', 'sucesso');
}

// ============================================
// EXPORTAR PDF (Simples - usando print)
// ============================================

function exportarPDF() {
    mostrarToast('🔄 Preparando PDF...', 'info');
    setTimeout(() => {
        window.print();
    }, 500);
}

// ============================================
// INICIALIZAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar sessão
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (!sessao) {
        window.location.href = '../index.html';
        return;
    }
    
    // Carregar relatórios
    carregarRelatorios();
});

// ============================================
// EXPOR FUNÇÕES GLOBAIS
// ============================================

window.carregarRelatorios = carregarRelatorios;
window.limparFiltros = limparFiltros;
window.exportarCSV = exportarCSV;
window.exportarPDF = exportarPDF;
window.redirecionarParaHome = redirecionarParaHome;