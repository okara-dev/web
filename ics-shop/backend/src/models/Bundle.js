const supabase = require('../config/supabase');
const crypto = require('crypto');
const path = require('path');

class Bundle {
    static async getAll() {
        const { data, error } = await supabase
            .from('bundles')
            .select('*')
            .order('sort_order');
        
        if (error) throw error;
        return data.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getById(id) {
        const { data, error } = await supabase
            .from('bundles')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data) data.price = parseFloat(data.price) || 0;
        return data;
    }
    
    static async getEbooksForBundle(bundleId) {
        const { data, error } = await supabase
            .from('bundle_ebooks')
            .select('*')
            .eq('bundle_id', bundleId)
            .order('sort_order');
        
        if (error) throw error;
        return data || [];
    }
    
    static async getUserBundle(userId) {
        const { data, error } = await supabase
            .from('user_bundles')
            .select(`
                id,
                purchased_at,
                bundles (*)
            `)
            .eq('user_id', userId)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data && data.bundles) {
            data.bundles.price = parseFloat(data.bundles.price) || 0;
        }
        return data;
    }
    
    static async hasUserPurchased(userId, bundleId) {
        const { data, error } = await supabase
            .from('user_bundles')
            .select('id')
            .eq('user_id', userId)
            .eq('bundle_id', bundleId)
            .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }
    
    static async purchase(userId, bundleId) {
        const { data, error } = await supabase
            .from('user_bundles')
            .upsert({
                user_id: userId,
                bundle_id: bundleId,
                purchased_at: new Date().toISOString()
            }, { onConflict: 'user_id,bundle_id' })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async getUserBundleEbooks(userId, bundleId) {
        const { data, error } = await supabase
            .from('bundle_ebooks')
            .select('*')
            .eq('bundle_id', bundleId)
            .order('sort_order');
        
        if (error) throw error;
        return data || [];
    }
    
    static async recordBundleEbookDownload(userId, bundleEbookId) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        
        const { error } = await supabase
            .from('user_bundle_ebooks')
            .upsert({
                user_id: userId,
                bundle_ebook_id: bundleEbookId,
                download_token: downloadToken,
                downloaded_at: new Date().toISOString()
            }, { onConflict: 'user_id,bundle_ebook_id' });
        
        if (error) throw error;
        return downloadToken;
    }
    
    static getBundleEbookPath(ebook) {
        return path.join(__dirname, '../../uploads/bundle_eb', ebook.file_name);
    }
}

module.exports = Bundle;