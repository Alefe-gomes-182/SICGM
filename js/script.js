// Variável para armazenar os materiais carregados
let databaseMateriais = [];

// ============================================
// FUNÇÕES DA BASE DE DADOS
// ============================================

// Função para carregar materiais do arquivo de texto
async function carregarMateriais() {
    try {
        const response = await fetch('../data/materiais.txt');
        const texto = await response.text();
        
        // Dividir o texto em linhas
        const linhas = texto.split('\n');
        
        // Processar cada linha
        databaseMateriais = linhas
            .filter(linha => linha.trim() !== '') // Remove linhas vazias
            .map(linha => {
                // Divide por TAB (\t)
                const partes = linha.split('\t');
                
                if (partes.length >= 3) {
                    return {
                        codigo: partes[0].trim(),
                        descricao: partes[1].trim(),
                        und: partes[2].trim()
                    };
                }
                return null;
            })
            .filter(material => material !== null); // Remove linhas inválidas
        
        console.log('✅ Materiais carregados:', databaseMateriais.length);
        console.log('📋 Primeiros 5 materiais:', databaseMateriais.slice(0, 5));
        
    } catch (error) {
        console.error('❌ Erro ao carregar materiais:', error);
        
        // Dados de fallback
        databaseMateriais = [
            { codigo: "661185", descricao: "ABRACADEIRA R S F 1/2 X 5/8", und: "PC" },
            { codigo: "1197", descricao: "ACENDEDOR SOLDA EXOTERMICA", und: "PC" },
            { codigo: "630463", descricao: "ACENDEDOR SOLDA EXOTERMICA", und: "PC" },
            { codigo: "638861", descricao: "ACENDEDOR SOLDA EXOTERMICA", und: "PC" },
            { codigo: "620603", descricao: "ACO BELGO 50 CA50 20,00 MM", und: "PC" }
        ];
        
        console.log('⚠️ Usando dados de fallback');
    }
}

// ============================================
// FUNÇÃO PARA ATUALIZAR NUMERAÇÃO
// ============================================

function atualizarNumeracao() {
    const materialItems = document.querySelectorAll('.material-item');
    
    materialItems.forEach((item, index) => {
        const novoNumero = index + 1;
        
        // Atualizar número visível
        const materialNumber = item.querySelector('.material-number');
        if (materialNumber) {
            materialNumber.textContent = `${novoNumero}`;
        }
        
        // Atualizar ID do item
        const novoId = `material-${novoNumero}`;
        item.id = novoId;
        
        // Atualizar todos os inputs pelo tipo
        const codigoInput = item.querySelector('.input-codigo');
        const descricaoInput = item.querySelector('.input-descricao');
        const undInput = item.querySelector('.input-und');
        const qtdInput = item.querySelector('.input-qtd');
        
        if (codigoInput) {
            codigoInput.id = `codigo-${novoNumero}`;
            codigoInput.setAttribute('onchange', `buscarMaterial('${novoNumero}')`);
        }
        if (descricaoInput) {
            descricaoInput.id = `descricao-${novoNumero}`;
            descricaoInput.setAttribute('onclick', `mostrarDescricaoCompleta(this)`);
        }
        if (undInput) {
            undInput.id = `und-${novoNumero}`;
        }
        if (qtdInput) {
            qtdInput.id = `qtd-${novoNumero}`;
        }
        
        // Atualizar labels
        const labels = item.querySelectorAll('label');
        labels.forEach(label => {
            const forAttr = label.getAttribute('for');
            if (forAttr) {
                if (forAttr.includes('codigo-')) label.setAttribute('for', `codigo-${novoNumero}`);
                else if (forAttr.includes('descricao-')) label.setAttribute('for', `descricao-${novoNumero}`);
                else if (forAttr.includes('und-')) label.setAttribute('for', `und-${novoNumero}`);
                else if (forAttr.includes('qtd-')) label.setAttribute('for', `qtd-${novoNumero}`);
            }
        });
        
        // Atualizar botão remover
        const btnRemover = item.querySelector('.btn-remove-material');
        if (btnRemover) {
            btnRemover.setAttribute('onclick', `removerMaterial('${novoId}')`);
        }
    });
}

