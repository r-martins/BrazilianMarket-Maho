# RicardoMartins_BrazilianMarket
Módulo destinado a usuários do Maho Commerce 26.3 ou superior.

# Funcionalidades
1. Renomeia as linhas de Rua 1 e Rua 2 para "Endereço" e "Complemento"
2. Adiciona máscaras aos campo de Telefone e CPF/CNPJ
3. Adiciona validação de CPF/CNPJ

# Instalação
`composer require ricardomartins/brazilian-market-maho`

# Screenshot
<img width="1574" height="773" alt="image" src="https://github.com/user-attachments/assets/e2776a69-d10c-4e8a-8162-e7ba26e907f8" />


# Configuração
1. Em Clientes > Configurações do Cliente > Opções de nome e Endreço, marque a opção "Mostrar CPF/CNPJ" como Obrigatório, e Número de linhas de endereço como 2.
2. Em Vendas > Finalizar Compra, habilite o Pagamento em Uma Página e One-Step-Checkout

# Desenvolvimento (uso pessoal, pode variar no seu ambiente)
Se estiver desenvolvendo localmente com docker, os arquivos precisam ser atualizados pelo maho manualmente.

1.Substituir o pacote em vendor por symlink:
```
rm -rf vendor/ricardomartins/brazilian-market-maho`
ln -s /modules/BrazilianMarket vendor/ricardomartins/brazilian-market-maho
```
2.Rodar `composer install` para recopiar os assets para public/skin/.
O FileCopyPlugin prioriza o caminho em vendor/mahocommerce/maho-modman-symlinks/{pacote} se existir; senão usa vendor/{pacote} — com o symlink acima, ele lê da sua pasta local.