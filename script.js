// const fetch = require('node-fetch');
const listItens = document.querySelector('.cart__items'); // INSTANCIA O CONTAINTER "OL" DE PRODUTOS
const priceCart = document.querySelector('.total-price');
const arrayPricesStorage = localStorage.getItem('array_prices');

const arrayItensCart = (arrayPricesStorage === undefined
  || arrayPricesStorage === null) ? [] : JSON.parse(arrayPricesStorage);

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

const cartEmpty = () => {
  if (!localStorage.getItem('total_price')) {
  priceCart.innerText = 'Adicione algum item ao carrinho!';
  }
};

function cartItemClickListener(event) {
  const nodeListLi = document.querySelectorAll('.cart__item');
  const newNode = Array.from(nodeListLi);
  const n = parseFloat(localStorage.getItem('total_price'))
  - (arrayItensCart[newNode.indexOf(event.target)]);

  localStorage.setItem('total_price', n);
  arrayItensCart.splice(newNode.indexOf(event.target), 1);
  localStorage.setItem('array_prices', JSON.stringify(arrayItensCart));
  priceCart.innerText = localStorage.getItem('total_price');
  event.target.remove();
  localStorage.setItem('shop_cart', listItens.innerHTML);

  cartEmpty();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}

// ARROW FUNCTION QUE LISTA OS PRODUTOS NA SECTION E TRATA OS DADOS RECEBIDOS
const addItensInSection = (items) => {
  const sectionItems = document.querySelector('.items'); // INSTANCIA A sectionItems QUE LISTARÁ OS PRODUTOS
  items.forEach((item) => { // PERCORRE O ARRAY DE OBJETOS RECEBIDO DA API - FETCHMELI
    const { id: sku, title: name, thumbnail: image } = item; // DESESTRUTURA AS CHAVES NECESSÁRIAS DOS OBJETOS
    const itemElement = createProductItemElement({ sku, name, image }); // CRIA O ELEMENTO A SER ADICIONADO
    sectionItems.appendChild(itemElement); // FAZ O APPEND DO ELEMENTO NA SECTION
  });
};

// ARROW FUNCTION PARA BUSCAR OS PRODUTOS DO MERCADO LIVRE NA PÁGINA, COM BASE EM UMA BUSCA ESPECÍFICA.
const fetchMeli = (query) => fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${query}`)
  .then((response) => { // RECEBE UMA PROMISSE
    response.json() // RECEBE OUTRA PROMISSE COM O ARQUIVO JSON
  .then((data) => addItensInSection(data.results)); // ENVIA PARA A FUNCTION QUE LISTA OS PRODUTOS O ARRAY DE OBJETOS LOCALIZADO NO ARQUIVO JSON COM OS PRODUTOS DA BUSCA.
});

const calcTotalCart = ((price) => {
  const totalPriceStorage = localStorage.getItem('total_price');
  if ((totalPriceStorage === undefined)
  || (totalPriceStorage === null)) {
    localStorage.setItem('total_price', parseFloat(price));
    arrayItensCart.push(price);
    localStorage.setItem('array_prices', JSON.stringify(arrayItensCart));
    priceCart.innerText = price;
  } else {
    arrayItensCart.push(price);
    localStorage.setItem('array_prices', JSON.stringify(arrayItensCart));
    localStorage.setItem('total_price', arrayItensCart.reduce((acc, current) => acc + current, 0));
    priceCart.innerText = localStorage.getItem('total_price');
  }
});

const getProduct = (query) => {
  const getClassItem = query.target.parentElement.querySelector('span.item__sku'); // 
  const idItem = getClassItem.innerText;
  fetch(`https://api.mercadolibre.com/items/${idItem}`)
    .then((response) => response.json()
    .then((data) => {
      const itemSelectAdd = { sku: data.id, name: data.title, salePrice: data.price };
      listItens.appendChild(createCartItemElement(itemSelectAdd));
      localStorage.setItem('shop_cart', listItens.innerHTML);
    
      calcTotalCart(parseFloat(itemSelectAdd.salePrice));
    }));
};

// ARROW FUNCTION ASSÍNCRONA QUE ADICIONA O PRODUTO AO CARRINHO
const itemAdd = async () => {
  try {
    const sectionItems = document.querySelector('.items'); // INSTANCIA A sectionItems QUE LISTARÁ OS PRODUTOS
    const loading = document.querySelector('.loading'); // INSTANCIA O ELEMENTO SPAN LOADING ANTES DO CARRG. DOS PRODUTOS
    await fetchMeli('miniatura navio'); // ENVIA O PARÂMETRO PARA A FUNÇÃO FETCHMELI QUE BUSCA OS PRODUTOS
    loading.remove(); // REMOVE LOADING APÓS O CARREGAMENTO DOS PRODUTOS
    sectionItems.addEventListener('click', (button) => { // ADICIONA UMA ESPERA DE EVENTO EM TODA A LISTA
      if (button.target.className === 'item__add') { // VERIFICA SE O ITEM CLICADO TEM A CLASSE ITEM_ADD
        getProduct(button); 
      }
    });
  } catch (error) {
    alert(`Erro ao adicionar produto> ${error}`);
  }
};

const localCart = localStorage.getItem('shop_cart'); // BUSCA ITENS ADICIONADOS AO CARRINHO, SALVOS NO LOCALSTORAGE

const localPrices = localStorage.getItem('array_prices');
if ((localPrices !== undefined)
  || (localPrices !== null)) {
    priceCart.innerText = `Total da compra: R$ ${localStorage.getItem('total_price')}`;
  } 

listItens.innerHTML = localCart; // CARREGA PRODUTOS SALVOS NO LOCALSTORAGE

// ESPERA O EVENTO DE CLICK NO BOTAO ESVAZIAR CARRINHO E LIMPA O CARRINHO
const buttonClear = document.querySelector('.empty-cart');
buttonClear.addEventListener('click', () => {
  listItens.innerText = '';
  localStorage.setItem('shop_cart', listItens.innerText);
  localStorage.setItem('total_price', 0);
  priceCart.innerText = 'Adicione algum item ao carrinho!';
});
  
itemAdd();
cartEmpty();
