const express = require('express');
const emailService = require('../services/emailService');
const router = express.Router();

// Test email endpoint
router.post('/test', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                error: 'Email e nome sono richiesti'
            });
        }

        const result = await emailService.sendWelcomeEmail(email, name);

        if (result.success) {
            res.json({
                message: 'Email inviata con successo!',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                error: 'Errore nell\'invio dell\'email',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test email endpoint (esistente)
router.post('/test', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({
                error: 'Email e nome sono richiesti'
            });
        }

        const result = await emailService.sendWelcomeEmail(email, name);

        if (result.success) {
            res.json({
                message: 'Email inviata con successo!',
                messageId: result.messageId
            });
        } else {
            res.status(500).json({
                error: 'Errore nell\'invio dell\'email',
                details: result.error
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ NUOVO - Endpoint per email di conferma ordine
router.post('/order-confirmation', async (req, res) => {
    try {
        console.log('📧 Richiesta email conferma ordine ricevuta:', req.body);

        const orderData = req.body;

        // Validazione dati essenziali
        if (!orderData.customerEmail || !orderData.customerName) {
            return res.status(400).json({
                error: 'Email e nome cliente sono richiesti'
            });
        }

        const result = await emailService.sendOrderConfirmationEmail(orderData);

        if (result.success) {
            console.log('✅ Email conferma ordine inviata con successo');
            res.json({
                success: true,
                message: 'Email di conferma ordine inviata!',
                messageId: result.messageId
            });
        } else {
            console.error('❌ Errore invio email conferma:', result.error);
            res.status(500).json({
                success: false,
                error: 'Errore nell\'invio dell\'email di conferma',
                details: result.error
            });
        }
    } catch (error) {
        console.error('❌ Errore endpoint order-confirmation:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;