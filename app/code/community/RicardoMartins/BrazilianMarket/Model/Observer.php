<?php
/**
 * BrazilianMarket Observer
 *
 * @category    RicardoMartins
 * @package     RicardoMartins_BrazilianMarket
 * @author      Ricardo Martins
 * @license     OSL-3.0
 */
class RicardoMartins_BrazilianMarket_Model_Observer
{
    /**
     * Customiza labels dos campos de endereço
     * Renomeia "Rua 1" para "Endereço" e "Rua 2" para "Complemento"
     *
     * @param Varien_Event_Observer $observer
     * @return $this
     */
    public function customizeAddressLabels($observer)
    {
        $type = $observer->getEvent()->getType();
        $renderer = $observer->getEvent()->getRenderer();
        
        // Aplica apenas para formulários de endereço
        if ($type->getCode() == 'customer_address') {
            $attributes = $type->getAttributes();
            
            // Renomeia label da primeira linha de endereço (street_1)
            if (isset($attributes['street'])) {
                $streetAttribute = $attributes['street'];
                $streetLines = Mage::getStoreConfig('customer/address/street_lines');
                
                // Customiza labels das linhas de endereço
                if ($streetLines >= 1) {
                    $streetAttribute->setStoreLabel('Endereço', 0);
                }
                if ($streetLines >= 2) {
                    // A segunda linha será "Complemento"
                    // Isso será feito via tradução no arquivo CSV
                }
            }
        }
        
        return $this;
    }
}
