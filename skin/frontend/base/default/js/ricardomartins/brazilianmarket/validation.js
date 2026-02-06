/**
 * BrazilianMarket - Validação de CPF/CNPJ
 */
(function() {
    'use strict';

    /**
     * Valida CPF
     */
    function validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false; // Todos os dígitos iguais
        
        let sum = 0;
        let remainder;
        
        // Valida primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;
        
        // Valida segundo dígito verificador
        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    /**
     * Valida CNPJ
     */
    function validateCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        
        if (cnpj.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(cnpj)) return false; // Todos os dígitos iguais
        
        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        let digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;
        
        // Valida primeiro dígito verificador
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(0))) return false;
        
        // Valida segundo dígito verificador
        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;
        for (let i = length; i >= 1; i--) {
            sum += numbers.charAt(length - i) * pos--;
            if (pos < 2) pos = 9;
        }
        result = sum % 11 < 2 ? 0 : 11 - sum % 11;
        if (result !== parseInt(digits.charAt(1))) return false;
        
        return true;
    }

    /**
     * Valida CPF ou CNPJ
     */
    function validateCpfCnpj(value) {
        if (!value) return false;
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length === 11) {
            return validateCPF(value);
        } else if (cleanValue.length === 14) {
            return validateCNPJ(value);
        }
        
        return false;
    }

    /**
     * Adiciona validação aos campos de CPF/CNPJ
     */
    function initValidation() {
        const taxvatInputs = document.querySelectorAll('input[name*="[taxvat]"], input[id*="taxvat"], input[name*="vat_id"]');
        
        taxvatInputs.forEach(function(input) {
            // Remove validação anterior se existir
            if (input.dataset.validationApplied) return;
            
            input.addEventListener('blur', function(e) {
                const value = e.target.value;
                if (!value) return; // Não valida se vazio (deixa o Magento validar como obrigatório)
                
                if (!validateCpfCnpj(value)) {
                    // Remove mensagem anterior
                    const existingError = e.target.parentElement.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    
                    // Adiciona mensagem de erro
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'validation-error';
                    errorMsg.style.color = '#df280a';
                    errorMsg.style.fontSize = '12px';
                    errorMsg.style.marginTop = '5px';
                    errorMsg.textContent = 'CPF/CNPJ inválido';
                    
                    e.target.parentElement.appendChild(errorMsg);
                    e.target.style.borderColor = '#df280a';
                    
                    // Previne submit do formulário
                    if (e.target.form) {
                        e.target.form.addEventListener('submit', function(evt) {
                            if (!validateCpfCnpj(e.target.value)) {
                                evt.preventDefault();
                                evt.stopPropagation();
                                return false;
                            }
                        }, true);
                    }
                } else {
                    // Remove mensagem de erro se existir
                    const existingError = e.target.parentElement.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    e.target.style.borderColor = '';
                }
            });
            
            // Validação no submit do formulário
            if (input.form) {
                input.form.addEventListener('submit', function(e) {
                    const value = input.value;
                    if (value && !validateCpfCnpj(value)) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Foca no campo e mostra erro
                        input.focus();
                        input.dispatchEvent(new Event('blur'));
                        
                        return false;
                    }
                }, true);
            }
            
            input.dataset.validationApplied = 'true';
        });

        // Observa mudanças dinâmicas no DOM
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const newTaxvatInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[taxvat]"], input[id*="taxvat"], input[name*="vat_id"]');
                            if (newTaxvatInputs) {
                                newTaxvatInputs.forEach(function(input) {
                                    if (!input.dataset.validationApplied) {
                                        initValidation();
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
        document.addEventListener('DOMContentLoaded', initValidation);
    } else {
        initValidation();
    }

    // Também inicializa após eventos do checkout
    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('load', initValidation);
        document.addEventListener('billing:loaded', initValidation);
        document.addEventListener('shipping:loaded', initValidation);
        
        if (typeof window.Event !== 'undefined') {
            document.addEventListener('osc:loaded', initValidation);
        }
    }
})();
