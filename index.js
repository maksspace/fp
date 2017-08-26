import {map, compose, sum} from 'lodash/fp';
import axios from 'axios';

const fetchByURL = url => axios.get(url);

const convert = base => rates => 
  rates.reduce((total, item) => {
    return {
      ...total,
      [item.code]: item.rate * base
    };
  }, {});

const exchangeURL = (base) => (currencies) => {
  return `http://api.fixer.io/latest?base=${base}&symbols=${currencies}`;
};

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

const itemPrice = item => item.price;
const fetchUSDExchangeRates = compose(
  fetchByURL,
  exchangeURL('USD')
);
const cartTotal = compose(
  sum,
  map(itemPrice)
);

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

fetchUSDExchangeRates(currencies)
  .then(parseExchangeRates)
  .then(convert(cartTotal(selectedCart)))
  .then(console.log)