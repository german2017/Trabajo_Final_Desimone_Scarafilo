const { readData, writeData } = require('../utils/fileDb');
const path = require('path');

const USERS_FILE = 'users.json';

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const users = await readData(USERS_FILE);
    const user = users.find((item) => item.email === email && item.password === password);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const { password: _password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    const { name, email, password, role = 'tenant' } = req.body;
    const users = await readData(USERS_FILE);

    if (users.some((item) => item.email === email)) {
      return res.status(400).json({ success: false, message: 'El correo ya está registrado' });
    }

    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password,
      role
    };

    users.push(newUser);
    await writeData(USERS_FILE, users);

    const { password: _password, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  register
};
