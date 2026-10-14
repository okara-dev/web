const Bundle = require('../models/Bundle');
const supabase = require('../config/supabase');
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

    static async getUserBundle(req, res) {
        try {
            const userBundle = await Bundle.getUserBundle(req.user.id);
            if (!userBundle) {
                return res.json({ hasBundle: false, ebooks: [] });
            }
            const ebooks = await Bundle.getUserBundleEbooks(req.user.id, userBundle.bundles.id);
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

            const userBundle = await Bundle.getUserBundle(userId);
            if (!userBundle) {
                return res.status(403).json({ error: 'You have not purchased the bundle' });
            }

            const { data: ebook, error } = await supabase
                .from('bundle_ebooks')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (error || !ebook) {
                return res.status(404).json({ error: 'eBook not found' });
            }

            const filePath = Bundle.getBundleEbookPath(ebook);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            await Bundle.recordBundleEbookDownload(userId, ebook.id);
            res.download(filePath, ebook.file_name);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Download failed' });
        }
    }
}

module.exports = BundleController;