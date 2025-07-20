const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// ✅ configure transporter with your Mailtrap credentials
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "becb6b3074183a",
    pass: "f14b76e060ade2"
  }
});

function generateReceiptPDF(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // ========== HEADER ==========
    doc
      .font('Helvetica-Bold')
      .fontSize(24)
      .fillColor('#333333')
      .text('CUP OF JOY', { align: 'center' });

    doc
      .moveDown(0.5)
      .fontSize(16)
      .fillColor('#555555')
      .text('Official Receipt', { align: 'center' });

    doc.moveDown();
    drawLine(doc, '#cccccc');

    // ========== ORDER DETAILS ==========
    doc.moveDown();
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#000000');
    doc.text(`Order ID: `, { continued: true }).font('Helvetica').text(order.order_id);
    doc.font('Helvetica-Bold').text(`Customer: `, { continued: true }).font('Helvetica').text(order.customer_name);
    doc.font('Helvetica-Bold').text(`Date: `, { continued: true }).font('Helvetica').text(order.date_placed);
    doc.font('Helvetica-Bold').text(`Status: `, { continued: true }).font('Helvetica').text(order.status);

    doc.moveDown();
    drawLine(doc, '#cccccc');

    // ========== TABLE HEADER ==========
    doc.moveDown(0.8);
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#222222');
    doc.text('Item', 50, doc.y, { width: 250 });
    doc.text('Qty', 300, doc.y, { width: 50, align: 'center' });
    doc.text('Price', 370, doc.y, { width: 80, align: 'right' });
    doc.text('Total', 470, doc.y, { width: 80, align: 'right' });

    drawLine(doc, '#999999');

    // ========== ITEMS ==========
    doc.font('Helvetica').fontSize(11).fillColor('#000000');
    order.items.forEach(item => {
      const total = (item.quantity * (item.price || (item.total_price / item.quantity))).toFixed(2);
      const price = (item.price || (item.total_price / item.quantity)).toFixed(2);

      doc.text(item.pname, 50, doc.y + 5, { width: 250 });
      doc.text(item.quantity.toString(), 300, doc.y, { width: 50, align: 'center' });
      doc.text(`₱${price}`, 370, doc.y, { width: 80, align: 'right' });
      doc.text(`₱${total}`, 470, doc.y, { width: 80, align: 'right' });

      doc.moveDown();
      drawLine(doc, '#eeeeee');
    });

    // ========== GRAND TOTAL ==========
    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#000000');
    doc.text(`Grand Total: ₱${order.total_amount.toFixed ? order.total_amount.toFixed(2) : order.total_amount}`, {
      align: 'right'
    });

    doc.moveDown(2);
    doc.font('Helvetica-Oblique').fontSize(10).fillColor('#555555').text(
      'Thank you for your purchase! Please keep this receipt for your records.',
      { align: 'center' }
    );

    doc.end();
  });
}

// helper line drawer with custom color
function drawLine(doc, color) {
  doc
    .strokeColor(color || '#aaaaaa')
    .lineWidth(1)
    .moveTo(50, doc.y)
    .lineTo(550, doc.y)
    .stroke();
}


/// Enhanced email templates with vintage white and brown styling
async function sendReceiptEmail(toEmail, order, pdfBuffer) {
  const info = await transporter.sendMail({
    from: '"Shop Support" <support@yourshop.com>',
    to: toEmail,
    subject: `📋 Your receipt for order #${order.order_id}`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; padding: 0; border: 3px solid #8b4513;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d2b48c 0%, #deb887 50%, #f5deb3 100%); padding: 30px; text-align: center; border-bottom: 2px solid #8b4513;">
          <h1 style="color: #654321; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); letter-spacing: 1px;">
            📋 ORDER RECEIPT
          </h1>
          <div style="width: 80px; height: 3px; background-color: #8b4513; margin: 15px auto; border-radius: 2px;"></div>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px; background-color: #fefefe;">
          <div style="background-color: #f5f5dc; padding: 25px; border-radius: 10px; border: 1px solid #deb887; margin-bottom: 25px;">
            <h2 style="color: #8b4513; margin: 0 0 15px 0; font-size: 22px; font-weight: normal;">
              Hello there! 👋
            </h2>
            <p style="color: #654321; font-size: 16px; line-height: 1.6; margin: 0;">
              Thank you for confirming your order with us. We're delighted to have you as our valued customer!
            </p>
          </div>

          <div style="background-color: white; padding: 25px; border-radius: 10px; border: 2px solid #deb887; box-shadow: 0 3px 10px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <div style="background-color: #8b4513; color: white; padding: 12px 20px; border-radius: 25px; font-weight: bold; font-size: 18px;">
                Order #${order.order_id}
              </div>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <div style="color: #654321; font-size: 16px; margin-bottom: 10px;">
                📄 Your detailed receipt is attached as a PDF document
              </div>
              <div style="background-color: #f5deb3; padding: 15px; border-radius: 8px; border-left: 4px solid #8b4513;">
                <strong style="color: #8b4513;">Attachment:</strong> 
                <span style="color: #654321;">receipt-${order.order_id}.pdf</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #d2b48c 0%, #deb887 100%); padding: 25px; text-align: center; border-top: 2px solid #8b4513;">
          <p style="color: #654321; margin: 0; font-size: 14px; font-style: italic;">
            We appreciate your business and hope to serve you again soon! ✨
          </p>
          <div style="margin-top: 15px;">
            <span style="color: #8b4513; font-weight: bold;">Shop Support Team</span>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `receipt-${order.order_id}.pdf`,
        content: pdfBuffer
      }
    ]
  });
  console.log("📎 Receipt email sent:", info.messageId);
}

