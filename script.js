/// //////////////////////////////////////////////
/// //////////////////////////////////////////////
// BANKIST APP
const cargasPagina = window.localStorage.getItem('cargasPagina') || 0;
window.localStorage.setItem('cargasPagina', Number(cargasPagina) + 1);
/* MONGODB
db.getCollection('cuentas').find({})
mongoimport --db bancos --collection cuentas --drop --file cuentas.json --jsonArray
db.getCollection('cuentas').insertMany([
 {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
},
{
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
},
{
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
},
const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
}
])
*/
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};
const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};
const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};
const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
const accounts = [account1, account2, account3, account4];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// global variables
let currentAccount;
let timer;
let sortOrder = 'afterbegin';

const displayMovements = function (movements) {
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>
        <div class="movements__value">${mov}€</div>
      </div>
    `;
    // containerMovements.innerHTML += html;
    containerMovements.insertAdjacentHTML(sortOrder, html);
  });
};
// Update date en labelDate
const updateDate = function () {
  const hoy = new Date(Date.now());
  labelDate.innerHTML = hoy.toLocaleDateString();
};
// Funcion Logout
const logout = function () {
  currentAccount = null;
  labelWelcome.textContent = 'Log in to get started';
  clearInterval(timer);
  containerApp.style.opacity = 0;
};

const createUserNames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(palabra => palabra[0])
      .join('');
  });
};
createUserNames(accounts);
function displayBalance(acc) {
  acc.balance = acc.movements.reduce((acc, curval) => acc + curval, 0);
  labelBalance.textContent = `${acc.balance}€`;
}
function displaySummary(acc) {
  // la  destructuración  también podría ir en los argumentos de la función
  const { movements, interestRate } = acc;
  // calcular y mostrar depósitos
  const incomes = movements
    .filter(mov => mov > 0)
    .reduce((acc, cur, i, arr) => acc + cur, 0);
  labelSumIn.textContent = `${incomes}€`;
  // calcular  y mostrar retiradas de dinero
  const outcomes = movements
    .filter(mov => mov < 0)
    .reduce((acc, cur, i, arr) => acc + cur, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}€`;
  // calcular y mostrar intereses
  // versión simplificada: por cada depósito calcular su interés (según dato del account) y por un año
  // independiente de retiradas de dinero.
  // Para que el interes sea tenido en cuenta, tiene que ser superior a 1€ (cada depósito)
  // const interest = (incomes * acc.interestRate) / 100;
  const interest = movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .filter(interest => interest > 1)
    .reduce((acc, cur) => acc + cur, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
}
const updateUI = function () {
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
  displayMovements(currentAccount.movements);
  displayBalance(currentAccount);
  displaySummary(currentAccount);
  updateDate();
};

// EVENTOS ********************************************
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  /* obtener  la cuenta que nos interesa */
  const username = inputLoginUsername.value;
  const pin = Number(inputLoginPin.value);
  currentAccount = accounts.find(acc => acc.username === username);
  if (currentAccount?.pin === pin) {
    labelWelcome.textContent = `Bienvenido ${
      currentAccount.owner.split(' ')[0]
    }`;
    updateUI();
    containerApp.style.opacity = 1;
    inputLoginUsername.value = inputLoginPin.value = '';
    // quitar foco si lo tiene:
    inputLoginPin.blur();
  } else {
    console.log('pin incorrecto  o usuario desconocido');
  }
});
btnTransfer.addEventListener('click', function (e) {
  console.log('hacer  transferencia');
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const transferUsername = inputTransferTo.value;
  const transferAccount = accounts.find(
    acc => acc.username === transferUsername
  );
  // conditions to  transfer
  // positive amount
  // existent user
  // balance >= amount
  // transferAccount !== currentAccount
  if (
    amount > 0 &&
    transferAccount &&
    currentAccount.balance >= amount &&
    transferAccount.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    transferAccount.movements.push(amount);
    updateUI();
  } else {
    console.log('Transferencia no realizada!!!!');
  }
});
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  console.log(
    `cerrar cuenta de ${currentAccount.username} con pin ${currentAccount.pin} `
  );
  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  if (username === currentAccount.username && pin === currentAccount.pin) {
    const index = accounts.findIndex(acc => acc.username === username);
    console.log(`Elemento  a eliminar  ${index}`, accounts[index]);
    /* borrar elemento  de accounts */
    // slice no muta el array (accounts) y splice si
    accounts.splice(index, 1);
    console.log(accounts);
    inputCloseUsername.value = inputClosePin.value = '';
    containerApp.style.opacity = 0;
  } else {
    console.log('No se puede eliminar cuenta');
  }
});
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  /* amount>0 and amount*0.1 <  someDeposit */
  const minDepositReq = currentAccount.movements.some(
    mov => mov > amount * 0.1
  );
  if (amount > 0 && minDepositReq) {
    console.log(`Se ha  hecho el depósito de ${amount}`);
    currentAccount.movements.push(amount);
    updateUI();
  } else {
    console.log('No se ha podido hacer el depósito');
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sortOrder = sortOrder === 'afterbegin' ? 'beforeend' : 'afterbegin';
  updateUI();
});

