<?php
/**
 * BrazilianMarket Helper
 *
 * @category    RicardoMartins
 * @package     RicardoMartins_BrazilianMarket
 * @author      Ricardo Martins
 * @license     OSL-3.0
 */
class RicardoMartins_BrazilianMarket_Helper_Data extends Mage_Core_Helper_Abstract
{
    /**
     * Valida CPF
     *
     * @param string $cpf
     * @return bool
     */
    public function validateCPF($cpf)
    {
        $cpf = preg_replace('/\D/', '', $cpf);
        
        if (strlen($cpf) != 11) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }
        
        // Valida primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = ($sum * 10) % 11;
        if ($remainder == 10 || $remainder == 11) {
            $remainder = 0;
        }
        if ($remainder != intval($cpf[9])) {
            return false;
        }
        
        // Valida segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = ($sum * 10) % 11;
        if ($remainder == 10 || $remainder == 11) {
            $remainder = 0;
        }
        if ($remainder != intval($cpf[10])) {
            return false;
        }
        
        return true;
    }

    /**
     * Valida CNPJ
     *
     * @param string $cnpj
     * @return bool
     */
    public function validateCNPJ($cnpj)
    {
        $cnpj = preg_replace('/\D/', '', $cnpj);
        
        if (strlen($cnpj) != 14) {
            return false;
        }
        
        // Verifica se todos os dígitos são iguais
        if (preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }
        
        $length = 12;
        $numbers = substr($cnpj, 0, $length);
        $digits = substr($cnpj, $length);
        $sum = 0;
        $pos = $length - 7;
        
        // Valida primeiro dígito verificador
        for ($i = $length; $i >= 1; $i--) {
            $sum += intval($numbers[$length - $i]) * $pos--;
            if ($pos < 2) {
                $pos = 9;
            }
        }
        $result = $sum % 11 < 2 ? 0 : 11 - $sum % 11;
        if ($result != intval($digits[0])) {
            return false;
        }
        
        // Valida segundo dígito verificador
        $length = 13;
        $numbers = substr($cnpj, 0, $length);
        $sum = 0;
        $pos = $length - 7;
        for ($i = $length; $i >= 1; $i--) {
            $sum += intval($numbers[$length - $i]) * $pos--;
            if ($pos < 2) {
                $pos = 9;
            }
        }
        $result = $sum % 11 < 2 ? 0 : 11 - $sum % 11;
        if ($result != intval($digits[1])) {
            return false;
        }
        
        return true;
    }

    /**
     * Valida CPF ou CNPJ
     *
     * @param string $value
     * @return bool
     */
    public function validateCpfCnpj($value)
    {
        if (empty($value)) {
            return false;
        }
        
        $cleanValue = preg_replace('/\D/', '', $value);
        
        if (strlen($cleanValue) == 11) {
            return $this->validateCPF($value);
        } elseif (strlen($cleanValue) == 14) {
            return $this->validateCNPJ($value);
        }
        
        return false;
    }
}
