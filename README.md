# RicardoMartins_BrazilianMarket
Módulo destinado a usuários do Maho Commerce 26.3 ou superior.

# Funcionalidades
1. Renomeia as linhas de Rua 1 e Rua 2 para "Endereço" e "Complemento"
2. Adiciona máscaras aos campo de Telefone e CPF/CNPJ
3. Adiciona validação de CPF/CNPJ

# Instalação
composer require ricardomartins/brazilian-market-maho

# Configuração
1. Em Clientes > Configurações do Cliente > Opções de nome e Endreço, marque a opção "Mostrar CPF/CNPJ" como Obrigatório, e Número de linhas de endereço como 2.
2. Em Vendas > Finalizar Compra, habilite o Pagamento em Uma Página e One-Step-Checkout
