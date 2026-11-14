// controllers/aiController.js
const { OpenAI } = require('openai');
const pool = require('../db/pool');

// ========== OPENROUTER CLIENT ==========
const openrouter = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'Emora'
    },
    timeout: 45000
});

// 🔥 Fallback Modelle
const MODELS = {
    chat: 'cohere/north-mini-code:free',
    deep: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    fallback: 'openrouter/owl-alpha'
};

// ========== HILFSFUNKTIONEN ==========

function formatResponse(text) {
    if (!text || typeof text !== 'string') {
        return '⚠️ Die Antwort konnte nicht formatiert werden. Bitte versuche es erneut.';
    }
    let formatted = text.trim();
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    formatted = formatted.replace(/^([•\-*])\s*/gm, '• ');
    formatted = formatted.replace(/\.\.+/g, '.');
    return formatted;
}

function safeExtractContent(response) {
    try {
        if (!response || !response.choices || !response.choices[0]) return null;
        const content = response.choices[0].message?.content;
        if (!content || typeof content !== 'string') return null;
        return content;
    } catch (error) {
        console.error('Fehler beim Extrahieren der Antwort:', error);
        return null;
    }
}

// 🔥 KI-Call mit Fallback
async function callOpenRouter(messages, model = MODELS.chat, retries = 2) {
    for (let attempt = 0; attempt < retries; attempt++) {
        const currentModel = attempt === 0 ? model : MODELS.fallback;
        console.log(`🧠 OpenRouter Versuch ${attempt + 1}/${retries}: ${currentModel}`);

        try {
            const response = await openrouter.chat.completions.create({
                model: currentModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 600,
                top_p: 0.9
            });

            const content = safeExtractContent(response);
            if (content) {
                console.log(`✅ OpenRouter erfolgreich (${currentModel})`);
                return content;
            }
        } catch (error) {
            console.error(`❌ Versuch ${attempt + 1} fehlgeschlagen:`, error.message);
            if (attempt === retries - 1) throw error;
        }
    }
    return null;
}

// ========== 1. RAG CHAT ==========

async function chatWithEntries(req, res) {
    const userId = req.user.id;
    const { message, conversation_history = [] } = req.body;

    try {
        if (!process.env.OPENROUTER_API_KEY) {
            return res.json({
                response: `⚠️ **KI ist nicht konfiguriert.** Bitte füge den OpenRouter API Key zur .env Datei hinzu.`
            });
        }

        // Einträge laden
        const entriesResult = await pool.query(
            `SELECT entry_date, content, mood_score, mood_tags 
             FROM entries 
             WHERE user_id = $1 
             ORDER BY entry_date DESC 
             LIMIT 30`,
            [userId]
        );

        if (entriesResult.rows.length === 0) {
            return res.json({
                response: `📝 **Du hast noch keine Tagebucheinträge.**\n\nSchreib deine Gedanken auf, dann kann ich dir helfen, dich selbst besser zu verstehen!\n\n💡 **Tipp:** Gehe zum "Tagebuch"-Tab und schreibe deinen ersten Eintrag.`
            });
        }

        const entries = entriesResult.rows;
        const context = entries.map(e => 
            `📅 ${e.entry_date} | Stimmung: ${e.mood_score}/10 | Tags: ${e.mood_tags?.join(', ') || 'keine'}\n📖 ${e.content}`
        ).join('\n\n---\n\n');

        const messages = [
            {
                role: 'system',
                content: `Du bist MindMirror, ein einfühlsamer KI-Assistent für ein Tagebuch.

HIER SIND DIE TAGEBUCHENTRÄGE DES NUTZERS:
${context}

REGELN:
1. Beziehe dich NUR auf die gegebenen Einträge
2. Antworte auf Deutsch
3. Verwende Emojis und **fett** für wichtige Begriffe
4. Maximal 200 Wörter
5. Sei einfühlsam und unterstützend`
            }
        ];

        const recentHistory = conversation_history.slice(-10);
        recentHistory.forEach(msg => {
            messages.push({ role: msg.role, content: msg.content });
        });

        messages.push({ role: 'user', content: message });

        const content = await callOpenRouter(messages, MODELS.chat);
        const formattedResponse = content ? formatResponse(content) : null;

        if (!formattedResponse) {
            return res.json({
                response: `⚠️ Die KI ist gerade nicht verfügbar. Bitte versuche es später erneut.`
            });
        }

        res.json({
            response: formattedResponse,
            usage: null
        });

    } catch (error) {
        console.error('Chat Fehler:', error);
        res.status(500).json({ error: 'KI-Chat fehlgeschlagen' });
    }
}

// ========== 2. INSIGHTS ==========

async function getInsights(req, res) {
    const userId = req.user.id;

    try {
        const statsResult = await pool.query(
            `SELECT 
                COUNT(*) as total_entries,
                ROUND(AVG(mood_score), 1) as avg_mood,
                MAX(mood_score) as best_mood,
                MIN(mood_score) as worst_mood,
                COUNT(DISTINCT entry_date) as active_days
             FROM entries 
             WHERE user_id = $1`,
            [userId]
        );

        const tagsResult = await pool.query(
            `SELECT unnest(mood_tags) as tag, COUNT(*) as count
             FROM entries 
             WHERE user_id = $1 AND mood_tags IS NOT NULL
             GROUP BY tag
             ORDER BY count DESC
             LIMIT 5`,
            [userId]
        );

        const stats = statsResult.rows[0];
        let insights = null;

        if (stats.total_entries > 0 && process.env.OPENROUTER_API_KEY) {
            try {
                const recentResult = await pool.query(
                    `SELECT content FROM entries 
                     WHERE user_id = $1 
                     ORDER BY entry_date DESC 
                     LIMIT 5`,
                    [userId]
                );

                const recentEntries = recentResult.rows.map(r => r.content).join('\n');
                const topTags = tagsResult.rows.map(t => `• ${t.tag} (${t.count}x)`).join('\n');

                const content = await callOpenRouter(
                    [
                        {
                            role: 'system',
                            content: 'Du bist ein weiser Beobachter. Gib 3-5 kurze Erkenntnisse (max 150 Wörter). Antworte auf Deutsch mit Emojis.'
                        },
                        {
                            role: 'user',
                            content: `📊 ${stats.total_entries} Einträge, Ø Stimmung ${stats.avg_mood}/10\n🏷️ ${topTags || 'Keine Tags'}\n📖 ${recentEntries}`
                        }
                    ],
                    MODELS.deep
                );

                insights = content ? formatResponse(content) : null;

            } catch (apiError) {
                console.error('Insights API Fehler:', apiError);
            }
        }

        res.json({
            stats: stats,
            top_tags: tagsResult.rows,
            insights: insights || `📊 **Deine Daten:**\n• ${stats.total_entries} Einträge\n• Ø Stimmung ${stats.avg_mood}/10\n• ${stats.active_days} aktive Tage`
        });

    } catch (error) {
        console.error('Insights Fehler:', error);
        res.status(500).json({ error: 'Insights konnten nicht geladen werden' });
    }
}

module.exports = {
    chatWithEntries,
    getInsights
};