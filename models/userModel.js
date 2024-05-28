const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.SUPABASE_URL, // Supabase 프로젝트 URL
  process.env.SUPABASE_KEY // Supabase 프로젝트 키
);

// 사용자 모델 클래스
class User {
  // 생성자
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }

  // 회원가입 메서드
  async save() {
    try {
      // Supabase에 사용자 추가
      const { data, error } = await supabase
        .from('users')
        .insert([{ username: this.username, password: this.password }]);
      
      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('User registration failed:', error);
      throw error;
    }
  }

  // 사용자 조회 메서드
  static async findOne(username) {
    try {
      // Supabase에서 사용자 조회
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  // 사용자 삭제 메서드
  async delete() {
    try {
      // Supabase에서 사용자 삭제
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', this.username);
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = User;