// Função para consultar material pelo código
function consultarMaterial(codigo) {
    return databaseMateriais.find(material => material.codigo === codigo);
}

function criarMaterialItem() {
    const totalItens = document.querySelectorAll('.material-item').length;
    const novoNumero = totalItens + 1;
    
    const materialItem = document.createElement('div');
    materialItem.className = 'material-item';
    materialItem.id = `material-${novoNumero}`;
    
    materialItem.innerHTML = `
        <div class="material-header">
            <span class="material-number">${novoNumero}</span>
            <button type="button" class="btn-remove-material" onclick="removerMaterial('material-${novoNumero}')">
                ✕
            </button>
        </div>
        <div class="material-row">
            <div class="material-field">
                <label for="codigo-${novoNumero}">Código</label>
                <input type="text" id="codigo-${novoNumero}" class="input-codigo" placeholder="Código" onchange="buscarMaterial('${novoNumero}')">
            </div>
            <div class="material-field">
                <label for="descricao-${novoNumero}">Descrição</label>
                <input 
                    type="text" 
                    id="descricao-${novoNumero}" 
                    class="input-descricao" 
                    placeholder="Descrição" 
                    readonly
                    onclick="mostrarDescricaoCompleta(this)"
                    title="Clique para ver descrição completa"
                >
            </div>
            <div class="material-field">
                <label for="und-${novoNumero}">UND</label>
                <input type="text" id="und-${novoNumero}" class="input-und" placeholder="UND" readonly>
            </div>
            <div class="material-field">
                <label for="qtd-${novoNumero}">Qtd. RMA</label>
                <input type="text" id="qtd-${novoNumero}" class="input-qtd" placeholder="Quantidade">
            </div>
        </div>
    `;
    
    return materialItem;
}

// Função para adicionar material
function adicionarMaterial() {
    const container = document.getElementById('materiais-container');
    
    if (!container) {
        console.error('❌ Container de materiais não encontrado!');
        return;
    }
    
    const materialItem = criarMaterialItem();
    container.appendChild(materialItem);
    
    // Focar no campo de código do novo material
    setTimeout(() => {
        const codigoInput = document.getElementById(`codigo-${materialCount}`);
        if (codigoInput) {
            codigoInput.focus();
        }
    }, 100);
    
    console.log('✅ Material #' + materialCount + ' adicionado');
}

// Função para remover material
function removerMaterial(id) {
    const materialItem = document.getElementById(id);
    if (materialItem) {
        materialItem.remove();
        console.log('🗑️ Material removido:', id);
        
        // Atualizar numeração após remover
        atualizarNumeracao();
    }
}

