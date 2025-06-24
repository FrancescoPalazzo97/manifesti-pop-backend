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

    // ✅ Email di conferma ordine con design rinnovato
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
            <div class="product-item" style="border-bottom: 1px solid #f0f0f0; padding: 20px 15px; display: flex; align-items: flex-start; gap: 15px;">
                <div class="product-image" style="flex-shrink: 0; position: relative;">
                    <img src="${item.image_url || 'https://via.placeholder.com/90x110'}" 
                         alt="${item.title}" 
                         style="width: 90px; height: 110px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    ${item.discount ? `
                        <div style="position: absolute; top: -8px; right: -8px; background: linear-gradient(135deg, #D13B3B, #FF6B6B); color: white; font-size: 10px; padding: 4px 8px; border-radius: 12px; font-weight: bold; box-shadow: 0 2px 8px rgba(209,59,59,0.3);">
                            SCONTO
                        </div>
                    ` : ''}
                </div>
                <div class="product-details" style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 12px 0; color: #2C3E50; font-size: 17px; font-weight: 600; line-height: 1.3; word-wrap: break-word;">${item.title}</h4>
                    <div style="margin-bottom: 12px;">
                        <span style="background-color: #F8F9FA; color: #6C757D; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; display: inline-block;">
                            Qty: ${item.quantity}
                        </span>
                    </div>
                    <div class="price-section" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div class="unit-price">
                            ${item.discount ? `
                                <div style="margin-bottom: 4px;">
                                    <span style="text-decoration: line-through; color: #ADB5BD; font-size: 14px; margin-right: 8px;">€${item.originalPrice}</span>
                                    <span style="color: #D13B3B; font-weight: bold; font-size: 16px;">€${item.finalPrice}</span>
                                </div>
                            ` : `
                                <div style="color: #2C3E50; font-weight: 600; font-size: 16px;">€${item.finalPrice}</div>
                            `}
                        </div>
                        <div class="total-price" style="background: linear-gradient(135deg, #D13B3B, #FF6B6B); color: white; padding: 8px 16px; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(209,59,59,0.25); white-space: nowrap;">
                            €${(item.finalPrice * item.quantity).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conferma Ordine</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2C3E50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
        }
        
        .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #D13B3B 0%, #FF6B6B 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="1" fill="white" opacity="0.05"/><circle cx="10" cy="60" r="1" fill="white" opacity="0.05"/><circle cx="90" cy="40" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            animation: float 20s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        .header h1 {
            font-size: 32px;
            margin-bottom: 12px;
            font-weight: 700;
            position: relative;
            z-index: 2;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.95;
            position: relative;
            z-index: 2;
            font-weight: 400;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .success-badge {
            background: linear-gradient(135deg, #28A745, #20C997);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 15px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            margin-bottom: 25px;
            box-shadow: 0 8px 25px rgba(40,167,69,0.3);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        .order-number {
            background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
            border: 2px solid #D13B3B;
            border-radius: 16px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
            position: relative;
            overflow: hidden;
        }
        
        .order-number::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(209,59,59,0.1), transparent);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }
        
        .order-number strong {
            color: #D13B3B;
            font-size: 20px;
            font-weight: 700;
        }
        
        .order-info {
            background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
            border-radius: 16px;
            padding: 25px;
            margin-bottom: 35px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border: 2px solid #F1F3F4;
        }
        
        .order-info h3 {
            color: #2C3E50;
            margin-bottom: 20px;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 0;
            border-bottom: 1px solid #F1F3F4;
        }
        
        .info-row:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 600;
            color: #6C757D;
            font-size: 15px;
        }
        
        .info-value {
            color: #2C3E50;
            font-weight: 500;
            font-size: 15px;
        }
        
        .items-section h3 {
            color: #2C3E50;
            margin-bottom: 25px;
            font-size: 22px;
            font-weight: 600;
            display: flex;
            align-items: center;
            padding-bottom: 15px;
            border-bottom: 3px solid;
            border-image: linear-gradient(135deg, #D13B3B, #FF6B6B) 1;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 35px;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .summary {
            background: linear-gradient(135deg, #F8F9FA, #FFFFFF);
            border-radius: 16px;
            padding: 25px;
            margin-top: 35px;
            border: 2px solid #E9ECEF;
            box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px 0;
            font-size: 16px;
        }
        
        .summary-row.total {
            border-top: 3px solid #D13B3B;
            padding-top: 20px;
            margin-top: 20px;
            font-size: 20px;
            font-weight: 700;
        }
        
        .summary-row.total span:last-child {
            background: linear-gradient(135deg, #D13B3B, #FF6B6B);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            box-shadow: 0 6px 20px rgba(209,59,59,0.4);
        }
        
        .shipping-info {
            background: linear-gradient(135deg, #E3F2FD, #F3E5F5);
            border-radius: 16px;
            padding: 25px;
            margin-top: 35px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border: 2px solid #E1F5FE;
        }
        
        .shipping-info h4 {
            color: #D13B3B;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .next-steps {
            margin-top: 35px;
            padding: 25px;
            background: linear-gradient(135deg, #FFF8E1, #FFECB3);
            border-radius: 16px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border: 2px solid #FFE082;
        }
        
        .next-steps h4 {
            color: #F57C00;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .next-steps ul {
            color: #F57C00;
            padding-left: 20px;
            line-height: 1.8;
        }
        
        .next-steps li {
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .footer {
            background: linear-gradient(135deg, #2C3E50, #34495E);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 12px;
            color: #BDC3C7;
            font-weight: 400;
        }
        
        .footer p:first-child {
            color: white;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .footer p:last-child {
            font-size: 13px;
            margin-top: 25px;
            opacity: 0.8;
        }
        
        /* Responsive Design */
        @media (max-width: 600px) {
            body {
                padding: 10px 0;
            }
            
            .container {
                margin: 0 10px;
                border-radius: 16px;
                max-width: calc(100% - 20px);
            }
            
            .content {
                padding: 25px 20px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
                line-height: 1.2;
            }
            
            .header p {
                font-size: 16px;
            }
            
            .order-info, .shipping-info, .next-steps, .summary {
                padding: 20px 15px;
                margin-bottom: 25px;
            }
            
            .order-number {
                padding: 20px 15px;
                margin: 20px 0;
            }
            
            .order-number strong {
                font-size: 18px;
            }
            
            /* Mobile Product Items */
            .product-item {
                flex-direction: column !important;
                gap: 15px !important;
                padding: 20px 15px !important;
                text-align: center !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .product-image {
                align-self: center !important;
            }
            
            .product-image img {
                width: 80px !important;
                height: 100px !important;
            }
            
            .product-details {
                text-align: center !important;
            }
            
            .product-details h4 {
                font-size: 16px !important;
                margin-bottom: 10px !important;
                text-align: center !important;
            }
            
            .product-details > div:nth-child(2) {
                display: flex !important;
                justify-content: center !important;
            }
            
            .price-section {
                flex-direction: column !important;
                align-items: center !important;
                gap: 12px !important;
                justify-content: center !important;
            }
            
            .unit-price {
                text-align: center !important;
            }
            
            .total-price {
                padding: 10px 20px !important;
                font-size: 15px !important;
            }
            
            .summary-row {
                font-size: 14px;
                margin-bottom: 12px;
            }
            
            .summary-row.total {
                font-size: 18px;
            }
            
            .summary-row.total span:last-child {
                padding: 8px 16px;
                font-size: 16px;
            }
            
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                margin-bottom: 15px;
                padding: 10px 0;
            }
            
            .info-value {
                margin-top: 4px;
                font-weight: 600;
                color: #D13B3B;
            }
            
            .success-badge {
                font-size: 13px;
                padding: 10px 18px;
                margin-bottom: 20px;
            }
            
            .footer {
                padding: 30px 20px;
            }
            
            .footer p:first-child {
                font-size: 16px;
            }
            
            .next-steps ul {
                padding-left: 15px;
            }
            
            .next-steps li {
                font-size: 14px;
                line-height: 1.6;
            }
        }
        
        @media (max-width: 480px) {
            .container {
                margin: 0 5px;
                max-width: calc(100% - 10px);
            }
            
            .content {
                padding: 20px 15px;
            }
            
            .header {
                padding: 25px 15px;
            }
            
            .header h1 {
                font-size: 22px;
            }
            
            .product-item {
                padding: 15px 10px !important;
                text-align: center !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .product-image img {
                width: 70px !important;
                height: 90px !important;
            }
            
            .product-details h4 {
                font-size: 15px !important;
                text-align: center !important;
            }
            
            .unit-price {
                text-align: center !important;
            }
            
            .total-price {
                padding: 8px 16px !important;
                font-size: 14px !important;
            }
            
            .order-info h3, .shipping-info h4, .next-steps h4, .items-section h3 {
                font-size: 16px;
            }
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
            <div class="success-badge">
                ✅ Ordine ricevuto con successo
            </div>
            
            <div class="order-number">
                <strong>Numero Ordine: #${orderId}</strong><br>
                <small style="color: #6C757D; font-size: 14px; margin-top: 8px; display: inline-block;">Data: ${orderDate}</small>
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
                <div class="items-container" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 35px;">
                    ${orderItemsHtml}
                </div>
            </div>

            <!-- Summary -->
            <div class="summary">
                <div class="summary-row">
                    <span style="font-weight: 500;">Subtotale:</span>
                    <span style="font-weight: 600;">€${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span style="font-weight: 500;">Spedizione:</span>
                    <span style="font-weight: 600; color: ${shippingCost === 0 ? '#28A745' : '#2C3E50'};">
                        ${shippingCost === 0 ? 'GRATUITA 🎁' : `€${shippingCost.toFixed(2)}`}
                    </span>
                </div>
                <div class="summary-row total">
                    <span>TOTALE:</span>
                    <span>€${total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Shipping Info -->
            <div class="shipping-info">
                <h4>🚚 Indirizzo di Spedizione</h4>
                <p style="margin: 0; font-weight: 600; color: #2C3E50; font-size: 16px;">${customerName}</p>
                <p style="margin: 8px 0 0 0; color: #6C757D; line-height: 1.6;">${shippingAddress}</p>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
                <h4>📦 Prossimi Passi</h4>
                <ul>
                    <li>Riceverai un'email di conferma spedizione entro 24-48 ore</li>
                    <li>I tempi di consegna sono di 3-5 giorni lavorativi</li>
                    <li>Potrai tracciare il tuo pacco tramite il link che ti invieremo</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Grazie per aver scelto la nostra app!</p>
            <p>Per assistenza, contattaci a: support@tuaapp.com</p>
            <p>
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
            subject: `🎉 Conferma Ordine #${orderId} - Grazie per il tuo acquisto!`,
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