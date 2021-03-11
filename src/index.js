const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  try {
    const { username } = request.headers;
    
    const user = users.find(user => user.username === username);

    if (!user) {
      return response.status(404).json({ error: 'User not found!' });
    }

    request.user = user;

    next();
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
}

app.post('/users', (request, response) => {
  try {
    const { name, username } = request.body;

    User = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }

    users.find(User => {
      if (User.username === username) {
        return response.status(400).json({ error: 'User already exists!'});
      } 
    })

    users.push(User);

    return response.status(201).json(User);
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const todos = request.user.todos;

    return response.status(200).json(todos);
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { user } = request;

    const Todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(Todo);
    
    return response.status(201).send(Todo);
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { title, deadline } = request.body;
    const { id } = request.params;
    const { user } = request;
    let idExists = false;
    let todoResponse;

    users.find(User => {
      if (User.username === user.username) {
        User.todos.map(todo => {
          if (todo.id === id) {
            todo.title = title;
            todo.deadline = deadline;

            idExists = true;
            todoResponse = todo;
          }
        });
      }
    });

    if (!idExists) {
      return response.status(404).json({ error: 'Id doesnt exist!' });
    }

    return response.status(203).json(todoResponse);
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  try {
    const { id } = request.params;
    const { user } = request;
    let idExists = false;
    let todoResponse;

    users.find(User => {
      if (User.username === user.username) {
        User.todos.map(todo => {
          if (todo.id === id) {
            todo.done = true;
            idExists = true;
            todoResponse = todo;
          }
        });
      }
    });

    if (!idExists) {
      return response.status(404).json({ error: 'Id doesnt exist!' });
    }

    return response.status(203).json(todoResponse);
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  try {
    const { id } = request.params;
    const { user } = request;
    let idExists = false;

    users.find(User => {
      if (User.username === user.username) {
        let ct = 0;
        User.todos.map(todo => {
          if (todo.id === id) {
            User.todos.splice(ct, 1)
            idExists = true;
          }
          ct++
        });
      }
    });

    if (!idExists) {
      return response.status(404).json({ error: 'Id doesnt exist!' });
    }

    return response.status(204).send();
  } catch (e) {
    return response.status(500).json({ error: 'Internal Server Error'});
  }
});

module.exports = app;