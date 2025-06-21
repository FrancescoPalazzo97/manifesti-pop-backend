const { createTransporter } = require('../config/emailConfig');

class EmailService {
    constructor() {
        this.transporter = createTransporter();
    }

    // Email di benvenuto
    async sendWelcomeEmail(userEmail, userName) {
        const mailOptions = {
            from: '"Il Tuo App" <noreply@tuaapp.com>',
            to: userEmail,
            subject: 'Benvenuto nella nostra app!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Ciao ${userName}!</h2>
          <p>Grazie per esserti registrato alla nostra applicazione.</p>
          <p>Ora puoi accedere e iniziare a utilizzare tutte le funzionalità.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Questa è un'email automatica, per favore non rispondere.
          </p>
        </div>
      `,
            text: `Ciao ${userName}! Grazie per esserti registrato alla nostra applicazione.`
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email inviata:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Errore invio email:', error);
            return { success: false, error: error.message };
        }
    }

    // ✅ NUOVA - Email di conferma ordine
    async sendOrderConfirmationEmail(orderData) {
        const {
            customerEmail,
            customerName,
            orderId,
            orderDate,
            items,
            subtotal,
            shippingCost,
            total,
            shippingAddress
        } = orderData;

        const orderItemsHtml = items.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 10px; vertical-align: top;">
                    <img src="${item.image_url || 'https://via.placeholder.com/80x100'}" 
                         alt="${item.title}" 
                         style="width: 80px; height: 100px; object-fit: cover; border-radius: 8px;">
                </td>
                <td style="padding: 15px 10px; vertical-align: top;">
                    <h4 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${item.title}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        Quantità: ${item.quantity}
                    </p>
                    ${item.discount ? `
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                            <span style="text-decoration: line-through; color: #999;">€${item.originalPrice}</span>
                            <span style="color: #e74c3c; font-weight: bold; margin-left: 8px;">€${item.finalPrice}</span>
                        </p>
                    ` : `
                        <p style="margin: 5px 0 0 0; color: #333; font-weight: bold;">€${item.finalPrice}</p>
                    `}
                </td>
                <td style="padding: 15px 10px; vertical-align: top; text-align: right;">
                    <strong style="color: #333; font-size: 16px;">€${(item.finalPrice * item.quantity).toFixed(2)}</strong>
                </td>
            </tr>
        `).join('');

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conferma Ordine</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        .content {
            padding: 30px 20px;
        }
        .order-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .order-info h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
        }
        .info-value {
            color: #495057;
        }
        .items-section h3 {
            color: #495057;
            margin-bottom: 20px;
            font-size: 20px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .summary {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
        }
        .summary-row.total {
            border-top: 2px solid #dee2e6;
            padding-top: 15px;
            margin-top: 15px;
            font-size: 18px;
            font-weight: bold;
        }
        .shipping-info {
            background-color: #e3f2fd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }
        .shipping-info h4 {
            color: #1976d2;
            margin-bottom: 15px;
        }
        .footer {
            background-color: #343a40;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .footer p {
            margin-bottom: 10px;
            color: #adb5bd;
        }
        .success-badge {
            background-color: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 20px;
        }
        .order-number {
            background-color: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 6px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
        }
        .order-number strong {
            color: #1976d2;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🎉 Ordine Confermato!</h1>
            <p>Grazie per il tuo acquisto, ${customerName}</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="success-badge">✅ Ordine ricevuto con successo</div>
            
            <div class="order-number">
                <strong>Numero Ordine: #${orderId}</strong><br>
                <small style="color: #666;">Data: ${orderDate}</small>
            </div>

            <!-- Order Info -->
            <div class="order-info">
                <h3>📋 Dettagli Ordine</h3>
                <div class="info-row">
                    <span class="info-label">Cliente:</span>
                    <span class="info-value">${customerName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${customerEmail}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Data Ordine:</span>
                    <span class="info-value">${orderDate}</span>
                </div>
            </div>

            <!-- Items Section -->
            <div class="items-section">
                <h3>🛍️ Prodotti Ordinati</h3>
                <table class="items-table">
                    <tbody>
                        ${orderItemsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Summary -->
            <div class="summary">
                <div class="summary-row">
                    <span>Subtotale:</span>
                    <span>€${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Spedizione:</span>
                    <span>${shippingCost === 0 ? 'GRATUITA' : `€${shippingCost.toFixed(2)}`}</span>
                </div>
                <div class="summary-row total">
                    <span>TOTALE:</span>
                    <span style="color: #28a745;">€${total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Shipping Info -->
            <div class="shipping-info">
                <h4>🚚 Indirizzo di Spedizione</h4>
                <p><strong>${customerName}</strong></p>
                <p>${shippingAddress}</p>
            </div>

            <!-- Next Steps -->
            <div style="margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-bottom: 10px;">📦 Prossimi Passi</h4>
                <ul style="color: #856404; padding-left: 20px;">
                    <li>Riceverai un'email di conferma spedizione entro 24-48 ore</li>
                    <li>I tempi di consegna sono di 3-5 giorni lavorativi</li>
                    <li>Potrai tracciare il tuo pacco tramite il link che ti invieremo</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Grazie per aver scelto la nostra app!</strong></p>
            <p>Per assistenza, contattaci a: support@tuaapp.com</p>
            <p style="font-size: 12px; margin-top: 20px;">
                Questa è un'email automatica, per favore non rispondere direttamente.
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const mailOptions = {
            from: '"Poster Shop" <orders@tuaapp.com>',
            to: customerEmail,
            subject: `Conferma Ordine #${orderId} - Grazie per il tuo acquisto!`,
            html: emailHtml,
            text: `
Ordine Confermato!

Ciao ${customerName},

Il tuo ordine #${orderId} è stato ricevuto con successo.

Prodotti ordinati:
${items.map(item => `- ${item.title} (Qty: ${item.quantity}) - €${(item.finalPrice * item.quantity).toFixed(2)}`).join('\n')}

Totale: €${total.toFixed(2)}

Indirizzo di spedizione:
${shippingAddress}

Grazie per il tuo acquisto!
            `
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email conferma ordine inviata:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Errore invio email conferma ordine:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();