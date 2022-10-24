const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

/* 
  Middleware para verificar:
    - Rota solicitada
    - Método utilizado
*/

function middlewareApiLog(request, response, next) {
  var fullUrl =
    request.protocol + "://" + request.get("host") + request.originalUrl;

  console.log("----------------------------------------------------");
  console.log("Log: ", "INICIO");
  console.log("rota solicitada: ", fullUrl);
  console.log("metodo: ", request.method);
  console.log("----------------------------------------------------");
  console.log("headers: ", request.headers);
  console.log("routeParams: ", request.params);
  console.log("queryParams: ", request.query);
  console.log("body: ", request.body);
  console.log("----------------------------------------------------");
  console.log("Log: ", "FIM");
  console.log("----------------------------------------------------");

  return next();
}

/* 
  Adicionando o middlewareApiLog para todas as rotas
*/

app.use(middlewareApiLog);

/* 
  Middleware para validação do usuário da requisição
*/

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

/* 
  Métodos a rota /users
  Buscar todos os usuários
*/

app.get("/users", (request, response) => {
  return response.status(200).json(users);
});

/* 
  Métodos a rota /users
  Adicionar um novo usuário
*/

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

/* 
  Métodos a rota /todos
  Buscar todos os todos de um usuário
*/

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

/* 
  Métodos a rota /todos
  Adicionar um novo todo
*/

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

/* 
  Métodos a rota /todos
  Atualizar um todo
*/

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

/* 
  Métodos a rota /todos
  Fechar um todo
*/

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.status(200).json(todo);
});

/* 
  Métodos a rota /todos
  Apagar um todo
*/

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todo, 1);

  return response.status(204).json();
});

/*
  Iniciando o servidor na porta 3333
  Vinculo com o express
  Arquivo: src/server.js
*/

module.exports = app;
