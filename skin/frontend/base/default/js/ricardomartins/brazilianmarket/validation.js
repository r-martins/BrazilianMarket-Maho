/**
 * BrazilianMarket - Validação de CPF/CNPJ
 * CNPJ alfanumérico conforme IN RFB 2.229/2024 e NT ENCAT 2025.001
 */
(function() {
    'use strict';

    const CNPJ_LENGTH = 14;
    const CNPJ_BASE_LENGTH = 12;
    const CNPJ_INVALID = '00000000000000';
    const CNPJ_DV_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    function normalizeCnpj(value) {
        return (value || '').replace(/[.\/-]/g, '').toUpperCase();
    }

    function getCnpjCharValue(char) {
        return char.toUpperCase().charCodeAt(0) - 48;
    }

    function calculateCnpjCheckDigits(base) {
        base = normalizeCnpj(base);
        let sumDv1 = 0;
        let sumDv2 = 0;

        for (let i = 0; i < CNPJ_BASE_LENGTH; i++) {
            const value = getCnpjCharValue(base.charAt(i));
            sumDv1 += value * CNPJ_DV_WEIGHTS[i + 1];
            sumDv2 += value * CNPJ_DV_WEIGHTS[i];
        }

        const dv1 = sumDv1 % 11 < 2 ? 0 : 11 - (sumDv1 % 11);
        sumDv2 += dv1 * CNPJ_DV_WEIGHTS[CNPJ_BASE_LENGTH];
        const dv2 = sumDv2 % 11 < 2 ? 0 : 11 - (sumDv2 % 11);

        return String(dv1) + String(dv2);
    }

    /**
     * Valida CPF
     */
    function validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');

        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10), 10)) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11), 10)) return false;

        return true;
    }

    /**
     * Valida CNPJ (numérico ou alfanumérico)
     */
    function validateCNPJ(cnpj) {
        const clean = normalizeCnpj(cnpj);

        if (clean.length !== CNPJ_LENGTH) return false;
        if (!/^[A-Z0-9]{12}\d{2}$/.test(clean)) return false;
        if (clean === CNPJ_INVALID) return false;

        const base = clean.substring(0, CNPJ_BASE_LENGTH);
        const checkDigits = clean.substring(CNPJ_BASE_LENGTH);

        return calculateCnpjCheckDigits(base) === checkDigits;
    }

    /**
     * Valida CPF ou CNPJ
     */
    function validateCpfCnpj(value) {
        if (!value) return false;

        const normalized = normalizeCnpj(value);

        if (/[A-Z]/.test(normalized)) {
            return validateCNPJ(value);
        }

        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length === 11) {
            return validateCPF(value);
        }

        if (digitsOnly.length === CNPJ_LENGTH) {
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
            if (input.dataset.validationApplied) return;

            input.addEventListener('blur', function(e) {
                const value = e.target.value;
                if (!value) return;

                if (!validateCpfCnpj(value)) {
                    const existingError = e.target.parentElement.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }

                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'validation-error';
                    errorMsg.style.color = '#df280a';
                    errorMsg.style.fontSize = '12px';
                    errorMsg.style.marginTop = '5px';
                    errorMsg.textContent = 'CPF/CNPJ inválido';

                    e.target.parentElement.appendChild(errorMsg);
                    e.target.style.borderColor = '#df280a';

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
                    const existingError = e.target.parentElement.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    e.target.style.borderColor = '';
                }
            });

            if (input.form) {
                input.form.addEventListener('submit', function(e) {
                    const value = input.value;
                    if (value && !validateCpfCnpj(value)) {
                        e.preventDefault();
                        e.stopPropagation();
                        input.focus();
                        input.dispatchEvent(new Event('blur'));
                        return false;
                    }
                }, true);
            }

            input.dataset.validationApplied = 'true';
        });

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initValidation);
    } else {
        initValidation();
    }

    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('load', initValidation);
        document.addEventListener('billing:loaded', initValidation);
        document.addEventListener('shipping:loaded', initValidation);

        if (typeof window.Event !== 'undefined') {
            document.addEventListener('osc:loaded', initValidation);
        }
    }
})();
