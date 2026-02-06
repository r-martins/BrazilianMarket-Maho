/**
 * BrazilianMarket - Máscaras para campos brasileiros
 * Aplica máscaras para telefone e CPF/CNPJ
 */
(function() {
    'use strict';

    /**
     * Aplica máscara de telefone
     */
    function applyPhoneMask(input) {
        if (!input) return;
        
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 10) {
                // Telefone fixo: (XX) XXXX-XXXX
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            } else {
                // Celular: (XX) XXXXX-XXXX
                value = value.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            }
            
            e.target.value = value;
        });
    }

    /**
     * Aplica máscara de CPF/CNPJ
     */
    function applyCpfCnpjMask(input) {
        if (!input) return;
        
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                // CPF: XXX.XXX.XXX-XX
                value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
            } else {
                // CNPJ: XX.XXX.XXX/XXXX-XX
                value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
            }
            
            e.target.value = value;
        });
    }

    /**
     * Inicializa máscaras quando o DOM estiver pronto
     */
    function initMasks() {
        // Máscara para telefone
        const phoneInputs = document.querySelectorAll('input[name*="[telephone]"], input[name*="[fax]"], input[id*="telephone"], input[id*="fax"]');
        phoneInputs.forEach(function(input) {
            applyPhoneMask(input);
        });

        // Máscara para CPF/CNPJ (taxvat)
        const taxvatInputs = document.querySelectorAll('input[name*="[taxvat]"], input[id*="taxvat"], input[name*="vat_id"]');
        taxvatInputs.forEach(function(input) {
            applyCpfCnpjMask(input);
        });

        // Observa mudanças dinâmicas no DOM (para checkout AJAX)
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            // Telefone
                            const newPhoneInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[telephone]"], input[name*="[fax]"], input[id*="telephone"], input[id*="fax"]');
                            if (newPhoneInputs) {
                                newPhoneInputs.forEach(function(input) {
                                    if (!input.dataset.maskApplied) {
                                        applyPhoneMask(input);
                                        input.dataset.maskApplied = 'true';
                                    }
                                });
                            }

                            // CPF/CNPJ
                            const newTaxvatInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[taxvat]"], input[id*="taxvat"], input[name*="vat_id"]');
                            if (newTaxvatInputs) {
                                newTaxvatInputs.forEach(function(input) {
                                    if (!input.dataset.maskApplied) {
                                        applyCpfCnpjMask(input);
                                        input.dataset.maskApplied = 'true';
                                    }
                                });
                            }
                        }
                    });
                });
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    // Inicializa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasks);
    } else {
        initMasks();
    }

    // Também inicializa após eventos do checkout (para compatibilidade com OneStepCheckout)
    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('load', initMasks);
        
        // Para checkout AJAX
        document.addEventListener('billing:loaded', initMasks);
        document.addEventListener('shipping:loaded', initMasks);
        
        // Para OneStepCheckout
        if (typeof window.Event !== 'undefined') {
            document.addEventListener('osc:loaded', initMasks);
        }
    }
})();
