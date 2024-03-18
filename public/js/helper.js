function showAndLogWarning(text) {
  console.warn(text) // besides console.log and console.error
  alert(text)
}

function arithmetic() {
  let a = 5; // Declare a variable 'a' and assign it the value 5 
  let b = 10; // Declare a variable 'b' and assign it the value 10 
  const c = 20; // Declare a constant 'c' and assign it the value 20

  let sum = a + b; // Perform addition 
  console.log('Sum: ' + sum); // Outputs: Sum: 15

  let product = a * b; // Perform multiplication 
  console.log('Product: ' + product); // Outputs: Product: 50

  let quotient = b / a; // Perform division 
  console.log('Quotient: ' + quotient); // Outputs: Quotient: 2

  let remainder = b % a; // Perform modulus operation 
  console.log('Remainder: ' + remainder); // Outputs: Remainder: 0

  a = 20
  b = 40
  // c = 50 // leads to TypeError invalid assignment to const 'c'
}

function dataTypes() {
  // JavaScript's primitive data types:
  let num = 10;  // Number
  let str = 'Hello, World!';  // String
  let bool = true;  // Boolean
  let notDefined;  // Undefined
  let nothing = null;  // Null
  let sym = Symbol('sym');  // Symbol

  // JavaScript objects (in JSON notation):
  let student = {
    'name': 'John Doe',
    'age': 20,
    'major': 'Computer Science'
  };

  // JavaScript arrays (which are basically just objects with bracket notation):
  let fruits = ['apple', 'banana', 'cherry'];
  // JavaScript is a weakly typed language, and its object system can be confusing sometimes
  fruits["can_this"] = "work?"
  fruits.one = 1
  console.log(fruits.can_this)
  console.log(fruits.one)

  // JavaScript sets:
  let set = new Set([1, 2, 3, 4, 5]);

  // Variable types are also not fixed:
  fruits = 4
  console.log(fruits)

  // Primitives can not have new properties attached
  fruits.test = "test"
  console.log(fruits.test) // undefined
  
  // Functions can be stored in variables ...
  const fn = showAndLogWarning
  fn("Test")
  // ... and since functions are objects, they can also have properties
  fn.why_not = "here we go"
  console.log(fn) // shows information about the function, including its property "why_not"
}

function controlFlow() {
  let x = 10;
  if (x > 5) {
    console.log('x is greater than 5');
  }

  for (let i = 0; i < 5; i++) {
    console.log(i);
  }

  let person = {fname:"John", lname:"Doe", age:25};

  // prints fname, lname, age
  for (let x in person) {
    console.log(x);
  }

  let cars = ['BMW', 'Volvo', 'Mini'];

  // This for-of loop ...
  for (let x of cars) {
    console.log(x);
  }

  // ... is equivalent to this for-in loop
  for (let i in cars) {
    console.log(cars[i]);
  }
}