import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
    const doc = new jsPDF();

    // Add Company Logo/Title
    doc.setFontSize(20);
    doc.text("SmartFood", 14, 22);
    doc.setFontSize(10);
    doc.text("Delicious meals delivered to your door.", 14, 28);

    // Invoice Details
    doc.setFontSize(12);
    doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 14, 40);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 46);
    doc.text(`Customer: ${order.customerName || order.userName || 'Guest'}`, 14, 52);

    // Order Items Table
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = [];

    order.items.forEach(item => {
        const itemData = [
            item.name,
            item.quantity,
            `$${parseFloat(item.price).toFixed(2)}`,
            `$${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [255, 99, 71] } // Tomato color to match app theme potentially
    });

    // Total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: $${parseFloat(order.total).toFixed(2)}`, 14, finalY);

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for ordering with SmartFood!", 14, finalY + 20);

    return doc;
};

export const generateInvoiceBase64 = (order) => {
    const doc = generateInvoicePDF(order);
    // Returns the full data URI (e.g., "data:application/pdf;base64,JVBERi...")
    // We split to get just the base64 part for some APIs, or return full if needed.
    const dataUri = doc.output('datauristring');
    return dataUri;
};

export const downloadInvoice = (order) => {
    const doc = generateInvoicePDF(order);
    doc.save(`SmartFood_Invoice_${order.id.slice(0, 8)}.pdf`);
};
