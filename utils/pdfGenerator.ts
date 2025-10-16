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
