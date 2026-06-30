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
  const CNPJ_LENGTH = 14;
  const CNPJ_BASE_LENGTH = 12;
  const CNPJ_INVALID = '00000000000000';

  /**
   * Pesos para cálculo do DV do CNPJ (numérico e alfanumérico)
   *
   * @var array
   */
  protected $_cnpjDvWeights = array(6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2);

  /**
   * Remove máscara e normaliza CNPJ para maiúsculas
   *
   * @param string $cnpj
   * @return string
   */
  public function normalizeCnpj($cnpj)
  {
    return strtoupper(preg_replace('/[.\-\/]/', '', $cnpj));
  }

  /**
   * Valor numérico de um caractere do CNPJ para cálculo do DV (ASCII - 48)
   *
   * @param string $char
   * @return int
   */
  public function getCnpjCharValue($char)
  {
    return ord(strtoupper($char)) - 48;
  }

  /**
   * Calcula os dígitos verificadores do CNPJ
   *
   * @param string $base CNPJ sem DV (12 caracteres alfanuméricos)
   * @return string
   */
  public function calculateCnpjCheckDigits($base)
  {
    $base = $this->normalizeCnpj($base);
    $weights = $this->_cnpjDvWeights;
    $sumDv1 = 0;
    $sumDv2 = 0;

    for ($i = 0; $i < self::CNPJ_BASE_LENGTH; $i++) {
      $value = $this->getCnpjCharValue($base[$i]);
      $sumDv1 += $value * $weights[$i + 1];
      $sumDv2 += $value * $weights[$i];
    }

    $dv1 = $sumDv1 % 11 < 2 ? 0 : 11 - ($sumDv1 % 11);
    $sumDv2 += $dv1 * $weights[self::CNPJ_BASE_LENGTH];
    $dv2 = $sumDv2 % 11 < 2 ? 0 : 11 - ($sumDv2 % 11);

    return (string) $dv1 . (string) $dv2;
  }

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

    if (preg_match('/(\d)\1{10}/', $cpf)) {
      return false;
    }

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
   * Valida CNPJ (numérico ou alfanumérico conforme IN RFB 2.229/2024)
   *
   * @param string $cnpj
   * @return bool
   */
  public function validateCNPJ($cnpj)
  {
    $cnpj = $this->normalizeCnpj($cnpj);

    if (strlen($cnpj) != self::CNPJ_LENGTH) {
      return false;
    }

    if (!preg_match('/^[A-Z0-9]{12}\d{2}$/', $cnpj)) {
      return false;
    }

    if ($cnpj === self::CNPJ_INVALID) {
      return false;
    }

    $base = substr($cnpj, 0, self::CNPJ_BASE_LENGTH);
    $checkDigits = substr($cnpj, self::CNPJ_BASE_LENGTH);

    return $this->calculateCnpjCheckDigits($base) === $checkDigits;
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

    $normalized = $this->normalizeCnpj($value);

    if (preg_match('/[A-Z]/', $normalized)) {
      return $this->validateCNPJ($value);
    }

    $digitsOnly = preg_replace('/\D/', '', $value);

    if (strlen($digitsOnly) == 11) {
      return $this->validateCPF($value);
    }

    if (strlen($digitsOnly) == self::CNPJ_LENGTH) {
      return $this->validateCNPJ($value);
    }

    return false;
  }
}
