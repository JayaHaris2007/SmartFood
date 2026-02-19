import emailjs from '@emailjs/browser';

// REPLACE THESE WITH YOUR ACTUAL EMAILJS KEYS
const SERVICE_ID = 'service_j8jfowk';
const TEMPLATE_ID = 'template_spji8vh';
const PUBLIC_KEY = 'VFuctNQBHv9emkSss';

export const sendInvoiceEmail = async (order) => {
    try {
        // Structure parameters to match the "Order Confirmation" template in the screenshot
        const templateParams = {
            // "To Email" field
            email: order.userEmail,

            // "Order #" field
            order_id: order.id.slice(0, 8).toUpperCase(),

            // Company Logo (Public URL - Chef Hat to match app icon)
            logo_url: 'https://cdn-icons-png.flaticon.com/512/1830/1830839.png',

            // "orders" loop in the template {{#orders}}...{{/orders}}
            orders: order.items.map(item => ({
                name: item.name,
                price: parseFloat(item.price).toFixed(2),
                units: item.quantity,
                image_url: item.image || 'https://placehold.co/100x100?text=No+Image'
            })),

            // "cost" object in the template {{cost.total}}, etc.
            cost: {
                shipping: '0.00',
                tax: '0.00',
                total: parseFloat(order.total).toFixed(2)
            }
        };

        console.log("Sending Email with params:", templateParams);

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('Email sent successfully!', response.status, response.text);
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
};
