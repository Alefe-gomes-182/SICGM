// js/busca-trafo.js

// URL da sua API no Cloudflare
const API_URL = 'https://busca-trafo-worker.alefe-gomes-72f.workers.dev';

let currentFilters = {};
let currentData = [];
let currentSort = { field: 'codigo', direction: 'asc' };

const statusMap = {
    'Estoque': 'estoque',
    'Obra': 'obra',
    'Transferido': 'transferido',
    'Falta': 'falta'
};

// ============================================
// ORDENAÇÃO
// ============================================
function ordenarPor(campo) {
    const th = document.querySelector(`th[data-sort="${campo}"]`);
    if (!th) return;

    // Alterna direção se for o mesmo campo
    if (currentSort.field === campo) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = campo;
        currentSort.direction = 'asc';
    }

    // Remove classes de ordenação de todos os th
    document.querySelectorAll('th.sortable').forEach(el => {
        el.classList.remove('sorted-asc', 'sorted-desc');
    });

    // Adiciona classe ao th atual
    th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');

    // Aplica ordenação
    aplicarOrdenacao();
}

function aplicarOrdenacao() {
    if (!currentData || currentData.length === 0) return;

    const sorted = [...currentData];
    const field = currentSort.field;
    const direction = currentSort.direction;

    sorted.sort((a, b) => {
        let valA, valB;

        switch(field) {
            case 'codigo':
                valA = a.Cod_Mat || '';
                valB = b.Cod_Mat || '';
                break;
            case 'descricao':
                valA = a.Descricao_Material || '';
                valB = b.Descricao_Material || '';
                break;
            case 'fabricante':
                valA = a.Fabricante || '';
                valB = b.Fabricante || '';
                break;
            case 'serie':
                valA = a.Numero_Serie || '';
                valB = b.Numero_Serie || '';
                break;
            case 'tombamento':
                valA = a.Tombamento || '';
                valB = b.Tombamento || '';
                break;
            case 'status':
                valA = a.Status || '';
                valB = b.Status || '';
                break;
            case 'data':
                valA = a.Dt_Recebimento_Energisa || '0000-00-00';
                valB = b.Dt_Recebimento_Energisa || '0000-00-00';
                break;
            default:
                return 0;
        }

        // Comparação
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    renderizarTabela(sorted);
}

// ============================================
// RENDERIZAR TABELA
// ============================================
function renderizarTabela(dados) {
    const corpoTabela = document.getElementById('tabelaCorpo');
    const totalRegistros = document.getElementById('totalRegistros');

    if (!dados || dados.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px;">Nenhum transformador encontrado.</td></tr>`;
        totalRegistros.textContent = '0';
        atualizarStats([]);
        return;
    }

    totalRegistros.textContent = dados.length;
    atualizarStats(dados);

    let html = '';
    dados.forEach(row => {
        const statusClass = statusMap[row.Status] || 'estoque';
        html += `
            <tr>
                <td><strong>${row.Cod_Mat || '-'}</strong></td>
                <td>${row.Descricao_Material || '-'}</td>
                <td>${row.Fabricante || '-'}</td>
                <td>${row.Numero_Serie || '-'}</td>
                <td>${row.Tombamento || '-'}</td>
                <td><span class="status-badge status-${statusClass}">${row.Status || 'Desconhecido'}</span></td>
                <td>${row.Dt_Recebimento_Energisa || '-'}</td>
                <td>${row.Dt_Saida || '-'}</td>
                <td style="max-width:150px; word-break:break-word;">${row.Historico_Transf || '-'}</td>
                <td style="max-width:150px; word-break:break-word;">${row.Obra_SS || '-'}</td>
            </tr>
        `;
    });

    corpoTabela.innerHTML = html;
}

// ============================================
// ATUALIZAR ESTATÍSTICAS
// ============================================
function atualizarStats(dados) {
    const statusCounts = {
        'Estoque': 0,
        'Obra': 0,
        'Transferido': 0,
        'Falta': 0
    };

    dados.forEach(row => {
        const status = row.Status || '';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });

    document.getElementById('statusEstoque').textContent = statusCounts['Estoque'];
    document.getElementById('statusObra').textContent = statusCounts['Obra'];
    document.getElementById('statusTransferido').textContent = statusCounts['Transferido'];
    document.getElementById('statusFalta').textContent = statusCounts['Falta'];
}

// ============================================
// CARREGAR TRANSFORMADORES
// ============================================
async function carregarTransformadores(filters = {}) {
    const corpoTabela = document.getElementById('tabelaCorpo');
    const statsDiv = document.getElementById('stats');

    const filtrosLimpos = {};
    for (const [key, value] of Object.entries(filters)) {
        if (value && value.trim() !== '') {
            filtrosLimpos[key] = value.trim();
        }
    }

    corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px;">⏳ Carregando...</td></tr>`;

    try {
        const response = await fetch(`${API_URL}/api/buscar-trafo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filters: filtrosLimpos })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Erro ao carregar dados.');
        }

        currentData = data.data || [];
        aplicarOrdenacao();

    } catch (error) {
        console.error('Erro ao buscar transformadores:', error);
        document.getElementById('totalRegistros').textContent = '0';
        corpoTabela.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px; color: red;">❌ Erro: ${error.message}</td></tr>`;
    }
}

// ============================================
// LIMPAR FILTROS
// ============================================
function limparFiltros() {
    document.getElementById('filtroCodMat').value = '';
    document.getElementById('filtroDescricao').value = '';
    document.getElementById('filtroFabricante').value = '';
    document.getElementById('filtroSerie').value = '';
    document.getElementById('filtroTombamento').value = '';
    document.getElementById('filtroStatus').value = '';
    document.getElementById('filtroDataInicio').value = '';
    document.getElementById('filtroDataFim').value = '';
    document.getElementById('filtroOrdenacao').value = 'codigo';
    
    currentSort = { field: 'codigo', direction: 'asc' };
    
    // Remove classes de ordenação
    document.querySelectorAll('th.sortable').forEach(el => {
        el.classList.remove('sorted-asc', 'sorted-desc');
    });
    
    // Adiciona classe ao primeiro th
    const primeiroTh = document.querySelector('th[data-sort="codigo"]');
    if (primeiroTh) primeiroTh.classList.add('sorted-asc');
    
    carregarTransformadores({});
}

// ============================================
// CONFIGURAR EVENTOS
// ============================================
function configurarEventos() {
    const btnBuscar = document.getElementById('btnBuscar');
    const btnLimpar = document.getElementById('btnLimparFiltros');

    btnBuscar.addEventListener('click', () => {
        const dataInicio = document.getElementById('filtroDataInicio').value;
        const dataFim = document.getElementById('filtroDataFim').value;
        
        currentFilters = {
            codMat: document.getElementById('filtroCodMat').value,
            descricao: document.getElementById('filtroDescricao').value,
            fabricante: document.getElementById('filtroFabricante').value,
            numeroSerie: document.getElementById('filtroSerie').value,
            tombamento: document.getElementById('filtroTombamento').value,
            status: document.getElementById('filtroStatus').value,
            dataInicio: dataInicio,
            dataFim: dataFim
        };
        
        // Aplica ordenação selecionada
        const ordenacao = document.getElementById('filtroOrdenacao').value;
        switch(ordenacao) {
            case 'codigo':
                currentSort = { field: 'codigo', direction: 'asc' };
                break;
            case 'codigo-desc':
                currentSort = { field: 'codigo', direction: 'desc' };
                break;
            case 'descricao':
                currentSort = { field: 'descricao', direction: 'asc' };
                break;
            case 'descricao-desc':
                currentSort = { field: 'descricao', direction: 'desc' };
                break;
            case 'data':
                currentSort = { field: 'data', direction: 'desc' };
                break;
            case 'data-desc':
                currentSort = { field: 'data', direction: 'asc' };
                break;
            case 'status':
                currentSort = { field: 'status', direction: 'asc' };
                break;
            case 'status-desc':
                currentSort = { field: 'status', direction: 'desc' };
                break;
            default:
                currentSort = { field: 'codigo', direction: 'asc' };
        }
        
        // Atualiza classes de ordenação nos cabeçalhos
        document.querySelectorAll('th.sortable').forEach(el => {
            el.classList.remove('sorted-asc', 'sorted-desc');
        });
        const th = document.querySelector(`th[data-sort="${currentSort.field}"]`);
        if (th) {
            th.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
        
        carregarTransformadores(currentFilters);
    });

    btnLimpar.addEventListener('click', limparFiltros);

    // Enter nos inputs
    document.querySelectorAll('.filtro-item input').forEach(input => {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnBuscar.click();
            }
        });
    });
}

// ============================================
// INICIAR APLICAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    configurarEventos();
    
    // Ordenação padrão: código ascendente
    currentSort = { field: 'codigo', direction: 'asc' };
    const primeiroTh = document.querySelector('th[data-sort="codigo"]');
    if (primeiroTh) primeiroTh.classList.add('sorted-asc');
    
    carregarTransformadores({});
});