import {map, compose, sum, filter} from 'lodash/fp';
import axios from 'axios';

const fetchByURL = url => axios.get(url);

// URL exchange rates relative to the base
const exchangeURL = (base) => (currencies) => {
  return `http://api.fixer.io/latest?base=${base}&symbols=${currencies}`;
};

// [ { code: cyrrency code, rate: rate }, ... ]
// Exchanges rate base currency relative to itself === 1
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

const fetchUSDExchangeRates = compose(
  fetchByURL,
  exchangeURL('USD')
);

// USD - base currency
const cartTotal = compose(
  sum,
  map(itemPrice)
);

const handleError = e => console.log(`Error: ${e.message}`)

const currencies = [
  'USD',
  'RUB',
  'EUR',
  'GBP',
  'JPY',
];

const selectedCart = [
  { price: 20 },
  { price: 45 },
  { price: 67 },
  { price: 1305 }
];

const exchangedTotalCartPrice = compose(
  convert,
  cartTotal
);

fetchUSDExchangeRates(currencies)
  .then(parseExchangeRates)
  .then(exchangedTotalCartPrice(selectedCart))
  .then(console.log)
  .catch(handleError)