function buscarMaterial(id) {
    const codigoInput = document.getElementById(`codigo-${id}`);
    const descricaoInput = document.getElementById(`descricao-${id}`);
    const undInput = document.getElementById(`und-${id}`);
    const qtdInput = document.getElementById(`qtd-${id}`);
    
    if (!codigoInput || !descricaoInput || !undInput) return;
    
    const codigo = codigoInput.value.trim();
    
    if (codigo === '') {
        // LIMPAR TUDO e voltar ao normal
        descricaoInput.value = '';
        undInput.value = '';
        descricaoInput.readOnly = false;
        undInput.readOnly = false;
        
        // Voltar cores normais
        descricaoInput.style.backgroundColor = '#FFFFFF';
        undInput.style.backgroundColor = '#FFFFFF';
        descricaoInput.style.borderColor = '#E2E8F0';
        undInput.style.borderColor = '#E2E8F0';
        codigoInput.style.borderColor = '#E2E8F0';       // 👈 CORRIGIDO
        codigoInput.style.backgroundColor = '#FFFFFF';    // 👈 CORRIGIDO
        
        // Remover classes de erro e sucesso
        codigoInput.classList.remove('input-error');
        codigoInput.classList.remove('input-success');
        descricaoInput.classList.remove('input-error');
        undInput.classList.remove('input-error');
        
        // Resetar placeholder
        descricaoInput.placeholder = 'Descrição';
        undInput.placeholder = 'UND';
        
        return;
    }
    
    if (databaseMateriais.length === 0) {
        alert('Base de dados ainda está carregando...');
        return;
    }
    
    const material = consultarMaterial(codigo);
    
    if (material) {
        // Material encontrado - preencher e BLOQUEAR
        descricaoInput.value = material.descricao;
        undInput.value = material.und;
        descricaoInput.readOnly = true;
        undInput.readOnly = true;
    
        descricaoInput.style.backgroundColor = '#CBD5E0'; 
        undInput.style.backgroundColor = '#CBD5E0';      
        
        descricaoInput.style.borderColor = '#48BB78';
        undInput.style.borderColor = '#48BB78';
        codigoInput.style.borderColor = '#48BB78';
        
        // Remover classes de erro
        codigoInput.classList.remove('input-error');
        descricaoInput.classList.remove('input-error');
        undInput.classList.remove('input-error'); 

         // Adicionar classe de sucesso
    codigoInput.classList.add('input-success');
    
    if (qtdInput) setTimeout(() => qtdInput.focus(), 100);
    
    } else {
        // ❌ Material NÃO encontrado - NÃO PERMITIR
        descricaoInput.value = '';
        undInput.value = '';
        descricaoInput.readOnly = true;
        undInput.readOnly = true;
        
        // Marcar como erro
        codigoInput.style.borderColor = '#FC8181';
        descricaoInput.style.borderColor = '#FC8181';
        undInput.style.borderColor = '#FC8181';
        
        codigoInput.classList.add('input-error');
        descricaoInput.classList.add('input-error');
        undInput.classList.add('input-error');
        
        // Mostrar mensagem de erro no placeholder
        descricaoInput.placeholder = 'CÓDIGO NÃO CADASTRADO';
        undInput.placeholder = '---';
        
        // Focar de volta no código para corrigir
        setTimeout(() => {
            codigoInput.focus();
            codigoInput.select();
        }, 100);
        
        // Alerta visual
        mostrarAlertaMaterialNaoCadastrado(codigo);
    }
}

// ============================================
// FUNÇÃO DE COLETA DE DADOS
// ============================================

function coletarDadosFormulario() {
    const materiais = [];
    const materialItems = document.querySelectorAll('.material-item');
    
    materialItems.forEach(item => {
        const id = item.id.split('-')[1];
        const codigo = document.getElementById(`codigo-${id}`)?.value || '';
        const descricao = document.getElementById(`descricao-${id}`)?.value || '';
        const und = document.getElementById(`und-${id}`)?.value || '';
        const qtd = document.getElementById(`qtd-${id}`)?.value || '';
        
        materiais.push({
            codigo,
            descricao,
            und,
            quantidade: qtd
        });
    });
    
    return {
        numeroObra: document.getElementById('numero-obra')?.value || '',
        data: document.getElementById('data')?.value || '',
        separador: document.getElementById('separador')?.value || '',
        matriculaSeparador: document.getElementById('matricula-separador')?.value || '',
        encarregado: document.getElementById('encarregado')?.value || '',
        matriculaEncarregado: document.getElementById('matricula-encarregado')?.value || '',
        conferente: document.getElementById('conferente')?.value || '',
        matriculaConferente: document.getElementById('matricula-conferente')?.value || '',
        materiais: materiais
    };
}

// ============================================
// FUNÇÕES DO POP-UP DE DESCRIÇÃO
// ============================================

let popupAtual = null;
let overlayAtual = null;

function criarPopupDescricao() {
    // Criar overlay (para fechar ao clicar fora)
    if (!overlayAtual) {
        overlayAtual = document.createElement('div');
        overlayAtual.className = 'popup-overlay';
        overlayAtual.addEventListener('click', fecharPopupDescricao);
        document.body.appendChild(overlayAtual);
    }
    
    // Criar pop-up
    if (!popupAtual) {
        popupAtual = document.createElement('div');
        popupAtual.className = 'descricao-popup';
        document.body.appendChild(popupAtual);
    }
}