// Enhanced order status update email
async function sendOrderStatusEmail(toEmail, orderId, status) {
  // Status-specific styling and messaging
  const statusConfig = {
    'pending': { 
      emoji: '⏳', 
      color: '#daa520', 
      bgColor: '#fff8dc',
      message: 'Your order is being prepared with care'
    },
    'processing': { 
      emoji: '🔄', 
      color: '#cd853f', 
      bgColor: '#fdf5e6',
      message: 'We\'re working on your order right now'
    },
    'shipped': { 
      emoji: '🚚', 
      color: '#8b4513', 
      bgColor: '#f0e68c',
      message: 'Your order is on its way to you!'
    },
    'delivered': { 
      emoji: '✅', 
      color: '#556b2f', 
      bgColor: '#f0fff0',
      message: 'Your order has been delivered successfully'
    },
    'cancelled': { 
      emoji: '❌', 
      color: '#a0522d', 
      bgColor: '#ffe4e1',
      message: 'Your order has been cancelled'
    }
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig['pending'];

  const info = await transporter.sendMail({
    from: '"Shop Support" <support@yourshop.com>',
    to: toEmail,
    subject: `${config.emoji} Order #${orderId} - ${status.toUpperCase()}`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 600px; margin: 0 auto; background-color: #faf8f5; padding: 0; border: 3px solid #8b4513;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d2b48c 0%, #deb887 50%, #f5deb3 100%); padding: 30px; text-align: center; border-bottom: 2px solid #8b4513;">
          <h1 style="color: #654321; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); letter-spacing: 1px;">
            ${config.emoji} ORDER UPDATE
          </h1>
          <div style="width: 80px; height: 3px; background-color: #8b4513; margin: 15px auto; border-radius: 2px;"></div>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px; background-color: #fefefe;">
          <div style="background-color: #f5f5dc; padding: 25px; border-radius: 10px; border: 1px solid #deb887; margin-bottom: 25px;">
            <h2 style="color: #8b4513; margin: 0 0 15px 0; font-size: 22px; font-weight: normal;">
              Hello! 👋
            </h2>
            <p style="color: #654321; font-size: 16px; line-height: 1.6; margin: 0;">
              We wanted to keep you updated on your recent order with us.
            </p>
          </div>

          <!-- Order Status Card -->
          <div style="background-color: white; padding: 30px; border-radius: 10px; border: 2px solid #deb887; box-shadow: 0 3px 10px rgba(0,0,0,0.05); text-align: center;">
            <div style="margin-bottom: 20px;">
              <div style="background-color: #8b4513; color: white; padding: 12px 20px; border-radius: 25px; font-weight: bold; font-size: 18px; display: inline-block;">
                Order #${orderId}
              </div>
            </div>
            
            <div style="margin: 25px 0;">
              <div style="background-color: ${config.bgColor}; border: 2px solid ${config.color}; border-radius: 15px; padding: 20px; margin-bottom: 15px;">
                <div style="font-size: 36px; margin-bottom: 10px;">${config.emoji}</div>
                <div style="color: ${config.color}; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                  ${status}
                </div>
              </div>
              
              <div style="color: #654321; font-size: 16px; font-style: italic; margin-top: 15px;">
                ${config.message}
              </div>
            </div>

            ${status.toLowerCase() === 'shipped' ? `
            <div style="background-color: #f5deb3; padding: 15px; border-radius: 8px; border-left: 4px solid #8b4513; margin-top: 20px;">
              <div style="color: #8b4513; font-weight: bold; margin-bottom: 5px;">📦 Shipping Information</div>
              <div style="color: #654321; font-size: 14px;">Your package is now in transit and should arrive within 3-5 business days.</div>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="background: linear-gradient(135deg, #d2b48c 0%, #deb887 100%); padding: 25px; text-align: center; border-top: 2px solid #8b4513;">
          <p style="color: #654321; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
            Thank you for choosing us! ✨
          </p>
          <p style="color: #654321; margin: 0; font-size: 14px; font-style: italic;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <div style="margin-top: 15px;">
            <span style="color: #8b4513; font-weight: bold;">Shop Support Team</span>
          </div>
        </div>
      </div>
    `
  });

  console.log("📧 Order status email sent:", info.messageId);
}

// ✅ export all
module.exports = { generateReceiptPDF, sendReceiptEmail, sendOrderStatusEmail };