//  método some y método  every
const movimientos = [300, -200, -200];
const isDeposit = mov => mov > 0;
const anyDeposit = movimientos.some(isDeposit);
console.log(anyDeposit);
const allDeposit = movimientos.every(isDeposit);
console.log(allDeposit);
const arr = [[1, 3, [5, 7]], [9, 10], 3];
console.log(arr.flat(2));
console.log(arr);
const overallBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, cur) => acc + cur, 0);
const overallBalance2 = accounts
  .map(acc => acc.movements) // cur -> array(4), arrray(3), array(3)
  .reduce((acc, cur) => acc + cur.reduce((acc, cur) => acc + cur, 0), 0);
const overallBalance3 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, cur) => acc + cur, 0);
console.log(overallBalance);
console.log(overallBalance3);
// setInterval -> Asincrona y que no se para (o la  paramos nosotros)
// let i = 0;
// setInterval(() => {
//   i += 1;
//   console.log(i);
// }, 1000);
// let time = 10;
// const startLogOutTimer = function () {
//   const timer = setInterval(() => {
//     time -= 1;
//     if (time === 0) clearInterval(timer);
//     labelTimer.textContent = time;
//   }, 1000);
// };
// startLogOutTimer();
function startLogOutTimer() {
  let time = 300;
  const printTime = time => {
    //  min, sec -> darle un  padding: si tengo 2m y 5s -> 02:05
    const min = Math.trunc(time / 60)
      .toString()
      .padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
  };
  const tick = () => {
    time -= 1;
    if (time === 0) logout();
    printTime(time);
  };
  const timer = setInterval(tick, 1000);
  printTime(time);
  return timer;
}

// /// //////////////////////////////////////////////
// /// //////////////////////////////////////////////
// // BANKIST APP

// // Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

// // Elements
// const labelWelcome = document.querySelector('.welcome');
// const labelDate = document.querySelector('.date');
// const labelBalance = document.querySelector('.balance__value');
// const labelSumIn = document.querySelector('.summary__value--in');
// const labelSumOut = document.querySelector('.summary__value--out');
// const labelSumInterest = document.querySelector('.summary__value--interest');
// const labelTimer = document.querySelector('.timer');

// const containerApp = document.querySelector('.app');
// const containerMovements = document.querySelector('.movements');

// const btnLogin = document.querySelector('.login__btn');
// const btnTransfer = document.querySelector('.form__btn--transfer');
// const btnLoan = document.querySelector('.form__btn--loan');
// const btnClose = document.querySelector('.form__btn--close');
// const btnSort = document.querySelector('.btn--sort');

// const inputLoginUsername = document.querySelector('.login__input--user');
// const inputLoginPin = document.querySelector('.login__input--pin');
// const inputTransferTo = document.querySelector('.form__input--to');
// const inputTransferAmount = document.querySelector('.form__input--amount');
// const inputLoanAmount = document.querySelector('.form__input--loan-amount');
// const inputCloseUsername = document.querySelector('.form__input--user');
// const inputClosePin = document.querySelector('.form__input--pin');

// const displayMovements = function (movements) {
//   containerMovements.innerHTML = '';
//   movements.forEach((mov, i) => {
//     const type = mov > 0 ? 'deposit' : 'withdrawal';
//     const html = `
//       <div class="movements__row">
//         <div class="movements__type movements__type--${type}">
//           ${i + 1} ${type}
//         </div>
//         <div class="movements__value">${mov}€</div>
//       </div>
//     `;
//     containerMovements.innerHTML += html;
//     containerMovements.insertAdjacentHTML('afterbegin', html);
//   });
// };

// displayMovements(account1.movements);
// // Funcion que inserta un campo nuevo en los accounts llamado username que tenga las iniciales
// const createUserNames = function (accounts) {
//   accounts.forEach(function (acc) {
//     acc.username = acc.owner
//       .toLowerCase()
//       .split(' ')
//       .map(palabra => palabra[0])
//       .join('');
//   });
// };
// createUserNames(accounts);
// console.log(accounts);

// function calcDisplayBalance(acc) {
//   acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
//   labelBalance.textContent = `${acc.balance}€`;
// }
// displayMovements(account1.movements);
// calcDisplayBalance(account1);

// let totalDeposit = 0;
// [2, 4, 6].forEach(item => (totalDeposit += item));
// console.log(totalDeposit);

// const totalDeposit2 = [2, 4, 6].reduce(
//   (acc, curVal, i, arr) => acc + curVal,
//   0
// );
// console.log(totalDeposit2, 'con reduce');

// const valorMaximo = [2, 6, -10, 8, 30, 2].reduce(
//   (acc, curVal) => (curVal > acc ? curVal : acc),
//   Number.NEGATIVE_INFINITY
// );
// const valorMaximo2 = Math.max(...[2, 6, -10, 8, 30, 2]);
// console.log(`valor maximo con spread operator: ${valorMaximo2}`);
// console.log(valorMaximo, 'con reduce');