function mostrarDescricaoCompleta(inputElement) {
    // Só mostra se o campo estiver readonly (material encontrado)
    if (!inputElement.readOnly) return;
    if (!inputElement.value || inputElement.value === 'Material não encontrado') return;
    
    criarPopupDescricao();
    
    const descricaoCompleta = inputElement.value;
    
    // Verificar se o texto está truncado visualmente
    if (!textoEstaTruncado(inputElement) && window.innerWidth > 768) {
        return; // Não mostra popup se o texto couber no campo (apenas desktop)
    }
    
    // Posicionar o pop-up
    posicionarPopup(inputElement, descricaoCompleta);
    
    // Mostrar
    popupAtual.textContent = descricaoCompleta;
    popupAtual.classList.add('show');
    overlayAtual.classList.add('active');
}

function textoEstaTruncado(element) {
    // Verifica se o texto é maior que a largura do input
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const computedStyle = window.getComputedStyle(element);
    context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    const textWidth = context.measureText(element.value).width;
    const inputWidth = element.clientWidth - 
                      parseInt(computedStyle.paddingLeft) - 
                      parseInt(computedStyle.paddingRight);
    
    return textWidth > inputWidth;
}

function posicionarPopup(inputElement, texto) {
    const rect = inputElement.getBoundingClientRect();
    const popupHeight = 60; // Altura estimada do pop-up
    const popupWidth = Math.min(350, window.innerWidth - 40);
    
    // Centralizar horizontalmente em relação ao input
    let left = rect.left + (rect.width / 2);
    
    // Ajustar para não sair da tela
    const halfPopupWidth = popupWidth / 2;
    if (left - halfPopupWidth < 10) {
        left = halfPopupWidth + 10;
    } else if (left + halfPopupWidth > window.innerWidth - 10) {
        left = window.innerWidth - halfPopupWidth - 10;
    }
    
    // Remover posicionamento anterior
    popupAtual.style.left = '';
    popupAtual.style.right = '';
    popupAtual.style.top = '';
    popupAtual.style.bottom = '';
    popupAtual.style.transform = '';
    
    // Posicionar horizontalmente
    popupAtual.style.position = 'fixed';
    popupAtual.style.left = left + 'px';
    popupAtual.style.transform = 'translateX(-50%)';
    popupAtual.style.maxWidth = popupWidth + 'px';
    
    // Verificar se cabe em cima do input
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    
    if (spaceAbove > popupHeight + 20) {
        // Mostrar em cima
        popupAtual.style.top = (rect.top - 15) + 'px';
        popupAtual.style.transform = 'translate(-50%, -100%)';
        popupAtual.classList.remove('popup-bottom');
    } else if (spaceBelow > popupHeight + 20) {
        // Mostrar embaixo
        popupAtual.style.top = (rect.bottom + 10) + 'px';
        popupAtual.style.transform = 'translateX(-50%)';
        popupAtual.classList.add('popup-bottom');
    } else {
        // Mostrar em cima mesmo sem espaço (com scroll)
        popupAtual.style.top = '10px';
        popupAtual.style.transform = 'translateX(-50%)';
        popupAtual.classList.remove('popup-bottom');
    }
}

function fecharPopupDescricao() {
    if (popupAtual) {
        popupAtual.classList.remove('show');
    }
    if (overlayAtual) {
        overlayAtual.classList.remove('active');
    }
}

// Fechar pop-up com tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharPopupDescricao();
    }
});

// Fechar pop-up ao redimensionar a janela
window.addEventListener('resize', function() {
    fecharPopupDescricao();
});

// Função para mostrar alerta de material não cadastrado
function mostrarAlertaMaterialNaoCadastrado(codigo) {
    // Criar elemento de alerta se não existir
    let alertaExistente = document.querySelector('.alerta-material');
    if (alertaExistente) {
        alertaExistente.remove();
    }
    
    const alerta = document.createElement('div');
    alerta.className = 'alerta-material';
    alerta.innerHTML = `
        <div class="alerta-conteudo">
            <span class="alerta-icone">⚠️</span>
            <span>Código <strong>"${codigo}"</strong> não cadastrado!</span>
        </div>
    `;
    
    // Inserir após o botão de adicionar material
    const btnAdd = document.getElementById('btn-add-material');
    btnAdd.parentNode.insertBefore(alerta, btnAdd.nextSibling);
    
    // Remover após 4 segundos
    setTimeout(() => {
        if (alerta.parentNode) {
            alerta.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => alerta.remove(), 300);
        }
    }, 4000);
}

