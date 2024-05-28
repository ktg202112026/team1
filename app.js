require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

const app = express();
const PORT = 80;

// 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL, // 프론트엔드 주소
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

// Passport 로컬 전략 설정
passport.use(new LocalStrategy(async (username, password, done) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !user) {
    return done(null, false, { message: 'Incorrect username.' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return done(null, false, { message: 'Incorrect password.' });
  }

  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
  // 사용자의 ID를 세션에 저장
});

passport.deserializeUser(async (id, done) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  done(error, user);
});

// 회원가입 라우트
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (existingUser) {
    return res.status(400).send('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert([{ username, password: hashedPassword }]);

  if (error) {
    return res.status(500).send('User registration failed');
  }

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