// /*
// origen:[2, 6, -10, 8, 30, 2]
// resultado: {min: -10, max: 30}
// */
// const origen = [2, 6, -10, 8, 30, 2];
// const resultado = origen.reduce((acc, curVal) => ({
//   min: Number.POSITIVE_INFINITY,
//   max: Number.NEGATIVE_INFINITY,
// }));
// console.log(resultado);

// const numerooos = [2, 6, -10, 8, 30, 2];
// const minMax = {
//   min: Math.min(...numerooos),
//   max: Math.max(...numerooos),
// };
// console.log(minMax);

// const numeros = [1, 2, 4, 6];

// const dobles = numeros.map(item => item * 2);
// console.log(dobles);

// const dobles2 = [];
// dobles2.forEach(item => {
//   dobles2.push(item);
// });

// // funcion que recibe movimientos y los devuelve en otra moneda
// const eurToUSD = 1.09;
// const movementsUSD = account1.movements.map(item => item * eurToUSD);
// console.log(movementsUSD);

// const movementsUSD2 = [];
// account1.movements.forEach(item => movementsUSD2.push(item * eurToUSD));
// console.log(movementsUSD2);

// const movemetsUSDDoble = account1.movements
//   .filter(item => item > 0)
//   .map(item => item * eurToUSD)
//   .map((item, _, arr) => {
//     console.log(arr);
//     return item * 2;
//   })
//   .map(item => '$' + item.toFixed(2));
// console.log(`${movemetsUSDDoble}`);

// /*
// Juan y Marta están haciendo un  estudio sobre perros. Cada uno le pregunta a 5 propietarios de perros sobre la edad de sus perros  y lo almacenan en una matriz (una cada  uno).
// De momento solo están interesados en saber si son perros adultos o cachorros. un perro se considera adulto si tiene al  menos 3 años, y cachorro si tiene menos de 3 años.
// Crea una función *comprobarPerros* que acepte dos arrays de edades de perros y  haga las siguientes cosas:
// 1. Juan se ha dado cuenta de que el primer y los dos últimos perros que apuntó, ¡realmente eran gatos  y no perros!
// Así que crea una copia del array y elimina las edades de los gatos (es mala  práctica mutar los datos de los  parámetros de las funciones).
// 2. Crea un único array con los datos de edades corregidos, de ambos.
// 3. Para cada uno  de los perros muestra un texto  por consola que informe si el perro es adulto o cachorro con su  edad.
// 4. Ejecuta la función para los dos conjuntos de datos siguientes.
// TEST DATA 1: Juan [3, 5, 2, 12, 7], Marta [4, 1, 15, 8, 3]
// TEST DATA 2: Juan [9, 16, 6, 8, 3], Marta [10, 5, 6, 1, 4]
// */

// const perrosJuan1 = [3, 5, 2, 12, 7];
// console.log(perrosJuan1);
// console.log(perrosJuan1.slice(1, 4));
// const perrosMarta1 = [4, 1, 15, 8, 3];

// const copyPerros = perrosJuan1.slice(1, 4).concat(perrosMarta1);
// console.log(copyPerros);

// copyPerros.forEach((dog, i) => {
//   const adulto = '';
//   if ($dog >= 3) adulto = 'adulto';
//   else adulto = 'cachorro';
//   console.log(`El perro numero ${i + 1} es ${adulto} `);
// });

// const perrosJuan2 = [9, 16, 6, 8, 3];
// const perrosMarta2 = [10, 5, 6, 1, 4];

// //pruebas

// //inmutabilidad -> los metodos son inmutables o mutables
// //              -> las variables son inmutables o mutables

// let letras = ['a', 'b', 'c', 'd', 'e'];
// const letras2 = ['f', 'g', 'h'];

// //const alfabetoExtendido = [...letras, ...letras2];
// const alfabetoExtendido = letras.concat(letras2);

// console.log(alfabetoExtendido);
// console.log(letras);
// console.log(alfabetoExtendido[alfabetoExtendido.length - 1]);
// console.log(alfabetoExtendido.at(-1));

// console.log(letras.reverse());
// console.log(letras);

// console.log(letras.slice(2).slice(1));
// console.log(letras.slice(2, 4));
// console.log(letras.slice(-1));

// console.log(letras);

// //let copyLetras = [...letras]
// let copyLetras = letras.splice(2);
// console.log(letras);
// console.log(copyLetras);

// const edades = [3, 9, 2, 10, 8, 4];

// // const functionOrdenacion = function (a, b) {
// //   return a - b;
// // };

// const functionOrdenacion = (a, b) => a - b;

// const edadesOrdenadas = edades.sort(functionOrdenacion).sort((a, b) => b - a);
// console.log(edadesOrdenadas);
// console.log(edades);

// const estudiante = { nombre: 'pepe', edad: 17 };

// const changeEstudiante = (estudiante, nuevosCampos) => {
//   return { ...estudiante, ...nuevosCampos };
// };
// const changeEstudianteMasCorta = (estudiante, nuevosCampos) => ({
//   ...estudiante,
//   ...nuevosCampos,
// });

// const estudiante2 = changeEstudiante(estudiante, { nombre: 'juanda' });
// console.log(estudiante2);
