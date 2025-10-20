import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface Proposal {
  _id: string;
  customerName: string;
  address: string;
  city: string;
  phone: string;
  specifications: string;
  process: string;
  scope: string;
  persqf: string;
  sqftTotal: string;
  quantity: string;
  totalCost: string;
  notes: string;
  companyEmail: string;
  sent: boolean;
  signed: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function generateInvoicePDF(proposal: Proposal): Promise<string> {
  try {
    const isPerSqft = proposal.persqf && proposal.sqftTotal;
    
    // ✅ Generate the same file name
    const fileName = `invoice_${proposal.customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    // ✅ Create clean, styled HTML for PDF matching the invoice design
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #333;
              margin: 0;
              background: white;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 40px;
              height: 40px;
              background: #00234C;
              border-radius: 4px;
              margin-right: 15px;
              position: relative;
            }
            .logo::after {
              content: '▲';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #00234C;
              margin: 0;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin: 0;
              margin-top: 2px;
            }
            .section-header {
              background: #00234C;
              color: white;
              padding: 8px 12px;
              margin: 20px 0 15px 0;
              font-weight: bold;
              text-align: center;
            }
            .customer-fields {
              margin: 15px 0;
            }
            .field-row {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
            }
            .field-label {
              min-width: 80px;
              margin-right: 10px;
              font-size: 14px;
            }
            .dashed-line {
              flex: 1;
              height: 1px;
              border-bottom: 1px dashed #ccc;
              margin-right: 10px;
            }
            .field-value {
              font-size: 14px;
              font-weight: 500;
            }
            .proposal-details {
              display: flex;
              background: #00234C;
              color: white;
              padding: 8px 12px;
              margin: 20px 0;
            }
            .detail-column {
              flex: 1;
              text-align: center;
            }
            .detail-label {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .detail-value {
              font-size: 14px;
            }
            .table-header {
              background: #00234C;
              color: white;
              padding: 8px 4px;
              display: flex;
            }
            .table-row {
              display: flex;
              border-bottom: 1px solid #E0E0E0;
              padding: 12px 4px;
              min-height: 60px;
            }
            .sr-column { width: 10%; text-align: center; }
            .spec-column { width: 35%; text-align: left; padding-left: 4px; }
            .process-column { width: 25%; text-align: left; padding-left: 4px; }
            .quantity-column { width: 15%; text-align: center; }
            .total-column { width: 15%; text-align: center; }
            .comments-section {
              margin: 20px 0;
            }
            .comments-header {
              background: #00234C;
              color: white;
              padding: 8px 12px;
              margin-bottom: 15px;
              font-weight: bold;
              text-align: center;
            }
            .comments-content {
              display: flex;
              justify-content: space-between;
            }
            .comments-list {
              flex: 1;
              margin-right: 20px;
            }
            .comment-item {
              font-size: 12px;
              margin-bottom: 8px;
              line-height: 16px;
            }
            .totals-section {
              width: 200px;
            }
            .total-row {
              display: flex;
              align-items: center;
              margin-bottom: 8px;
            }
            .total-label {
              font-size: 14px;
              font-weight: 600;
              margin-right: 10px;
            }
            .total-box {
              background: white;
              border: 1px solid #E0E0E0;
              padding: 8px 12px;
              min-width: 80px;
              text-align: center;
            }
            .total-box-highlighted {
              background: #00234C;
              color: white;
            }
            .total-value {
              font-size: 14px;
              font-weight: 600;
            }
            .total-value-highlighted {
              color: white;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #E0E0E0;
            }
            .footer-text {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div>
              <h1 class="company-name">SOLID ROCK</h1>
              <p class="company-subtitle">STONE WORK LLC</p>
            </div>
          </div>

          <div class="section-header">CUSTOMER INFO</div>
          <div class="customer-fields">
            <div class="field-row">
              <span class="field-label">Name</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.customerName || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Address</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.address || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">City</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.city || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Phone</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.phone || ''}</span>
            </div>
          </div>

          <div class="proposal-details">
            <div class="detail-column">
              <div class="detail-label">Created By</div>
              <div class="detail-value">Andrew Lacey</div>
            </div>
            <div class="detail-column">
              <div class="detail-label">Date</div>
              <div class="detail-value">${new Date(proposal.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="detail-column">
              <div class="detail-label">Scope</div>
              <div class="detail-value">Stone Work</div>
            </div>
          </div>

          <div class="table-header">
            <div class="sr-column">SR</div>
            <div class="spec-column">Specifications</div>
            <div class="process-column">Process</div>
            <div class="quantity-column">Quantity</div>
            <div class="total-column">Total Cost</div>
          </div>
          <div class="table-row">
            <div class="sr-column">1</div>
            <div class="spec-column">${proposal.specifications || ''}</div>
            <div class="process-column">${proposal.process || ''}</div>
            <div class="quantity-column">${isPerSqft ? proposal.sqftTotal : proposal.quantity}</div>
            <div class="total-column">$${parseFloat(proposal.totalCost || '0').toFixed(2)}</div>
          </div>

          <div class="comments-section">
            <div class="comments-header">Other comments or Special instruction</div>
            <div class="comments-content">
              <div class="comments-list">
                <div class="comment-item">1. Contractor will provide all necessary equipment, labor and materials</div>
                <div class="comment-item">2. Prices are valid for 30 days</div>
                <div class="comment-item">3. No money due until customer is satisfied with all completed work</div>
                <div class="comment-item">4. Contractor will not initiate any change orders</div>
              </div>
              <div class="totals-section">
                <div class="total-row">
                  <span class="total-label">SUBTOTAL</span>
                  <div class="total-box">
                    <span class="total-value">$${parseFloat(proposal.totalCost || '0').toFixed(2)}</span>
                  </div>
                </div>
                <div class="total-row">
                  <span class="total-label">TOTAL</span>
                  <div class="total-box total-box-highlighted">
                    <span class="total-value total-value-highlighted">$${parseFloat(proposal.totalCost || '0').toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">Submitted By: Andrew Lacey</div>
            <div class="footer-text">terryasphalt@gmail.com</div>
            <div class="footer-text">443-271-3811</div>
          </div>
        </body>
      </html>
    `;

    // ✅ Generate the PDF using Expo Print
    const { uri } = await Print.printToFileAsync({ html });

    // ✅ Move to document directory
    await FileSystem.moveAsync({
      from: uri,
      to: filePath,
    });

    console.log('✅ Invoice PDF generated at:', filePath);

    // ✅ Share PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice - ${proposal.customerName}`,
      });
    }
    
    return filePath;
  } catch (error) {
    console.error('❌ Error generating invoice PDF:', error);
    throw error;
  }
}

