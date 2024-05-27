// models/userModel.js

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([{ email, password: hashedPassword }]);
    if (error) {
        throw error;
    }
    return data;
}

async function signInUser(email, password) {
    const { data, error } = await supabase
        .from('users')
        .select('id, password')
        .eq('email', email)
        .single();

    if (error) {
        throw error;
    }

    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    return data;
}

module.exports = {
    createUser,
    signInUser,
};
