const supabase = require('../config/supabase');
const crypto = require('crypto');
const path = require('path');

class ShopEbook {
    static async getAll() {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .order('sort_order');
        
        if (error) throw error;
        return data.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getFreeEbooks() {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', true)
            .order('sort_order');
        
        if (error) throw error;
        return data.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getPaidEbooks() {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', false)
            .order('sort_order');
        
        if (error) throw error;
        return data.map(row => ({
            ...row,
            price: parseFloat(row.price) || 0
        }));
    }
    
    static async getById(id) {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data) data.price = parseFloat(data.price) || 0;
        return data;
    }
    
    static async getBySlug(slug) {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('slug', slug)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        if (data) data.price = parseFloat(data.price) || 0;
        return data;
    }
    
    static async getUserEbooks(userId) {
        // Hole alle gekauften eBooks + kostenlose
        const { data: purchased, error: purchError } = await supabase
            .from('user_shop_ebooks')
            .select(`
                id,
                purchased_at,
                download_token,
                downloaded_at,
                shop_ebooks (*)
            `)
            .eq('user_id', userId);
        
        if (purchError) throw purchError;
        
        // Hole kostenlose eBooks
        const { data: freeEbooks, error: freeError } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', true);
        
        if (freeError) throw freeError;
        
        // Kombiniere: gekaufte + kostenlose (ohne Duplikate)
        const purchasedIds = (purchased || []).map(p => p.shop_ebooks.id);
        const allEbooks = [
            ...(purchased || []).map(p => ({
                ...p.shop_ebooks,
                price: parseFloat(p.shop_ebooks.price) || 0,
                is_purchased: true,
                downloaded_at: p.downloaded_at,
                download_token: p.download_token
            })),
            ...freeEbooks
                .filter(e => !purchasedIds.includes(e.id))
                .map(e => ({
                    ...e,
                    price: 0,
                    is_purchased: false
                }))
        ];
        
        return allEbooks.sort((a, b) => a.sort_order - b.sort_order);
    }
    
    static async purchase(userId, ebookId) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        
        const { data, error } = await supabase
            .from('user_shop_ebooks')
            .upsert({
                user_id: userId,
                ebook_id: ebookId,
                download_token: downloadToken,
                purchased_at: new Date().toISOString()
            }, { onConflict: 'user_id,ebook_id' })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    static async hasUserPurchased(userId, ebookId) {
        const { data, error } = await supabase
            .from('user_shop_ebooks')
            .select('id')
            .eq('user_id', userId)
            .eq('ebook_id', ebookId)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }
    
    static async recordDownload(userId, ebookId) {
        const downloadToken = crypto.randomBytes(32).toString('hex');
        
        const { error } = await supabase
            .from('user_shop_ebooks')
            .upsert({
                user_id: userId,
                ebook_id: ebookId,
                download_token: downloadToken,
                downloaded_at: new Date().toISOString()
            }, { onConflict: 'user_id,ebook_id' });
        
        if (error) throw error;
        return downloadToken;
    }
    
    static getFilePath(ebook) {
        return path.join(__dirname, '../../uploads/shop_eb', ebook.file_name);
    }
}

module.exports = ShopEbook;