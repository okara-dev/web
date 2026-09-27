const Bundle = require('../models/Bundle');
const fs = require('fs');

class BundleController {
    static async getAll(req, res) {
        try {
            const bundles = await Bundle.getAll();
            
            const bundlesWithEbooks = await Promise.all(bundles.map(async (bundle) => {
                const ebooks = await Bundle.getEbooksForBundle(bundle.id);
                return { ...bundle, ebooks };
            }));
            
            res.json(bundlesWithEbooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch bundles' });
        }
    }
    
    static async purchase(req, res) {
        try {
            const { bundleId } = req.body;
            const userId = req.user.id;
            
            const bundle = await Bundle.getById(bundleId);
            if (!bundle) {
                return res.status(404).json({ error: 'Bundle not found' });
            }
            
            const alreadyPurchased = await Bundle.hasUserPurchased(userId, bundleId);
            if (alreadyPurchased) {
                return res.status(400).json({ error: 'Already purchased' });
            }
            
            await Bundle.purchase(userId, bundleId);
            
            // Alle Bundle-eBooks für den User verfügbar machen
            const ebooks = await Bundle.getEbooksForBundle(bundleId);
            for (const ebook of ebooks) {
                await Bundle.recordBundleEbookDownload(userId, ebook.id);
            }
            
            res.json({ 
                success: true, 
                message: 'Bundle purchased successfully'
            });
        } catch (error) {
            console.error('Purchase error:', error);
            res.status(500).json({ error: 'Purchase failed' });
        }
    }
    
    static async getUserBundle(req, res) {
        try {
            const userId = req.user.id;
            const userBundle = await Bundle.getUserBundle(userId);
            
            if (!userBundle) {
                return res.json({ hasBundle: false, ebooks: [] });
            }
            
            const ebooks = await Bundle.getUserBundleEbooks(userId, userBundle.bundles.id);
            
            res.json({ 
                hasBundle: true, 
                bundle: userBundle.bundles,
                ebooks 
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user bundle' });
        }
    }
    
    static async downloadBundleEbook(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;
            
            // Prüfen ob User das Bundle gekauft hat
            const userBundle = await Bundle.getUserBundle(userId);
            if (!userBundle) {
                return res.status(403).json({ error: 'You have not purchased the bundle' });
            }
            
            // eBook finden
            const { data: ebook, error } = await require('../config/supabase')
                .from('bundle_ebooks')
                .select('*')
                .eq('slug', slug)
                .single();
            
            if (error || !ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }
            
            const filePath = Bundle.getBundleEbookPath(ebook);
            
            if (!fs.existsSync(filePath)) {
                console.error('File not found:', filePath);
                return res.status(404).json({ error: 'File not found' });
            }
            
            await Bundle.recordBundleEbookDownload(userId, ebook.id);
            
            res.download(filePath, ebook.file_name, (err) => {
                if (err) console.error('Download error:', err);
            });
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Download failed' });
        }
    }
}

module.exports = BundleController;