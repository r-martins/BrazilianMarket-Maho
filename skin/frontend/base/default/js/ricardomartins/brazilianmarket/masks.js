/**
 * BrazilianMarket - Máscaras para campos brasileiros
 * Aplica máscaras para telefone e CPF/CNPJ
 */
(function() {
    'use strict';

    /**
     * Aplica máscara de telefone
     */
    /**
     * Aplica máscara de telefone - versão simplificada
     */
    /**
     * Aplica máscara de telefone - versão simplificada
     */
    function applyPhoneMask(input) {
        if (!input) return;
        
        input.addEventListener('input', function(e) {
            const target = e.target;
            
            // Remover tudo que não é dígito
            let value = target.value.replace(/\D/g, '');
            
            // Limitar a 11 dígitos (DDD + número)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            // Aplicar máscara progressivamente usando replace
            if (value.length > 0) {
                value = value
                    .replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3') // Telefone fixo: (XX) XXXX-XXXX
                    .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3') // Celular: (XX) XXXXX-XXXX
                    .replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3') // Telefone parcial: (XX) XXXX-X...
                    .replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3') // Celular parcial: (XX) XXXXX-X...
                    .replace(/^(\d{2})(\d{4})$/, '($1) $2') // (XX) XXXX
                    .replace(/^(\d{2})(\d{5})$/, '($1) $2') // (XX) XXXXX
                    .replace(/^(\d{2})(\d{1,3})$/, '($1) $2') // (XX) X até XXX
                    .replace(/^(\d{1,2})$/, '($1)'); // (X ou (XX
            } else {
                value = '';
            }
            
            target.value = value;
        });
    }



    /**
     * Aplica máscara de CPF/CNPJ
     */
    function applyCpfCnpjMask(input) {
        if (!input) return;
        
        let oldValue = '';
        let oldCursorPosition = 0;
        
        input.addEventListener('keydown', function(e) {
            // Store old value and cursor position before changes
            oldValue = e.target.value;
            oldCursorPosition = e.target.selectionStart;
            
            // Handle backspace when cursor is right after a separator
            if (e.key === 'Backspace' && oldCursorPosition > 0) {
                const charBeforeCursor = oldValue[oldCursorPosition - 1];
                // If cursor is right after a separator (., -, /), remove the digit before the separator
                if (charBeforeCursor && /[.\-\/]/.test(charBeforeCursor) && oldCursorPosition >= 2) {
                    e.preventDefault();
                    // Remove the digit before the separator (2 positions back)
                    const beforeDigit = oldValue.substring(0, oldCursorPosition - 2);
                    const afterSeparator = oldValue.substring(oldCursorPosition);
                    // Count how many digits we have before the cursor
                    const digitsBefore = beforeDigit.replace(/\D/g, '').length;
                    
                    // Set value without the digit and separator
                    e.target.value = beforeDigit + afterSeparator;
                    
                    // Trigger input event to reapply mask
                    setTimeout(function() {
                        e.target.dispatchEvent(new Event('input', { bubbles: true }));
                        
                        // Calculate correct cursor position after mask is reapplied
                        setTimeout(function() {
                            const currentValue = e.target.value.replace(/\D/g, '');
                            let newPos = 0;
                            
                            // Calculate position based on number of digits
                            if (digitsBefore > 0) {
                                if (digitsBefore <= 3) {
                                    newPos = digitsBefore;
                                } else if (digitsBefore <= 6) {
                                    newPos = digitsBefore + 1; // +1 for first dot
                                } else if (digitsBefore <= 9) {
                                    newPos = digitsBefore + 2; // +2 for two dots
                                } else if (digitsBefore <= 11) {
                                    newPos = digitsBefore + 3; // +3 for two dots and dash
                                } else {
                                    // CNPJ format
                                    if (digitsBefore <= 2) {
                                        newPos = digitsBefore;
                                    } else if (digitsBefore <= 5) {
                                        newPos = digitsBefore + 1; // +1 for first dot
                                    } else if (digitsBefore <= 8) {
                                        newPos = digitsBefore + 2; // +2 for two dots
                                    } else if (digitsBefore <= 12) {
                                        newPos = digitsBefore + 3; // +3 for two dots and slash
                                    } else {
                                        newPos = digitsBefore + 4; // +4 for two dots, slash and dash
                                    }
                                }
                            }
                            
                            // Ensure cursor doesn't land on a separator
                            while (newPos < e.target.value.length && /[.\-\/]/.test(e.target.value[newPos])) {
                                newPos++;
                            }
                            
                            e.target.setSelectionRange(newPos, newPos);
                        }, 10);
                    }, 0);
                    return;
                }
            }
        });
        
        input.addEventListener('input', function(e) {
            const target = e.target;
            const cursorPosition = target.selectionStart;
            // Limpar completamente o valor ANTES de qualquer processamento
            // Usar uma variável temporária para garantir que não há interferência
            const rawValue = target.value;
            let value = rawValue.replace(/[^\d]/g, '');
            
            // Store old formatted length for cursor calculation (usar valor limpo)
            const oldFormattedLength = oldValue.length;
            const oldDigitLength = oldValue.replace(/[^\d]/g, '').length;
            
            // Apply mask based on length
            if (value.length <= 11) {
                // CPF: XXX.XXX.XXX-XX
                if (value.length > 0) {
                    value = value.replace(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2}).*/, function(match, p1, p2, p3, p4) {
                        let formatted = p1 || '';
                        if (p2) formatted += '.' + p2;
                        if (p3) formatted += '.' + p3;
                        if (p4) formatted += '-' + p4;
                        return formatted;
                    });
                } else {
                    value = '';
                }
            } else {
                // CNPJ: XX.XXX.XXX/XXXX-XX
                value = value.replace(/^(\d{0,2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2}).*/, function(match, p1, p2, p3, p4, p5) {
                    let formatted = p1 || '';
                    if (p2) formatted += '.' + p2;
                    if (p3) formatted += '.' + p3;
                    if (p4) formatted += '/' + p4;
                    if (p5) formatted += '-' + p5;
                    return formatted;
                });
            }
            
            target.value = value;
            
            // Calculate new cursor position
            const newDigitLength = value.replace(/\D/g, '').length;
            const newFormattedLength = value.length;
            let newCursorPosition = cursorPosition;
            
            // Adjust cursor position based on what happened
            if (newDigitLength < oldDigitLength) {
                // Character was deleted (backspace/delete)
                // Use oldValue and oldCursorPosition for accurate calculation
                const digitsBeforeCursor = oldValue.substring(0, Math.min(oldCursorPosition || cursorPosition, oldValue.length)).replace(/\D/g, '').length;
                
                // Calculate position in new formatted string based on digit count
                if (digitsBeforeCursor >= 0) {
                    if (newDigitLength <= 11) {
                        // CPF format: XXX.XXX.XXX-XX
                        if (digitsBeforeCursor <= 3) {
                            newCursorPosition = digitsBeforeCursor;
                        } else if (digitsBeforeCursor <= 6) {
                            newCursorPosition = digitsBeforeCursor + 1; // +1 for first dot
                        } else if (digitsBeforeCursor <= 9) {
                            newCursorPosition = digitsBeforeCursor + 2; // +2 for two dots
                        } else {
                            newCursorPosition = digitsBeforeCursor + 3; // +3 for two dots and dash
                        }
                    } else {
                        // CNPJ format: XX.XXX.XXX/XXXX-XX
                        if (digitsBeforeCursor <= 2) {
                            newCursorPosition = digitsBeforeCursor;
                        } else if (digitsBeforeCursor <= 5) {
                            newCursorPosition = digitsBeforeCursor + 1; // +1 for first dot
                        } else if (digitsBeforeCursor <= 8) {
                            newCursorPosition = digitsBeforeCursor + 2; // +2 for two dots
                        } else if (digitsBeforeCursor <= 12) {
                            newCursorPosition = digitsBeforeCursor + 3; // +3 for two dots and slash
                        } else {
                            newCursorPosition = digitsBeforeCursor + 4; // +4 for two dots, slash and dash
                        }
                    }
                } else {
                    newCursorPosition = 0;
                }
            } else if (newDigitLength > oldDigitLength) {
                // Character was added
                if (newFormattedLength > oldFormattedLength) {
                    // A separator was added, move cursor forward
                    newCursorPosition = Math.min(value.length, cursorPosition + 1);
                } else {
                    newCursorPosition = cursorPosition + 1;
                }
            }
            
            // Ensure cursor doesn't land on a separator
            while (newCursorPosition < value.length && /[.\-\/]/.test(value[newCursorPosition])) {
                newCursorPosition++;
            }
            
            // Set cursor position
            setTimeout(function() {
                target.setSelectionRange(newCursorPosition, newCursorPosition);
                // Atualizar oldValue com o valor formatado final
                oldValue = target.value;
            }, 0);
        });
    }

    /**
     * Inicializa máscaras quando o DOM estiver pronto
     */
    function initMasks() {
        // Máscara para telefone
        const phoneInputs = document.querySelectorAll('input[name*="[telephone]"], input[name*="[fax]"], input[id*="telephone"], input[id*="fax"]');
        phoneInputs.forEach(function(input) {
            if (!input.dataset.maskApplied) {
                applyPhoneMask(input);
                input.dataset.maskApplied = 'true';
            }
        });

        // Máscara para CPF/CNPJ (taxvat)
        const taxvatInputs = document.querySelectorAll('input[name*="[taxvat]"], input[name*="taxvat"], input[id*="taxvat"], input[name*="vat_id"], input[id*="vat_id"]');
        taxvatInputs.forEach(function(input) {
            if (!input.dataset.maskApplied) {
                applyCpfCnpjMask(input);
                input.dataset.maskApplied = 'true';
            }
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
                            const newTaxvatInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[taxvat]"], input[name*="taxvat"], input[id*="taxvat"], input[name*="vat_id"], input[id*="vat_id"]');
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
