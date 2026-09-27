const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

class User {
    static async findByEmail(email) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }
    
    static async create(email, password = null) {
        const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
        
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password_hash: hashedPassword }])
            .select('id, email')
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async updateLastLogin(userId) {
        const { error } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userId);
        
        if (error) throw error;
    }
}

module.exports = User;