<?php
/**
 * BrazilianMarket CPF/CNPJ Validator
 *
 * @category    RicardoMartins
 * @package     RicardoMartins_BrazilianMarket
 * @author      Ricardo Martins
 * @license     OSL-3.0
 */
class RicardoMartins_BrazilianMarket_Model_Validator_CpfCnpj extends Zend_Validate_Abstract
{
    const INVALID = 'invalid';

    protected $_messageTemplates = array(
        self::INVALID => 'CPF/CNPJ inválido',
    );

    /**
     * Valida CPF/CNPJ
     *
     * @param mixed $value
     * @return bool
     */
    public function isValid($value)
    {
        $this->_setValue($value);
        
        $helper = Mage::helper('ricardomartins_brazilianmarket');
        
        if (!$helper->validateCpfCnpj($value)) {
            $this->_error(self::INVALID);
            return false;
        }
        
        return true;
    }
}
