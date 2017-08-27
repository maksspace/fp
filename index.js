import {map, compose, sum, filter} from 'lodash/fp';
import axios from 'axios';

const fetchByURL = url => axios.get(url);

// Собираем URL для запроса курса валют (currencies) относительно (base)
const exchangeURL = (base) => (currencies) => {
  return `http://api.fixer.io/latest?base=${base}&symbols=${currencies}`;
};

// Преобразуем обьект с ответом от сервера, в массив обьектов вида:
// [ { code: Код валюты, rate: курс }, ... ]
// Курс базовой балюты относительно себя === 1
const parseExchangeRates = res => {
  const { rates } = res.data;
  const ratesArray = Object.keys(rates).map(key => {
    return { code: key, rate: rates[key]
    };
  });
  return [
    { code: res.data.base, rate: 1 },
    ...ratesArray
  ];
};

const convert = base => rates => {
  return rates.reduce((total, item) => {
    return {
      ...total,
      [item.code]: item.rate * base
    };
  }, {});
};

const itemPrice = item => item.price;

// Заправшиваем курс валют относительно доллара
const fetchUSDExchangeRates = compose(
  fetchByURL,
  exchangeURL('USD')
);

// Считаем общую стоимость товаров в корзине.
// Базовая валюта - USD
const cartTotal = compose(
  sum,
  map(itemPrice)
);

// Выводим в консоль ошибку
const handleError = e => console.log(`Error: ${e.message}`)

// Список валют, в которые надо перевести базовую
// для простоты - базовая тоже входит в этот список
const currencies = [
  'USD',
  'RUB',
  'EUR',
  'GBP',
  'JPY',
];

// Козина товаров
const selectedCart = [
	{ price: 20 },
	{ price: 45 },
	{ price: 67 },
	{ price: 1305 }
];

// Считаем общую стоимость корзины товаров, в разных валютах
const exchangedTotalCartPrice = compose(
  convert,
  cartTotal
);

// Получаем курсы валют относительно доллара
fetchUSDExchangeRates(currencies)
  // Парсим курсы в нужный нам вид
  .then(parseExchangeRates)
  // Считаем общую стоимоть корзины в разных валютах
  .then(exchangedTotalCartPrice(selectedCart))
  // Просто печатаем в консоль что получилось
  .then(console.log)
  // Пишем ошибку в консоль (если она есть)
  .catch(handleError)