export async function generateProposalPDF(proposal: Proposal): Promise<string> {
  try {
    const isPerSqft = proposal.persqf && proposal.sqftTotal;
    
    // ✅ Generate the same file name
    const fileName = `proposal_${proposal.customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;
    
    // ✅ Create clean, styled HTML for PDF matching the image design
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #333;
              margin: 0;
              background: white;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 40px;
              height: 40px;
              background: #00234C;
              border-radius: 4px;
              margin-right: 15px;
              position: relative;
            }
            .logo::after {
              content: '▲';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #00234C;
              margin: 0;
            }
            .company-subtitle {
              font-size: 14px;
              color: #666;
              margin: 0;
              margin-top: 2px;
            }
            .section {
              margin: 20px 0;
              padding: 15px 0;
              border-bottom: 1px solid #ddd;
            }
            .section:last-child {
              border-bottom: none;
            }
            .section-title {
              font-weight: bold;
              color: #333;
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .section-content {
              margin: 0;
              line-height: 1.4;
            }
            .section-content p {
              margin: 5px 0;
            }
            .download-btn {
              background: #f5f5f5;
              border: 1px solid #ccc;
              border-radius: 4px;
              padding: 8px 16px;
              color: #333;
              text-decoration: none;
              font-size: 14px;
              display: inline-block;
              margin-left: 20px;
            }
            .customer-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .notes-list {
              margin: 0;
              padding-left: 0;
            }
            .notes-list li {
              margin: 8px 0;
              list-style: none;
            }
            .scope-list {
              margin: 0;
              padding-left: 0;
            }
            .scope-list li {
              margin: 5px 0;
              list-style: none;
              position: relative;
              padding-left: 15px;
            }
            .scope-list li::before {
              content: '•';
              position: absolute;
              left: 0;
              color: #333;
            }
            .cost-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .cost-details {
              flex: 1;
            }
            .total-cost {
              font-size: 18px;
              font-weight: bold;
              color: #00234C;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo"></div>
            <div>
              <h1 class="company-name">SOLID ROCK</h1>
              <p class="company-subtitle">STONE WORK LLC</p>
            </div>
          </div>

          <div class="section">
            <div class="customer-header">
              <div>
                <h2 class="section-title">Customer:</h2>
                <div class="section-content">
                  <p>${proposal.customerName || ''}</p>
                  <p>${proposal.address || ''} ${proposal.city || ''}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Contact:</h2>
            <div class="section-content">
              <p>Mr. ${proposal.customerName || ''}</p>
              <p>${proposal.companyEmail || ''}</p>
              <p>${proposal.phone || ''}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Specifications:</h2>
            <div class="section-content">
              <p>${proposal.specifications || ''}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Process:</h2>
            <div class="section-content">
              <p>${proposal.process || ''}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Scope:</h2>
            <div class="section-content">
              <ul class="scope-list">
                <li>Stone Engraving</li>
                <li>Masonry Services</li>
                <li>Patio Installation</li>
                <li>Wall Construction</li>
              </ul>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Notes:</h2>
            <div class="section-content">
              <ol class="notes-list">
                <li>Contractor will provide all necessary equipment's labor and material</li>
                <li>No Money due until customer is satisfied with all Completed work</li>
                <li>Contractor will not initiate any change orders</li>
                <li>Prices are Valid for 30 days</li>
              </ol>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Submitted By:</h2>
            <div class="section-content">
              <p>Andrew Lacey</p>
              <p>terryasphalt@gmail.com</p>
              <p>443-271-3811</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Generate the PDF using Expo Print
    const { uri } = await Print.printToFileAsync({ html });

    // ✅ Move to document directory
    await FileSystem.moveAsync({
      from: uri,
      to: filePath,
    });

    console.log('✅ PDF generated at:', filePath);

    // ✅ Share PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: `Proposal - ${proposal.customerName}`,
      });
    }
    
    return filePath;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw error;
  }
}
