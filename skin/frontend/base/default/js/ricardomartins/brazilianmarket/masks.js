/**
 * BrazilianMarket - Máscaras para campos brasileiros
 * Aplica máscaras para telefone, CPF/CNPJ (incluindo CNPJ alfanumérico) e CEP
 */
(function() {
    'use strict';

    const CNPJ_LENGTH = 14;
    const CNPJ_BASE_LENGTH = 12;
    const MASK_SEPARATOR_REGEX = /[.\-\/]/;

    /**
     * Aplica máscara de telefone
     */
    function applyPhoneMask(input) {
        if (!input) return;

        input.addEventListener('input', function(e) {
            const target = e.target;
            let value = target.value.replace(/\D/g, '');

            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            if (value.length > 0) {
                value = value
                    .replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
                    .replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
                    .replace(/^(\d{2})(\d{4})(\d+)$/, '($1) $2-$3')
                    .replace(/^(\d{2})(\d{5})(\d+)$/, '($1) $2-$3')
                    .replace(/^(\d{2})(\d{4})$/, '($1) $2')
                    .replace(/^(\d{2})(\d{5})$/, '($1) $2')
                    .replace(/^(\d{2})(\d{1,3})$/, '($1) $2')
                    .replace(/^(\d{1,2})$/, '($1)');
            } else {
                value = '';
            }

            target.value = value;
        });
    }

    function stripCpfCnpjMask(value) {
        return (value || '').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    }

    function isCnpjMode(chars) {
        return chars.length > 11 || /[A-Z]/.test(chars);
    }

    function sanitizeCpfCnpjInput(rawValue) {
        const stripped = stripCpfCnpjMask(rawValue);

        if (!isCnpjMode(stripped)) {
            return stripped.replace(/\D/g, '').substring(0, 11);
        }

        let result = '';
        for (let i = 0; i < stripped.length && result.length < CNPJ_LENGTH; i++) {
            const char = stripped.charAt(i);
            if (result.length < CNPJ_BASE_LENGTH) {
                if (/[A-Z0-9]/.test(char)) {
                    result += char;
                }
            } else if (/\d/.test(char)) {
                result += char;
            }
        }

        return result;
    }

    function formatCpf(chars) {
        if (!chars.length) {
            return '';
        }

        const p1 = chars.substring(0, 3);
        const p2 = chars.substring(3, 6);
        const p3 = chars.substring(6, 9);
        const p4 = chars.substring(9, 11);

        let formatted = p1;
        if (p2) formatted += '.' + p2;
        if (p3) formatted += '.' + p3;
        if (p4) formatted += '-' + p4;

        return formatted;
    }

    function formatCnpj(chars) {
        if (!chars.length) {
            return '';
        }

        const p1 = chars.substring(0, 2);
        const p2 = chars.substring(2, 5);
        const p3 = chars.substring(5, 8);
        const p4 = chars.substring(8, 12);
        const p5 = chars.substring(12, 14);

        let formatted = p1;
        if (p2) formatted += '.' + p2;
        if (p3) formatted += '.' + p3;
        if (p4) formatted += '/' + p4;
        if (p5) formatted += '-' + p5;

        return formatted;
    }

    function formatCpfCnpj(chars) {
        return isCnpjMode(chars) ? formatCnpj(chars) : formatCpf(chars);
    }

    function countBodyChars(value, position) {
        return value.substring(0, position).replace(/[^A-Za-z0-9]/g, '').length;
    }

    function cursorPositionForCharCount(charCount, cnpjMode) {
        if (charCount <= 0) {
            return 0;
        }

        if (!cnpjMode) {
            if (charCount <= 3) return charCount;
            if (charCount <= 6) return charCount + 1;
            if (charCount <= 9) return charCount + 2;
            return charCount + 3;
        }

        if (charCount <= 2) return charCount;
        if (charCount <= 5) return charCount + 1;
        if (charCount <= 8) return charCount + 2;
        if (charCount <= 12) return charCount + 3;
        return charCount + 4;
    }

    function skipSeparators(value, position) {
        while (position < value.length && MASK_SEPARATOR_REGEX.test(value.charAt(position))) {
            position++;
        }
        return position;
    }

    function updateCpfCnpjLabel(input, cnpjMode) {
        if (!input.id) {
            return;
        }
        const label = document.querySelector('label[for="' + CSS.escape(input.id) + '"]');
        if (!label) {
            return;
        }
        if (!label.dataset.cpfLabel) {
            label.dataset.cpfLabel = (label.textContent || 'CPF').trim() || 'CPF';
        }
        const next = cnpjMode ? 'CNPJ' : label.dataset.cpfLabel;
        if (label.textContent !== next) {
            label.textContent = next;
        }
        input.title = next;
    }

    /**
     * Aplica máscara de CPF/CNPJ
     */
    function applyCpfCnpjMask(input) {
        if (!input) return;

        let oldValue = '';
        let oldCursorPosition = 0;

        input.addEventListener('keydown', function(e) {
            oldValue = e.target.value;
            oldCursorPosition = e.target.selectionStart;

            if (e.key === 'Backspace' && oldCursorPosition > 0) {
                const charBeforeCursor = oldValue.charAt(oldCursorPosition - 1);
                if (charBeforeCursor && MASK_SEPARATOR_REGEX.test(charBeforeCursor) && oldCursorPosition >= 2) {
                    e.preventDefault();
                    const beforeDigit = oldValue.substring(0, oldCursorPosition - 2);
                    const afterSeparator = oldValue.substring(oldCursorPosition);
                    const charsBefore = countBodyChars(beforeDigit, beforeDigit.length);

                    e.target.value = beforeDigit + afterSeparator;

                    setTimeout(function() {
                        e.target.dispatchEvent(new Event('input', { bubbles: true }));

                        setTimeout(function() {
                            const cnpjMode = isCnpjMode(stripCpfCnpjMask(e.target.value));
                            let newPos = cursorPositionForCharCount(charsBefore, cnpjMode);
                            newPos = skipSeparators(e.target.value, newPos);
                            e.target.setSelectionRange(newPos, newPos);
                        }, 10);
                    }, 0);
                }
            }
        });

        input.addEventListener('input', function(e) {
            const target = e.target;
            const cursorPosition = target.selectionStart;
            const rawValue = target.value;
            const chars = sanitizeCpfCnpjInput(rawValue);
            const cnpjMode = isCnpjMode(chars);
            const oldChars = stripCpfCnpjMask(oldValue);
            const oldCnpjMode = isCnpjMode(oldChars);
            const value = formatCpfCnpj(chars);

            target.value = value;
            updateCpfCnpjLabel(target, cnpjMode);

            const newCharLength = chars.length;
            const oldCharLength = oldChars.length;
            let newCursorPosition = cursorPosition;

            if (newCharLength < oldCharLength) {
                const charsBeforeCursor = countBodyChars(
                    oldValue,
                    Math.min(oldCursorPosition || cursorPosition, oldValue.length)
                );
                newCursorPosition = cursorPositionForCharCount(charsBeforeCursor, cnpjMode);
            } else if (newCharLength > oldCharLength) {
                if (value.length > oldValue.length) {
                    newCursorPosition = Math.min(value.length, cursorPosition + 1);
                } else {
                    newCursorPosition = cursorPosition + 1;
                }
            } else if (cnpjMode !== oldCnpjMode) {
                newCursorPosition = cursorPositionForCharCount(newCharLength, cnpjMode);
            }

            newCursorPosition = skipSeparators(value, newCursorPosition);

            setTimeout(function() {
                target.setSelectionRange(newCursorPosition, newCursorPosition);
                oldValue = target.value;
            }, 0);
        });

        updateCpfCnpjLabel(input, isCnpjMode(sanitizeCpfCnpjInput(input.value)));
    }

    const POSTCODE_SELECTOR = 'input[name="billing[postcode]"], input[name="shipping[postcode]"], input[name="postcode"], input[name="estimate_postcode"]';

    function formatCep(value) {
        const digits = (value || '').replace(/\D/g, '').substring(0, 8);
        if (digits.length <= 5) {
            return digits;
        }
        return digits.substring(0, 5) + '-' + digits.substring(5);
    }

    function countryElementFor(input) {
        const id = input.id || '';
        const colon = id.indexOf(':');
        if (colon > 0) {
            return document.getElementById(id.slice(0, colon) + ':country_id');
        }
        return document.getElementById('country')
            || document.getElementById('country_id')
            || document.querySelector('select[name="country_id"]');
    }

    function shouldMaskCep(input) {
        const country = countryElementFor(input);
        return !country || country.value === 'BR';
    }

    function setFieldValue(element, value) {
        if (!element || value == null || value === '') {
            return;
        }
        element.value = value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function selectRegion(select, estado, uf) {
        if (!select) {
            return;
        }
        const name = (estado || '').trim().toLowerCase();
        const code = (uf || '').trim().toLowerCase();
        let matched = null;
        for (const option of select.options) {
            const text = option.text.trim().toLowerCase();
            if ((name && text === name) || (code && text === code)) {
                matched = option;
                break;
            }
        }
        if (!matched) {
            return;
        }
        select.value = matched.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function fillAddressFromViaCep(input, data) {
        const prefix = (input.id || '').split(':')[0];
        if (!prefix) {
            return;
        }
        const field = function(name) {
            return document.getElementById(prefix + ':' + name);
        };

        setFieldValue(field('street1'), data.logradouro);
        setFieldValue(field('street2'), [data.bairro, data.complemento].filter(Boolean).join(' - '));
        setFieldValue(field('city'), data.localidade);
        selectRegion(field('region_id'), data.estado, data.uf);
        setFieldValue(field('region'), data.estado);
    }

    function lookupCep(input) {
        if (!shouldMaskCep(input)) {
            return;
        }
        const digits = (input.value || '').replace(/\D/g, '');
        if (digits.length !== 8) {
            return;
        }
        if (input.dataset.cepLookup === digits) {
            return;
        }
        input.dataset.cepLookup = digits;

        fetch('https://viacep.com.br/ws/' + digits + '/json/')
            .then(function(response) {
                return response.ok ? response.json() : null;
            })
            .then(function(data) {
                if ((input.value || '').replace(/\D/g, '') !== digits) {
                    return;
                }
                if (!data || data.erro) {
                    delete input.dataset.cepLookup;
                    return;
                }
                fillAddressFromViaCep(input, data);
            })
            .catch(function() {
                if (input.dataset.cepLookup === digits) {
                    delete input.dataset.cepLookup;
                }
            });
    }

    /**
     * Aplica máscara de CEP brasileiro (00000-000) quando o país é Brasil.
     */
    function applyCepMask(input) {
        if (!input) return;

        const refresh = function() {
            if (!shouldMaskCep(input)) {
                return;
            }
            const formatted = formatCep(input.value);
            if (input.value !== formatted) {
                input.value = formatted;
            }
        };

        input.addEventListener('input', function() {
            refresh();
            lookupCep(input);
        });

        const country = countryElementFor(input);
        if (country && !country.dataset.cepMaskBound) {
            country.addEventListener('change', function() {
                document.querySelectorAll('input[data-cep-mask="true"]').forEach(function(field) {
                    if (countryElementFor(field) !== country || !shouldMaskCep(field)) {
                        return;
                    }
                    field.value = formatCep(field.value);
                });
            });
            country.dataset.cepMaskBound = 'true';
        }

        input.dataset.cepMask = 'true';
        refresh();
    }

    /**
     * Inicializa máscaras quando o DOM estiver pronto
     */
    function initMasks() {
        const phoneInputs = document.querySelectorAll('input[name*="[telephone]"], input[name*="[fax]"], input[id*="telephone"], input[id*="fax"]');
        phoneInputs.forEach(function(input) {
            if (!input.dataset.maskApplied) {
                applyPhoneMask(input);
                input.dataset.maskApplied = 'true';
            }
        });

        const taxvatInputs = document.querySelectorAll('input[name*="[taxvat]"], input[name*="taxvat"], input[id*="taxvat"], input[name*="vat_id"], input[id*="vat_id"]');
        taxvatInputs.forEach(function(input) {
            if (!input.dataset.maskApplied) {
                applyCpfCnpjMask(input);
                input.dataset.maskApplied = 'true';
            }
        });

        document.querySelectorAll(POSTCODE_SELECTOR).forEach(function(input) {
            if (!input.dataset.maskApplied) {
                applyCepMask(input);
                input.dataset.maskApplied = 'true';
            }
        });

        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                            const newPhoneInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[telephone]"], input[name*="[fax]"], input[id*="telephone"], input[id*="fax"]');
                            if (newPhoneInputs) {
                                newPhoneInputs.forEach(function(input) {
                                    if (!input.dataset.maskApplied) {
                                        applyPhoneMask(input);
                                        input.dataset.maskApplied = 'true';
                                    }
                                });
                            }

                            const newTaxvatInputs = node.querySelectorAll && node.querySelectorAll('input[name*="[taxvat]"], input[name*="taxvat"], input[id*="taxvat"], input[name*="vat_id"], input[id*="vat_id"]');
                            if (newTaxvatInputs) {
                                newTaxvatInputs.forEach(function(input) {
                                    if (!input.dataset.maskApplied) {
                                        applyCpfCnpjMask(input);
                                        input.dataset.maskApplied = 'true';
                                    }
                                });
                            }

                            const newPostcodeInputs = node.querySelectorAll && node.querySelectorAll(POSTCODE_SELECTOR);
                            if (newPostcodeInputs) {
                                newPostcodeInputs.forEach(function(input) {
                                    if (!input.dataset.maskApplied) {
                                        applyCepMask(input);
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasks);
    } else {
        initMasks();
    }

    if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('load', initMasks);
        document.addEventListener('billing:loaded', initMasks);
        document.addEventListener('shipping:loaded', initMasks);

        if (typeof window.Event !== 'undefined') {
            document.addEventListener('osc:loaded', initMasks);
        }
    }
})();
