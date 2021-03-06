const express = require('express');
const { v4: uuidv4 } = require("uuid")
const app = express();

app.use(express.json());

const customers = [];

//middleware
function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  
  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  };

  request.customer = customer;

  return next();
}

app.post("/account", (request, response) => {
  const { name, cpf } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer Already exists!" })
  }

  customers.push({
    name,
    cpf,
    id: uuidv4(),
    statement: []
  });
  return response.status(201).send()
});

app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement)
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { desc, amount} = request.body;
  const { customer } = request;
  const statementOperation = {
    desc,
    amount,
    createdAt: new Date(),
    type: "Credit"
  }
  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.listen(8081);