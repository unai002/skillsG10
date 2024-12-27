const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const initializeDB = require('./scripts/initializeDB');

const indexRouter = require('./routes/index.routes');
const usersRouter = require('./routes/users.routes');
const skillsRouter = require('./routes/skills.routes');
const adminRouter = require('./routes/admin.routes');

const app = express();

// Conectar a la base de datos
mongoose.connect('mongodb://localhost:27017/skillsDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a la base de datos');
  initializeDB();
}).catch(err => {
  console.error('Error al conectar a la base de datos', err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Usa las rutas
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/skills', skillsRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;