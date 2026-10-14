const ShopEbook = require('../models/ShopEbook');
const fs = require('fs');

class ShopEbookController {
    static async getAll(req, res) {
        try {
            const ebooks = await ShopEbook.getAll();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch eBooks' });
        }
    }

    static async getFreeEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getFreeEbooks();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch free eBooks' });
        }
    }

    static async getPaidEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getPaidEbooks();
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch paid eBooks' });
        }
    }

    static async getUserEbooks(req, res) {
        try {
            const ebooks = await ShopEbook.getUserEbooks(req.user.id);
            res.json(ebooks);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch user eBooks' });
        }
    }

    static async downloadFreeEbook(req, res) {
        try {
            const { slug } = req.params;
            const ebook = await ShopEbook.getBySlug(slug);

            if (!ebook) return res.status(404).json({ error: 'eBook not found' });
            if (!ebook.is_free) return res.status(403).json({ error: 'This eBook is not free' });

            const filePath = ShopEbook.getFilePath(ebook);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            res.download(filePath, ebook.file_name);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Download failed' });
        }
    }

    static async downloadPurchasedEbook(req, res) {
        try {
            const { slug } = req.params;
            const userId = req.user.id;

            const ebook = await ShopEbook.getBySlug(slug);
            if (!ebook) return res.status(404).json({ error: 'eBook not found' });

            if (ebook.is_free) {
                const filePath = ShopEbook.getFilePath(ebook);
                if (!fs.existsSync(filePath)) {
                    return res.status(404).json({ error: 'File not found' });
                }
                return res.download(filePath, ebook.file_name);
            }

            const hasPurchased = await ShopEbook.hasUserPurchased(userId, ebook.id);
            if (!hasPurchased) {
                return res.status(403).json({ error: 'You have not purchased this eBook' });
            }

            const filePath = ShopEbook.getFilePath(ebook);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ error: 'File not found' });
            }

            await ShopEbook.recordDownload(userId, ebook.id);
            res.download(filePath, ebook.file_name);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Download failed' });
        }
    }
}

module.exports = ShopEbookController;