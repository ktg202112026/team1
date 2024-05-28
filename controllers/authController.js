const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/userModels');

// 회원가입 컨트롤러
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne(username);
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User(username, hashedPassword);
    await newUser.save();

    res.send('User registered');
  } catch (error) {
    console.error('User registration failed:', error);
    res.status(500).send('User registration failed');
  }
};

// 로그인 컨트롤러
exports.loginUser = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true, // 실패 메시지 사용 여부
});

// 로그아웃 컨트롤러
exports.logoutUser = (req, res) => {
  req.logout();
  res.send('Logged out');
};

// 현재 로그인된 사용자 확인 컨트롤러
exports.getCurrentUser = (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).send('Not authenticated');
  }
};

// 사용자 정보 업데이트 컨트롤러
exports.updateUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne(username);
    if (!existingUser) {
      return res.status(404).send('User not found');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    res.send('User updated');
  } catch (error) {
    console.error('User update failed:', error);
    res.status(500).send('User update failed');
  }
};

// 사용자 삭제 컨트롤러
exports.deleteUser = async (req, res) => {
  const { username } = req.body;

  try {
    const existingUser = await User.findOne(username);
    if (!existingUser) {
      return res.status(404).send('User not found');
    }

    await existingUser.delete();

    res.send('User deleted');
  } catch (error) {
    console.error('User deletion failed:', error);
    res.status(500).send('User deletion failed');
  }
};
