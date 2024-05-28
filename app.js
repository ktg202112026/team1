// app.js
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 예제니까 사용자 데이터를 메모리에 저장
const users = [];

// 미들웨어 설정
app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 주소
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(passport.initialize());와 app.use(passport.session());를 사용함으로써 요청마다 passport의 미들웨어가 작동하게 됩니다.
// 이를 통해 사용자 인증 상태를 유지하고 확인할 수 있습니다.

// Passport 로컬 전략 설정
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }
  if (user.password !== password) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.username);
  // 사용자의 ID를 세션에 저장
  // 시리얼라이저에 담기는 내용 = res.send(req.user); 를 통해 프론트에 보내는 내용
});

passport.deserializeUser((username, done) => {
  const user = users.find(u => u.username === username);
  done(null, user);
});

// 회원가입 라우트
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).send('User already exists');
  }
  users.push({ username, password });
  res.send('User registered');
});

// 로그인 라우트
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.send('Logged in');
});

// 로그아웃 라우트
app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send('Logout error');
    }
    res.send('Logged out');
  });
});
// req.logout()은 Passport에서 제공하는 함수입니다. 이 함수는 현재 사용자를 로그아웃 처리하는 데 사용됩니다.

// 현재 로그인된 사용자 확인 라우트
app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).send('Not authenticated');
  }
});
// req.isAuthenticated()는 Passport에서 제공하는 함수입니다. 이 함수는 현재 요청의 인증 상태를 확인하는 데 사용됩니다.

// Catch-all route to handle undefined routes
app.use((req, res, next) => {
  res.status(404).send('Sorry, cannot find that!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
