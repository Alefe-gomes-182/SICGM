// ============================================
// HOME GESTÃO - CONFIGURAÇÃO E FUNÇÕES
// ============================================

// ============================================
// CONFIGURAÇÃO DOS DEPARTAMENTOS E FUNÇÕES
// ============================================
const DEPARTAMENTOS = {
    'DCMD': {
        nome: 'DCMD',
        titulo: 'Departamento de Controle de Materiais e Documentos',
        descricao: 'Gerencie contagens diárias, lista MGM e relatórios do departamento.',
        funcoes: [
            {
                id: 'contagem-diaria-dcmd',
                nome: 'Contagem Diária',
                icone: '📊',
                link: 'contagem-diaria/index.html',
                status: 'disponivel',
                descricao: 'Registre e visualize as contagens diárias'
            },
            {
                id: 'mgm-list-dcmd',
                nome: 'Lista MGM',
                icone: '📋',
                link: 'mgm-list/index.html',
                status: 'disponivel',
                descricao: 'Gerencie a lista de materiais MGM'
            },
            {
                id: 'relatorios-dcmd',
                nome: 'Relatórios',
                icone: '📈',
                link: '#',
                status: 'disponivel',
                descricao: 'Relatórios de contagem e busca trafo',
                temDropdown: true,
                dropdownItems: [
                    { nome: 'Relatório de Contagem', link: 'relatorios/relatorio-contagem.html', badge: 'Ativo' },
                    { nome: 'Busca Trafo', link: 'relatorios/busca-trafo.html', badge: 'Novo' },
                    { nome: 'Histórico de Movimentações', link: '#', badge: 'Em breve', disabled: true }
                ]
            }
        ]
    },
    'DMPC': {
        nome: 'DMPC',
        titulo: 'Departamento de Materiais e Patrimônio',
        descricao: 'Gerencie contagens diárias, S.A. emergencial e relatórios do departamento.',
        funcoes: [
            {
                id: 'contagem-diaria-dmpc',
                nome: 'Contagem Diária',
                icone: '📊',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Registre e visualize as contagens diárias (em desenvolvimento)'
            },
            {
                id: 'sa-emergencial-dmpc',
                nome: 'S.A. Emergencial',
                icone: '🚨',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Solicitação de atendimento emergencial (em desenvolvimento)'
            },
            {
                id: 'relatorios-dmpc',
                nome: 'Relatórios',
                icone: '📈',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Relatórios do DMPC (em desenvolvimento)'
            }
        ]
    },
    'DECP': {
        nome: 'DECP',
        titulo: 'Departamento de Equipamentos e Componentes',
        descricao: 'Gerencie contagens diárias, solicitação de kits e medidores em reforma.',
        funcoes: [
            {
                id: 'contagem-diaria-decp',
                nome: 'Contagem Diária',
                icone: '📊',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Registre e visualize as contagens diárias (em desenvolvimento)'
            },
            {
                id: 'solicitacao-kit-decp',
                nome: 'Solicitação de Kit',
                icone: '📦',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Solicite kits de equipamentos (em desenvolvimento)'
            },
            {
                id: 'medidores-reforma-decp',
                nome: 'Medidores - Reforma',
                icone: '🔧',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Controle de medidores em reforma (em desenvolvimento)'
            },
            {
                id: 'relatorios-decp',
                nome: 'Relatórios',
                icone: '📈',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Relatórios do DECP (em desenvolvimento)'
            }
        ]
    },
    'DEOP': {
        nome: 'DEOP',
        titulo: 'Departamento de Operações',
        descricao: 'Gerencie contagens diárias, solicitação de kits, medidores em reforma e relatórios.',
        funcoes: [
            {
                id: 'contagem-diaria-deop',
                nome: 'Contagem Diária',
                icone: '📊',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Registre e visualize as contagens diárias (em desenvolvimento)'
            },
            {
                id: 'solicitacao-kit-deop',
                nome: 'Solicitação de Kit',
                icone: '📦',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Solicite kits de equipamentos (em desenvolvimento)'
            },
            {
                id: 'medidores-reforma-deop',
                nome: 'Medidores - Reforma',
                icone: '🔧',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Controle de medidores em reforma (em desenvolvimento)'
            },
            {
                id: 'relatorios-deop',
                nome: 'Relatórios',
                icone: '📈',
                link: '#',
                status: 'desenvolvimento',
                descricao: 'Relatórios do DEOP (em desenvolvimento)'
            }
        ]
    }
};