// Função para validar se todos os materiais estão cadastrados
function validarMateriais() {
    const materialItems = document.querySelectorAll('.material-item');
    const materiaisInvalidos = [];
    
    materialItems.forEach(item => {
        const id = item.id.split('-')[1];
        const codigoInput = document.getElementById(`codigo-${id}`);
        const descricaoInput = document.getElementById(`descricao-${id}`);
        
        if (!codigoInput || !descricaoInput) return;
        
        const codigo = codigoInput.value.trim();
        
        // Verificar se o código está vazio
        if (codigo === '') {
            materiaisInvalidos.push({
                id: id,
                codigo: '(vazio)',
                motivo: 'Código não preenchido'
            });
            codigoInput.style.borderColor = '#FC8181';
            codigoInput.classList.add('input-error');
            return;
        }
        
        // Verificar se o material existe na base
        const material = consultarMaterial(codigo);
        if (!material) {
            materiaisInvalidos.push({
                id: id,
                codigo: codigo,
                motivo: 'Código não cadastrado'
            });
            codigoInput.style.borderColor = '#FC8181';
            codigoInput.classList.add('input-error');
        }
    });
    
    return materiaisInvalidos;
}

// Função para destacar campos inválidos
function destacarCamposInvalidos(materiaisInvalidos) {
    // Remover destaques anteriores
    document.querySelectorAll('.input-error').forEach(input => {
        input.classList.remove('input-error');
        input.style.borderColor = '#E2E8F0';
    });
    
    // Destacar campos inválidos
    materiaisInvalidos.forEach(material => {
        const codigoInput = document.getElementById(`codigo-${material.id}`);
        if (codigoInput) {
            codigoInput.style.borderColor = '#FC8181';
            codigoInput.classList.add('input-error');
            codigoInput.focus();
        }
    });
}


// ============================================
// INICIALIZAÇÃO - EVENT LISTENER
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Iniciando aplicação...');
    
    await carregarMateriais();
    
    const btnAddMaterial = document.getElementById('btn-add-material');
    if (btnAddMaterial) {
        btnAddMaterial.addEventListener('click', adicionarMaterial);
    }
    
    const form = document.getElementById('mgmForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 🔍 Validar materiais antes de enviar
            const materiaisInvalidos = validarMateriais();
            
            if (materiaisInvalidos.length > 0) {
                // ❌ Existem materiais não cadastrados
                destacarCamposInvalidos(materiaisInvalidos);
                
                const listaCodigos = materiaisInvalidos
                    .map(m => `• ${m.codigo} (Material #${m.id})`)
                    .join('\n');
                
                alert(
                    `⚠️ NÃO É POSSÍVEL SALVAR O FORMULÁRIO!\n\n` +
                    `Os seguintes códigos não estão cadastrados:\n\n` +
                    `${listaCodigos}\n\n` +
                    `Por favor, corrija os códigos ou remova os materiais não cadastrados.`
                );
                
                // Rolar até o primeiro material inválido
                const primeiroInvalido = document.getElementById(`codigo-${materiaisInvalidos[0].id}`);
                if (primeiroInvalido) {
                    primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    primeiroInvalido.focus();
                }
                
                return false; // Impede o envio
            }
            
            // ✅ Todos os materiais são válidos
            const dados = coletarDadosFormulario();
            console.log('📤 Dados do formulário:', dados);
            alert(`✅ Formulário salvo com sucesso!\nTotal de materiais: ${dados.totalMateriais}`);
            
            // Aqui você pode enviar os dados para um servidor
            // this.submit(); // Descomente para enviar de verdade
        });
    }
    
    console.log('✅ Aplicação iniciada!');
});