const { GoogleGenerativeAI } = require('@google/generative-ai');
const connection = require(`../data/db`);

// Inizializza Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Funzione per ottenere i dati dal database
const getPostersFromDB = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM posters ORDER BY title ASC';
        connection.query(sql, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

// Funzione per formattare i dati per l'IA
const formatPostersForAI = (posters) => {
    return posters.map(poster => {
        const isAvailable = poster.stock_quantity > 0;
        const hasDiscount = poster.discount && poster.discount > 0;

        return `
            **${poster.title}** - ${poster.artist}
            - Prezzo: ${hasDiscount ? `~~${poster.price}€~~ ${(poster.price * (1 - poster.discount / 100)).toFixed(2)}€ (-${poster.discount}% SCONTO!)` : `${poster.price}€`}
            - Taglia: ${poster.size}
            - Disponibilità: ${isAvailable ? `${poster.stock_quantity} pezzi disponibili` : 'NON DISPONIBILE'}
            - Anno: ${poster.year || 'N/A'}
            ${poster.description ? `- Descrizione: ${poster.description}` : ''}
        `.trim();
    }).join('\n\n');
};

const postChat = async (req, res) => {
    try {
        const { message, context } = req.body;

        // Ottieni i dati aggiornati dal database
        const posters = await getPostersFromDB();
        const postersFormatted = formatPostersForAI(posters);

        // Conta i poster disponibili e non disponibili
        const availableCount = posters.filter(p => p.stock_quantity > 0).length;
        const unavailableCount = posters.filter(p => p.stock_quantity === 0).length;
        const discountedCount = posters.filter(p => p.discount && p.discount > 0).length;

        // Configurazione del prompt di sistema aggiornata
        const SYSTEM_PROMPT = `Sei un assistente virtuale esperto e appassionato per un negozio specializzato in poster artistici dedicati alla musica pop italiana. Sei un vero curatore d'arte che unisce competenza tecnica a passione per la cultura musicale italiana.

🎵 **STATO ATTUALE DELLA COLLEZIONE (DATI IN TEMPO REALE)** 🎵
📊 **Statistiche attuali:**
- Totale poster in collezione: ${posters.length}
- Attualmente disponibili: ${availableCount}
- Temporaneamente esauriti: ${unavailableCount}
- In offerta speciale: ${discountedCount}

**POSTER NELLA COLLEZIONE (AGGIORNATI IN TEMPO REALE):**
${postersFormatted}

**REGOLE IMPORTANTI:**
- Quando un poster è "NON DISPONIBILE", informa il cliente che è temporaneamente esaurito
- Quando un poster ha uno SCONTO, evidenzialo sempre come un'opportunità imperdibile
- Fornisci sempre informazioni accurate su prezzi e disponibilità basate sui dati attuali
- Se un cliente chiede un poster specifico, controlla la disponibilità nei dati sopra

**STILI E CARATTERISTICHE:**
🎨 **Design**: Minimalista moderno, tipografia creativa, palette vibranti
🌈 **Colori dominanti**: Rossi intensi, blu profondi, arancioni caldi, rosa delicati
📏 **Formati disponibili**: sm (A4), md (A3), lg (A2/A1)
🖼️ **Materiali**: Carta fotografica premium, tela canvas, stampe fine art

**LA TUA EXPERTISE INCLUDE:**
🏠 **Interior Design**: Consigli per abbinamenti cromatici e disposizioni creative
🎵 **Storia Musicale**: Aneddoti sui brani e gli artisti dietro ogni poster
🎯 **Styling**: Suggerimenti per ogni ambiente (soggiorno, camera, ufficio, studio)
🎨 **Arte**: Spiegazioni sui movimenti artistici e le tecniche utilizzate

**IL TUO CARATTERE:**
• Entusiasta e coinvolgente, con grande passione per l'arte italiana
• Esperto ma accessibile, sai tradurre concetti complessi in linguaggio semplice  
• Creativo nell'aiutare i clienti a immaginare i poster nei loro spazi
• Attento ai dettagli estetici e agli abbinamenti armonici
• Sempre aggiornato sulle disponibilità e promozioni attuali

**COME AIUTI I CLIENTI:**
✨ **Selezione personalizzata**: Suggerisci poster disponibili in base a gusti, ambiente e stile
🏡 **Consigli d'arredo**: Abbinamenti con mobili, colori pareti, illuminazione  
📐 **Layout creativi**: Idee per composizioni murali e gallery wall
🎁 **Occasioni speciali**: Regali per appassionati di musica e arte italiana
💡 **Ispirazione**: Racconta le storie dietro ogni canzone e design
🔥 **Offerte**: Evidenzia sempre sconti e promozioni attive

**IMPORTANTE:**
- Usa SOLO i dati della collezione forniti sopra
- Verifica sempre disponibilità e prezzi attuali prima di consigliare
- Se un poster è esaurito, suggerisci alternative simili disponibili
- Evidenzia sempre gli sconti come opportunità limitate
- Sii conciso ma completo nelle risposte
- Rispondi sempre in italiano con calore e competenza

Rispondi sempre in italiano con calore, competenza e passione per l'arte italiana! 🇮🇹✨`;

        const fullPrompt = `${SYSTEM_PROMPT}\n\nDomanda del cliente: ${message}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Errore:', error);
        res.status(500).json({ error: 'Errore nella generazione della risposta' });
    }
};

module.exports = postChat;