const { useMultiFileAuthState, makeWASocket } = require('@whiskeysockets/baileys');
const axios = require('axios');

// Armazenamento temporário de favoritos por remetente
const userFavorites = {}; // Um objeto para armazenar os favoritos dos usuários
const userCurrentProduct = {}; // Um objeto para armazenar o produto atual que o usuário consultou

// Função para normalizar a entrada do usuário (ex: "preco" => "preço")
const normalizeText = (text) => {
  const accents = {
    a: 'áàãâä',
    e: 'éèêë',
    i: 'íìîï',
    o: 'óòôõö',
    u: 'úùûü',
    c: 'ç',
  };

  return text
    .toLowerCase()
    .replace(/[áàãâä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c');
};

// Função para consultar o Mercado Livre e obter as informações do produto
const fetchProductFromMercadoLivre = async (productName) => {
  try {
    const response = await axios.get(`https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(productName)}`);
    const items = response.data.results;

    if (items.length > 0) {
      const filteredItems = items.filter(item => {
        const normalizedTitle = normalizeText(item.title);
        const normalizedQuery = normalizeText(productName);
        return normalizedTitle.includes(normalizedQuery); 
      });

      if (filteredItems.length > 0) {
        const product = filteredItems[0];
        const highResImage = product.thumbnail.replace('http://', 'https://').replace('I.jpg', 'L.jpg');

        return {
          name: product.title,
          price: product.price,
          link: product.permalink,
          image: highResImage
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Erro ao consultar o Mercado Livre:', error);
    return null;
  }
};

// Função para pegar os 3 produtos mais populares do Mercado Livre
const fetchTrendingProducts = async () => {
  try {
    const response = await axios.get('https://api.mercadolibre.com/sites/MLB/search?q=tendências');
    const products = response.data.results.slice(0, 3); // Pega os 3 primeiros produtos

    return products.map((product, index) => ({
      name: product.title,
      price: product.price,
      link: product.permalink,
      image: product.thumbnail.replace('http://', 'https://').replace('I.jpg', 'L.jpg')
    }));
  } catch (error) {
    console.error('Erro ao pegar produtos em tendência:', error);
    return [];
  }
};

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  socket.ev.on('creds.update', saveCreds);

  socket.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message.key.fromMe) {
      const sender = message.key.remoteJid;
      const text = message.message?.conversation || '';

      console.log(`Mensagem recebida de ${sender}: ${text}`);

      let responseText = '';
      let imageMessage = null;
      let productToFavor = null;

      // Condições para verificar o comando
      if (normalizeText(text).startsWith('!pdt ')) {
        const productName = text.replace('!pdt ', '').trim();
        console.log('Buscando produto:', productName);
        const product = await fetchProductFromMercadoLivre(productName);

        if (product) {
          // Armazenando o produto para o usuário
          userCurrentProduct[sender] = product;

          imageMessage = {
            image: { url: product.image },
            caption: `🖼️ *Aqui está a imagem de* ${product.name}`
          };

          responseText = `🔍 *Produto Encontrado:*\n\n*${product.name}*\n\n💰 *Preço:* R$ ${product.price}\n🔗 *Link:* [Clique aqui para ver o produto](${product.link})\n\n1️⃣ **Para favoritar este produto, digite "1".**`;
        } else {
          responseText = '🔎 Não encontrei esse produto. Tente com outro nome!';
        }
      } else if (normalizeText(text).startsWith('!fav ')) {
        const productName = text.replace('!fav ', '').trim();
        if (!userFavorites[sender]) {
          userFavorites[sender] = [];
        }

        const product = await fetchProductFromMercadoLivre(productName);
        if (product) {
          userFavorites[sender].push(product);
          responseText = `🎉 *Produto favoritado com sucesso:* ${product.name}`;
        } else {
          responseText = '🔎 Não encontrei esse produto para favoritar. Tente com outro nome!';
        }
      } else if (normalizeText(text).startsWith('!r ')) {
        const productNumber = parseInt(text.replace('!r ', '').trim(), 10);
        if (userFavorites[sender] && productNumber >= 1 && productNumber <= userFavorites[sender].length) {
          const productToRemove = userFavorites[sender].splice(productNumber - 1, 1); // Remover o produto da lista
          responseText = `❌ *Produto removido dos favoritos:* ${productToRemove[0].name}`;
        } else {
          responseText = `😞 *Número inválido ou produto não encontrado nos favoritos.*`;
        }
      } else if (normalizeText(text) === '1') {
        if (userCurrentProduct[sender]) {
          if (!userFavorites[sender]) {
            userFavorites[sender] = [];
          }
          userFavorites[sender].push(userCurrentProduct[sender]);
          responseText = `🎉 *Produto favoritado com sucesso:* ${userCurrentProduct[sender].name}`;
        } else {
          responseText = `❌ *Não há produto para favoritar. Pesquise por um produto primeiro.*`;
        }
      } else if (normalizeText(text).includes('oi') || normalizeText(text).includes('olá')) {
        responseText = `🌟 *Bem-vindo(a) ao seu assistente de compras!* 🌟\n\n
        Eu posso te ajudar a encontrar o preço de produtos e até mesmo guardar seus produtos favoritos! 🛒✨\n\n
        Aqui está como você pode interagir comigo:\n\n
        1️⃣ **Para saber o preço de um produto**, digite *"!pdt [nome do produto]"*, exemplo: *"!pdt iPhone 12".\n
        2️⃣ **Para favoritar um produto**, digite *"!fav [nome do produto]".\n
        3️⃣ **Para remover um produto dos favoritos**, digite *"!r [número do produto]".\n
        4️⃣ **Para ver seus favoritos**, digite *"!favlist".\n
        5️⃣ **Para ver os produtos em tendência**, digite *"!trend".\n
        Vamos começar? Digite o nome de um produto para saber o preço!`;

      } else if (normalizeText(text) === '!trend') {
        const trendingProducts = await fetchTrendingProducts();
      
        if (trendingProducts.length > 0) {
          responseText = '🚀 *Aqui estão os 3 produtos mais populares no Mercado Livre agora:*\n\n';
      
          trendingProducts.forEach((product, index) => {
            responseText += `${index + 1}. *${product.name}* - Preço: R$ ${product.price} - [Ver Produto](${product.link})\n\n`;
          });
        } else {
          responseText = '😞 *Não consegui encontrar os produtos em tendência agora.*';
        }
      
      } else if (normalizeText(text) === '!favlist') {
        if (userFavorites[sender] && userFavorites[sender].length > 0) {
          const favoritesList = userFavorites[sender].map((prod, index) => {
            return `(${index + 1}) ${prod.name} - [Ver Produto](${prod.link})`;
          }).join('\n');
          responseText = `🧡 *Seus favoritos:*\n\n${favoritesList}\n\nPara remover um produto, digite *"!r [número do produto]"*`;
        } else {
          responseText = `😞 *Você não tem favoritos ainda.*`;
        }
        
      } else if (normalizeText(text).includes('tchau') || normalizeText(text).includes('adeus')) {
        responseText = `👋 *Até logo! Foi um prazer ajudar você com suas compras! Se precisar de algo mais, estarei por aqui.*`;
        
      } else {
        responseText = '🤔 Desculpe, não entendi. Tente reformular ou digite *"oi"* para ver o que posso fazer!';
      }

      if (imageMessage) {
        await socket.sendMessage(sender, imageMessage);
      }

      await socket.sendMessage(sender, { text: responseText });
    }
  });

  console.log('Bot iniciado! Aguardando mensagens...');
}

startBot().catch(err => console.error('Erro ao iniciar o bot:', err));
