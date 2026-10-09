const ShopEbook = require('../models/ShopEbook');
const Bundle = require('../models/Bundle');

class LibraryController {
    static async getLibrary(req, res) {
        try {
            const userId = req.user.id;
            const ebooks = await ShopEbook.getUserEbooks(userId);
            const userBundle = await Bundle.getUserBundle(userId);

            let bundleData = { hasBundle: false, bundle: null, ebooks: [] };
            if (userBundle) {
                const bundleEbooks = await Bundle.getUserBundleEbooks(userId, userBundle.bundles.id);
                bundleData = {
                    hasBundle: true,
                    bundle: userBundle.bundles,
                    ebooks: bundleEbooks
                };
            }

            res.json({
                success: true,
                library: { ebooks, bundle: bundleData }
            });
        } catch (error) {
            console.error('Library error:', error);
            res.status(500).json({ error: 'Failed to fetch library' });
        }
    }

    static async getEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getUserEbooks(req.user.id);
            res.json({ success: true, ebooks });
        } catch (error) {
            console.error('Library ebooks error:', error);
            res.status(500).json({ error: 'Failed to fetch library ebooks' });
        }
    }

    static async getBundle(req, res) {
        try {
            const userBundle = await Bundle.getUserBundle(req.user.id);
            if (!userBundle) {
                return res.json({ success: true, hasBundle: false, ebooks: [] });
            }
            const ebooks = await Bundle.getUserBundleEbooks(req.user.id, userBundle.bundles.id);
            res.json({
                success: true,
                hasBundle: true,
                bundle: userBundle.bundles,
                ebooks
            });
        } catch (error) {
            console.error('Library bundle error:', error);
            res.status(500).json({ error: 'Failed to fetch library bundle' });
        }
    }
}

module.exports = LibraryController;