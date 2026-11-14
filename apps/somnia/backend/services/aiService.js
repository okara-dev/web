const axios = require('axios');
require('dotenv').config();

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
    
    // 🔥 Modell-Liste mit Priorität
    this.models = [
      'cohere/north-mini-code:free',           // 1. Schnell & zuverlässig
      'openrouter/owl-alpha',                   // 2. Fallback
      'nvidia/nemotron-3-ultra-550b-a55b:free', // 3. Stark aber langsam
    ];
  }

  // 🔥 NEU: Bessere JSON-Extraktion
  extractJSON(content) {
    // Versuche JSON zu finden
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        // JSON ist kaputt, versuche zu reparieren
      }
    }

    // Versuche JSON mit Anführungszeichen zu reparieren
    try {
      // Entferne Kommentare und führende/trailing Text
      let cleaned = content.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      return JSON.parse(cleaned);
    } catch (e) {
      // Fallback: Extrahiere Schlüssel-Werte manuell
      return this.extractKeyValues(content);
    }
  }

  // 🔥 NEU: Manuelle Extraktion wenn JSON kaputt ist
  extractKeyValues(content) {
    const result = {
      symbols: [],
      emotional_meaning: '',
      daily_connection: '',
      patterns: [],
      interpretation: ''
    };

    // Suche nach Symbolen
    const symbolsMatch = content.match(/"symbols"\s*:\s*\[([^\]]*)\]/);
    if (symbolsMatch) {
      result.symbols = symbolsMatch[1]
        .split(',')
        .map(s => s.trim().replace(/["']/g, ''))
        .filter(s => s);
    }

    // Suche nach emotional_meaning
    const emMatch = content.match(/"emotional_meaning"\s*:\s*"([^"]*)"/);
    if (emMatch) result.emotional_meaning = emMatch[1];

    // Suche nach daily_connection
    const dcMatch = content.match(/"daily_connection"\s*:\s*"([^"]*)"/);
    if (dcMatch) result.daily_connection = dcMatch[1];

    // Suche nach patterns
    const patternsMatch = content.match(/"patterns"\s*:\s*\[([^\]]*)\]/);
    if (patternsMatch) {
      result.patterns = patternsMatch[1]
        .split(',')
        .map(s => s.trim().replace(/["']/g, ''))
        .filter(s => s);
    }

    // Suche nach interpretation
    const intMatch = content.match(/"interpretation"\s*:\s*"([^"]*)"/);
    if (intMatch) result.interpretation = intMatch[1];

    // Wenn nichts gefunden, nimm den ganzen Text als Interpretation
    if (!result.interpretation && content) {
      result.interpretation = content.substring(0, 500);
    }

    return result;
  }

  async analyzeDream(dreamText, sleepQuality, sleepHours) {
    console.log('🧠 Starte KI-Analyse...');
    console.log('📝 Traumlänge:', dreamText.length, 'Zeichen');
    
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];
      console.log(`🔄 Versuche Modell ${i + 1}/${this.models.length}: ${model}`);
      
      try {
        const result = await this._callModel(model, dreamText, sleepQuality, sleepHours);
        console.log(`✅ Modell ${model} erfolgreich!`);
        return result;
      } catch (error) {
        console.error(`❌ Modell ${model} fehlgeschlagen:`, error.message);
        if (i === this.models.length - 1) {
          throw new Error(`Alle Modelle fehlgeschlagen. Letzter Fehler: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  async _callModel(model, dreamText, sleepQuality, sleepHours) {
    const prompt = `
      Du bist ein Traumdeutungsexperte. Analysiere folgenden Traum:

      Traum: "${dreamText.substring(0, 2000)}"
      Schlafqualität: ${sleepQuality || 'Nicht angegeben'}/10
      Schlafdauer: ${sleepHours || 'Nicht angegeben'} Stunden

      Bitte analysiere:
      1. Die wichtigsten Symbole im Traum
      2. Mögliche emotionale Bedeutung
      3. Verbindung zum Alltag
      4. Wiederkehrende Muster

      Gib die Analyse in folgendem JSON-Format zurück. Verwende KEINE Erklärungen, NUR das JSON:

      {
        "symbols": ["Symbol1", "Symbol2", "Symbol3"],
        "emotional_meaning": "Beschreibung der emotionalen Bedeutung",
        "daily_connection": "Verbindung zum Alltag",
        "patterns": ["Muster1", "Muster2"],
        "interpretation": "Detaillierte Traumdeutung"
      }
    `;

    const response = await axios.post(
      this.apiUrl,
      {
        model: model,
        messages: [
          { role: 'system', content: 'Du bist ein Experte für Traumdeutung. Antworte NUR mit gültigem JSON. Keine Erklärungen, nur das JSON-Objekt.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 800
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
          'X-Title': 'DreamWeaver'
        },
        timeout: 30000
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('📝 AI Response erhalten, Länge:', content.length);
    
    // 🔥 Verbesserte JSON-Extraktion
    const parsed = this.extractJSON(content);
    
    // Stelle sicher, dass alle Felder existieren
    return {
      symbols: parsed.symbols || ['Symbolanalyse nicht verfügbar'],
      emotional_meaning: parsed.emotional_meaning || 'Keine emotionale Bedeutung erkannt',
      daily_connection: parsed.daily_connection || 'Keine Alltagsverbindung erkannt',
      patterns: parsed.patterns || ['Keine Muster erkannt'],
      interpretation: parsed.interpretation || content.substring(0, 300)
    };
  }

  async detectRecurringThemes(dreams) {
    // 🔥 Gleiche Logik mit verbesserter JSON-Extraktion
    const dreamTexts = dreams.map(d => d.dream_text).join('\n---\n');
    
    for (let i = 0; i < this.models.length; i++) {
      const model = this.models[i];
      try {
        const prompt = `
          Analysiere die folgenden Träume und identifiziere wiederkehrende Themen, Symbole und Muster:

          ${dreamTexts.substring(0, 3000)}

          Gib die Analyse in folgendem JSON-Format zurück. NUR JSON, keine Erklärungen:

          {
            "recurring_themes": ["Thema1", "Thema2", "Thema3"],
            "recurring_symbols": ["Symbol1", "Symbol2", "Symbol3"],
            "emotional_patterns": ["Muster1", "Muster2"],
            "summary": "Zusammenfassung der wiederkehrenden Muster"
          }
        `;

        const response = await axios.post(
          this.apiUrl,
          {
            model: model,
            messages: [
              { role: 'system', content: 'Du bist ein Experte für Mustererkennung in Träumen. Antworte NUR mit gültigem JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.5,
            max_tokens: 600
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
              'X-Title': 'DreamWeaver'
            },
            timeout: 30000
          }
        );

        const content = response.data.choices[0].message.content;
        const parsed = this.extractJSON(content);
        return {
          recurring_themes: parsed.recurring_themes || ['Keine Themen erkannt'],
          recurring_symbols: parsed.recurring_symbols || ['Keine Symbole erkannt'],
          emotional_patterns: parsed.emotional_patterns || ['Keine Muster erkannt'],
          summary: parsed.summary || content.substring(0, 200)
        };
      } catch (error) {
        console.error(`❌ Theme Detection mit ${model} fehlgeschlagen:`, error.message);
        if (i === this.models.length - 1) throw error;
      }
    }
  }

async generateLucidDreamingTip(dreamText) {
    // 🔥 Größere Auswahl an Tipps (zufällige Auswahl)
    const lucidTipsPool = [
        {
            tips: [
                "Führe tagsüber regelmäßig Realitätschecks durch: Frage dich 'Träume ich?' und zähle deine Finger",
                "Führe ein Traumtagebuch – schreibe jeden Traum sofort nach dem Aufwachen auf",
                "Meditiere 5-10 Minuten vor dem Schlafengehen und visualisiere einen Klartraum"
            ],
            reality_check: "Zähle deine Finger – im Traum sehen sie oft anders aus",
            affirmation: "Ich werde im Traum erkennen, dass ich träume"
        },
        {
            tips: [
                "Versuche MILD (Mnemonic Induction of Lucid Dreams): Sage dir beim Einschlafen 'Ich werde erkennen, dass ich träume'",
                "Suche nach Traumsymbolen: Bestimmte Symbole (Spiegel, fliegen, fallen) sind häufige Traumzeichen",
                "Stehe 4-5 Stunden nach dem Einschlafen kurz auf, bleibe 30-60 Minuten wach und geh dann wieder schlafen (WBTB)"
            ],
            reality_check: "Drücke deinen Finger durch deine Handfläche – im Traum geht das",
            affirmation: "Jede Nacht werde ich bewusster in meinen Träumen"
        },
        {
            tips: [
                "Probiere SSILD (Senses Initiated Lucid Dream): Wecke dich nach 4-5 Stunden auf und fokussiere abwechselnd auf Sehen, Hören und Fühlen",
                "Achte im Alltag auf ungewöhnliche Dinge – das trainiert dein Gehirn, auch im Traum Muster zu erkennen",
                "Schreibe vor dem Schlafengehen auf, was du heute erlebt hast – das verbessert die Traumerinnerung"
            ],
            reality_check: "Versuch eine Lampe an- oder auszuschalten – im Traum funktioniert das oft nicht",
            affirmation: "Mein Unterbewusstsein zeigt mir den Weg zum Klartraum"
        },
        {
            tips: [
                "Mach täglich einen 'Reality Check' (z.B. Nase zuhalten und versuchen zu atmen – im Traum geht das)",
                "Visualisiere vor dem Einschlafen einen Traum, in dem du weißt, dass du träumst",
                "Richte deine Schlafumgebung so ein, dass du ungestört schlafen kannst – eine gute Schlafhygiene fördert Klarträume"
            ],
            reality_check: "Springe hoch – im Traum schwebst du oder bleibst länger in der Luft",
            affirmation: "Ich bin der Regisseur meiner Träume"
        },
        {
            tips: [
                "Fokussiere dich tagsüber auf deine Hände – schau sie dir genau an. Im Traum erscheinen sie oft verzerrt.",
                "Mache dir eine kleine Markierung auf deiner Hand (z.B. einen Punkt). Wenn du sie siehst, mach einen Reality-Check.",
                "Träume oft von denselben Orten? Nutze diese als Auslöser für Klarheit im Traum."
            ],
            reality_check: "Schau auf deine Uhr, schau weg, schau nochmal – im Traum ändert sich die Zeit oft",
            affirmation: "Ich erkenne die Zeichen meiner Träume"
        },
        {
            tips: [
                "Höre vor dem Schlafen ein Audio für luzides Träumen (Binaural Beats in der Delta/Theta-Frequenz)",
                "Lege dir einen 'Traumanker' zu: Etwas, das du im Traum immer wieder siehst (z.B. eine bestimmte Farbe oder Form)",
                "Wenn du aufwachst, bleib liegen und versuche, dich an den ganzen Traum zu erinnern – das trainiert das Traumgedächtnis"
            ],
            reality_check: "Lies einen Text, schau weg, lies nochmal – im Traum verändert sich der Text",
            affirmation: "Meine Träume sind meine zweite Realität"
        }
    ];

    // 🔥 Zufälligen Tipp-Satz auswählen
    const randomIndex = Math.floor(Math.random() * lucidTipsPool.length);
    const selected = lucidTipsPool[randomIndex];

    return {
        tips: selected.tips,
        reality_check: selected.reality_check,
        affirmation: selected.affirmation
    };
}
}

module.exports = new AIService();