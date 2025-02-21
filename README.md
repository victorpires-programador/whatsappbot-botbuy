Botbuy - Assistente de Compras no WhatsApp
Botbuy é um assistente de compras automatizado para WhatsApp que facilita a busca de produtos, a visualização de preços, imagens e links, além de permitir que os usuários adicionem produtos aos seus favoritos e acompanhem as tendências do Mercado Livre. O bot foi desenvolvido com a biblioteca Baileys e é totalmente integrado ao WhatsApp, permitindo uma experiência de compra simplificada e interativa.

Funcionalidades
Buscar Produtos: Encontre produtos no Mercado Livre informando o nome do produto.
Favoritar Produtos: Adicione produtos à sua lista de favoritos para fácil acesso posterior.
Remover Favoritos: Remova itens da sua lista de favoritos.
Consultar Favoritos: Veja todos os produtos que você favoritou.
Produtos em Tendência: Veja os 3 produtos mais populares do Mercado Livre no momento.
Mensagens Interativas: Respostas automatizadas e interativas para guiar o usuário nas funcionalidades.
Como Usar
Inicie o Bot:

O bot pode ser iniciado com o comando npm start após configurar o ambiente.
Comandos Disponíveis:

!pdt [nome do produto] - Busca informações de um produto no Mercado Livre.
!fav [nome do produto] - Adiciona um produto aos seus favoritos.
!r [número do produto] - Remove um produto da sua lista de favoritos.
!favlist - Mostra todos os produtos que você favoritou.
!trend - Exibe os 3 produtos mais populares do Mercado Livre.
Saudações: Envie oi ou olá para ver uma lista de comandos úteis.
Instalação
Pré-requisitos
Node.js (v14 ou superior)
Conta do WhatsApp
Instalação da biblioteca Baileys
Passos de instalação
Clone este repositório:

bash
Copiar
Editar
git clone https://github.com/seu-usuario/Botbuy.git
cd Botbuy
Instale as dependências:

bash
Copiar
Editar
npm install
Configure a autenticação do WhatsApp:

O bot utiliza a autenticação por QR Code para se conectar ao WhatsApp. Ao rodar o bot pela primeira vez, um QR Code será gerado no terminal para escanear com o WhatsApp Web.
Inicie o bot:

bash
Copiar
Editar
npm start
O bot estará pronto para começar a interagir com os usuários!

Tecnologias Utilizadas
Node.js: Ambiente de execução do JavaScript no servidor.
Baileys: Biblioteca para integrar o WhatsApp com Node.js.
Axios: Para fazer requisições HTTP ao Mercado Livre.
Mercado Livre API: Para buscar informações sobre os produtos.