// ============================================
// FUNÇÕES DE SELEÇÃO E RENDERIZAÇÃO
// ============================================
let departamentoAtual = 'DCMD';

/**
 * Seleciona um departamento e atualiza a interface
 * @param {string} deptoId - ID do departamento (DCMD, DMPC, DECP, DEOP)
 */
function selecionarDepartamento(deptoId) {
    departamentoAtual = deptoId;
    
    // Atualiza botões
    document.querySelectorAll('.departamento-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.depto === deptoId);
    });
    
    // Renderiza conteúdo
    renderizarDepartamento(deptoId);
}

/**
 * Renderiza o conteúdo do departamento selecionado
 * @param {string} deptoId - ID do departamento
 */
function renderizarDepartamento(deptoId) {
    const container = document.getElementById('deptoContent');
    const depto = DEPARTAMENTOS[deptoId];
    
    if (!depto) {
        container.innerHTML = `<div class="depto-empty"><p>Departamento não encontrado.</p></div>`;
        return;
    }

    let html = `
        <div class="depto-header">
            <h2 class="depto-title">${depto.nome} - ${depto.titulo}</h2>
            <p class="depto-subtitle">${depto.descricao}</p>
        </div>
        <div class="func-grid">
    `;

    depto.funcoes.forEach(func => {
        const statusClass = func.status === 'disponivel' ? 'disponivel' : 
                           func.status === 'desenvolvimento' ? 'desenvolvimento' : 'em-breve';
        const statusLabel = func.status === 'disponivel' ? '✓ Disponível' : 
                           func.status === 'desenvolvimento' ? '⚙️ Em desenvolvimento' : '📅 Em breve';
        const isDisabled = func.status !== 'disponivel';

        if (func.temDropdown) {
            // Função com dropdown
            html += `
                <div class="func-card" onclick="toggleDropdownDepto(event, '${func.id}')" style="cursor: pointer;">
                    <div class="func-icon">${func.icone}</div>
                    <div class="func-name">
                        ${func.nome}
                        <span class="arrow-icon">▼</span>
                    </div>
                    <div class="func-status ${statusClass}">${statusLabel}</div>
                    <div class="dropdown-container">
                        <div class="dropdown-menu" id="dropdownDepto_${func.id}">
            `;
            
            func.dropdownItems.forEach(item => {
                if (item.disabled) {
                    html += `
                        <a href="#" class="dropdown-item" onclick="event.preventDefault(); mostrarEmDesenvolvimento(event)">
                            <span class="item-icon">📜</span>
                            <span class="item-label">${item.nome}</span>
                            <span class="item-badge em-breve">${item.badge}</span>
                        </a>
                    `;
                } else {
                    html += `
                        <a href="${item.link}" class="dropdown-item">
                            <span class="item-icon">📄</span>
                            <span class="item-label">${item.nome}</span>
                            <span class="item-badge">${item.badge}</span>
                        </a>
                    `;
                }
            });
            
            html += `
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Função normal
            const link = isDisabled ? '#' : func.link;
            const onclick = isDisabled ? `onclick="event.preventDefault(); mostrarEmDesenvolvimento(event)"` : '';
            
            html += `
                <a href="${link}" class="func-card ${isDisabled ? 'disabled' : ''}" ${onclick}>
                    <div class="func-icon">${func.icone}</div>
                    <div class="func-name">${func.nome}</div>
                    <div class="func-status ${statusClass}">${statusLabel}</div>
                </a>
            `;
        }
    });

    html += `
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// DROPDOWN DOS DEPARTAMENTOS
// ============================================

/**
 * Alterna a visibilidade do dropdown de uma função
 * @param {Event} event - Evento do clique
 * @param {string} funcId - ID da função
 */
function toggleDropdownDepto(event, funcId) {
    event.stopPropagation();
    const dropdown = document.getElementById(`dropdownDepto_${funcId}`);
    if (!dropdown) return;
    
    const isOpen = dropdown.classList.contains('show');
    
    // Fecha todos os outros dropdowns abertos
    document.querySelectorAll('.dropdown-menu.show').forEach(el => {
        if (el !== dropdown) el.classList.remove('show');
    });
    
    if (isOpen) {
        dropdown.classList.remove('show');
    } else {
        dropdown.classList.add('show');
    }
}

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================

/**
 * Exibe mensagem de funcionalidade em desenvolvimento
 * @param {Event} event - Evento do clique
 */
function mostrarEmDesenvolvimento(event) {
    if (event) event.preventDefault();
    alert('📜 Funcionalidade em desenvolvimento. Em breve disponível!');
}

/**
 * Atualiza o timestamp da sessão
 */
function atualizarTimestampSessao() {
    const sessao = sessionStorage.getItem('sessaoSICGM');
    if (sessao) {
        try {
            const dados = JSON.parse(sessao);
            dados.timestamp = Date.now();
            sessionStorage.setItem('sessaoSICGM', JSON.stringify(dados));
        } catch (e) {}
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const homeContent = document.getElementById('homeContent');
    
    loadingOverlay.classList.add('active');

    // Verifica sessão (função verificarSessao deve estar no script.js)
    const sessao = verificarSessao();
    
    if (!sessao) {
        console.log('🔒 Sessão inválida - Redirecionando para login');
        window.location.href = 'index.html';
        return;
    }

    if (sessao.perfil !== 'GESTAO') {
        console.log(`🔒 Perfil ${sessao.perfil} não autorizado para esta página`);
        window.location.href = 'index.html';
        return;
    }

    console.log('✅ Sessão válida para:', sessao.nome, '(GESTÃO)');
    
    try {
        document.getElementById('nomeUsuario').textContent = sessao.nome;
        document.getElementById('matriculaUsuario').textContent = `Matrícula: ${sessao.matricula}`;
        document.getElementById('perfilUsuario').textContent = sessao.perfil || 'GESTÃO';
        document.getElementById('mensagemBoasVindas').textContent = 
            `👋 Olá, ${sessao.nome}! Bem-vindo ao sistema (Gestão).`;
    } catch (e) {
        console.error('Erro ao carregar dados do usuário:', e);
        window.location.href = 'index.html';
        return;
    }

    // Renderiza o departamento inicial (DCMD)
    renderizarDepartamento('DCMD');

    setTimeout(() => {
        loadingOverlay.classList.remove('active');
        homeContent.style.display = 'block';
    }, 500);

    atualizarTimestampSessao();
});

// Fecha dropdowns ao clicar fora
document.addEventListener('click', function(event) {
    document.querySelectorAll('.dropdown-menu.show').forEach(el => {
        const card = event.target.closest('.func-card');
        if (!card || !card.querySelector(`#${el.id}`)) {
            el.classList.remove('show');
        }
    });
});

// Fecha dropdowns ao pressionar ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.dropdown-menu.show').forEach(el => {
            el.classList.remove('show');
        });
    }
});

// Atualiza timestamp da sessão em eventos
document.addEventListener('click', atualizarTimestampSessao);
document.addEventListener('keydown', atualizarTimestampSessao);

// Verifica sessão a cada 5 minutos
setInterval(function() {
    const sessao = verificarSessao();
    if (!sessao) {
        console.log('🔒 Sessão expirada - Redirecionando para login');
        window.location.href = 'index.html';
    } else if (sessao.perfil !== 'GESTAO') {
        console.log('🔒 Perfil alterado - Redirecionando');
        window.location.href = 'index.html';
    }
}, 5 * 60 * 1000);