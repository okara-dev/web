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
        return data.map(row => ({ ...row, price: parseFloat(row.price) || 0 }));
    }

    static async getFreeEbooks() {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', true)
            .order('sort_order');
        if (error) throw error;
        return data.map(row => ({ ...row, price: 0 }));
    }

    static async getPaidEbooks() {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', false)
            .order('sort_order');
        if (error) throw error;
        return data.map(row => ({ ...row, price: parseFloat(row.price) || 0 }));
    }

    static async getById(id) {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) throw error;
        if (data) data.price = parseFloat(data.price) || 0;
        return data;
    }

    static async getBySlug(slug) {
        const { data, error } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();
        if (error) throw error;
        if (data) data.price = parseFloat(data.price) || 0;
        return data;
    }

    /**
     * Liefert alle eBooks, die der User sehen darf:
     * gekaufte + kostenlose (ohne Duplikate).
     */
    static async getUserEbooks(userId) {
        const { data: purchased, error: purchError } = await supabase
            .from('user_shop_ebooks')
            .select(`
                id,
                purchased_at,
                downloaded_at,
                shop_ebooks (*)
            `)
            .eq('user_id', userId);
        if (purchError) throw purchError;

        const { data: freeEbooks, error: freeError } = await supabase
            .from('shop_ebooks')
            .select('*')
            .eq('is_free', true);
        if (freeError) throw freeError;

        const purchasedIds = (purchased || [])
            .map(p => p.shop_ebooks?.id)
            .filter(Boolean);

        const allEbooks = [
            ...(purchased || [])
                .filter(p => p.shop_ebooks)
                .map(p => ({
                    ...p.shop_ebooks,
                    price: parseFloat(p.shop_ebooks.price) || 0,
                    is_purchased: true,
                    purchased_at: p.purchased_at,
                    downloaded_at: p.downloaded_at
                })),
            ...(freeEbooks || [])
                .filter(e => !purchasedIds.includes(e.id))
                .map(e => ({
                    ...e,
                    price: 0,
                    is_purchased: false
                }))
        ];

        return allEbooks.sort((a, b) => a.sort_order - b.sort_order);
    }

    static async hasUserPurchased(userId, ebookId) {
        const { data, error } = await supabase
            .from('user_shop_ebooks')
            .select('id')
            .eq('user_id', userId)
            .eq('ebook_id', ebookId)
            .maybeSingle();
        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }

    /**
     * Wird vom LemonSqueezy-Webhook aufgerufen.
     * NICHT mehr über einen Purchase-Endpoint erreichbar.
     */
    static async grantPurchase(userId, ebookId) {
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

    static async recordDownload(userId, ebookId) {
        const { error } = await supabase
            .from('user_shop_ebooks')
            .update({ downloaded_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('ebook_id', ebookId);
        if (error) throw error;
    }

    static getFilePath(ebook) {
        return path.join(__dirname, '../../uploads/shop_eb', ebook.file_name);
    }
}

module.exports = ShopEbook;