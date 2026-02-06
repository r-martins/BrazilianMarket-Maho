/**
 * BrazilianMarket - Customização de Labels
 * Renomeia "Rua 1" para "Endereço" e "Rua 2" para "Complemento"
 */
(function() {
    'use strict';

    /**
     * Renomeia labels dos campos de endereço
     */
    function renameAddressLabels() {
        // Procura por labels que contenham "Rua 1", "Street Address Line 1", etc.
        const labels = document.querySelectorAll('label, .label, span.label');
        
        labels.forEach(function(label) {
            const text = label.textContent.trim();
            
            // Renomeia primeira linha de endereço
            if (text.match(/rua\s*1|street\s*address\s*line\s*1|street\s*address\s*1|address\s*line\s*1/i)) {
                label.textContent = label.textContent.replace(/rua\s*1|street\s*address\s*line\s*1|street\s*address\s*1|address\s*line\s*1/gi, 'Endereço');
            }
            
            // Renomeia segunda linha de endereço
            if (text.match(/rua\s*2|street\s*address\s*line\s*2|street\s*address\s*2|address\s*line\s*2/i)) {
                label.textContent = label.textContent.replace(/rua\s*2|street\s*address\s*line\s*2|street\s*address\s*2|address\s*line\s*2/gi, 'Complemento');
            }
        });

        // Também verifica labels dentro de inputs (placeholder, aria-label, etc)
        const inputs = document.querySelectorAll('input[name*="street"], input[id*="street"]');
        inputs.forEach(function(input) {
            // Renomeia placeholder
            if (input.placeholder) {
                if (input.placeholder.match(/rua\s*1|street\s*address\s*line\s*1/i)) {
                    input.placeholder = input.placeholder.replace(/rua\s*1|street\s*address\s*line\s*1/gi, 'Endereço');
                }
                if (input.placeholder.match(/rua\s*2|street\s*address\s*line\s*2/i)) {
                    input.placeholder = input.placeholder.replace(/rua\s*2|street\s*address\s*line\s*2/gi, 'Complemento');
                }
            }
            
            // Renomeia aria-label
            if (input.getAttribute('aria-label')) {
                const ariaLabel = input.getAttribute('aria-label');
                if (ariaLabel.match(/rua\s*1|street\s*address\s*line\s*1/i)) {
                    input.setAttribute('aria-label', ariaLabel.replace(/rua\s*1|street\s*address\s*line\s*1/gi, 'Endereço'));
                }
                if (ariaLabel.match(/rua\s*2|street\s*address\s*line\s*2/i)) {
                    input.setAttribute('aria-label', ariaLabel.replace(/rua\s*2|street\s*address\s*line\s*2/gi, 'Complemento'));
                }
            }
        });
    }

    /**
     * Inicializa renomeação de labels
     */
    function initLabels() {
        renameAddressLabels();

        // Observa mudanças dinâmicas no DOM
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                let shouldRename = false;
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length > 0) {
                        shouldRename = true;
                    }
                });
                if (shouldRename) {
                    setTimeout(renameAddressLabels, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLabels);
    } else {
        initLabels();
    }

    // Também inicializa após eventos do checkout
    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('load', initLabels);
        document.addEventListener('billing:loaded', initLabels);
        document.addEventListener('shipping:loaded', initLabels);
        
        if (typeof window.Event !== 'undefined') {
            document.addEventListener('osc:loaded', initLabels);
        }
    }
})();
