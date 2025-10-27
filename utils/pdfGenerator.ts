import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { getCompanyInfo } from "./companyLogos";

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
  company: string;
  sent: boolean;
  signed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
}

export async function generateInvoicePDF(
  proposal: Proposal,
  userData?: UserData
): Promise<string> {
  try {
    console.log("🔄 Starting invoice PDF generation...");
    console.log("👤 User data received:", userData);
    console.log("👤 User name:", userData?.name || "No name");
    console.log("👤 User email:", userData?.email || "No email");
    console.log("👤 User phone:", userData?.phone || "No phone");
    console.log("📋 Proposal data received:", proposal);
    console.log("📋 Customer name:", proposal.customerName);
    console.log("📋 Address:", proposal.address);
    console.log("📋 City:", proposal.city);
    console.log("📋 Phone:", proposal.phone);
    console.log("📋 Total cost:", proposal.totalCost);
    console.log(
      "🔍 Pricing check - persqf:",
      proposal.persqf,
      "type:",
      typeof proposal.persqf
    );
    console.log("🔍 Pricing check - sqftTotal:", proposal.sqftTotal);
    console.log("🔍 Pricing check - quantity:", proposal.quantity);
    console.log("🔍 Pricing check - totalCost:", proposal.totalCost);

    // Get company information
    const companyInfo = getCompanyInfo(proposal.company);
    console.log("🏢 Company info:", companyInfo);

    // Load footer images as base64
    let footer1Base64 = "";
    let footer2Base64 = "";

    try {
      console.log("🖼️ Loading footer images...");

      // Use Asset.fromModule() to get proper asset URIs
      const footer1Asset = Asset.fromModule(
        require("../assets/images/footer1.png")
      );
      const footer2Asset = Asset.fromModule(
        require("../assets/images/footer2.png")
      );

      // Download assets if needed
      await footer1Asset.downloadAsync();
      await footer2Asset.downloadAsync();

      console.log("🖼️ Footer1 URI:", footer1Asset.localUri);
      console.log("🖼️ Footer2 URI:", footer2Asset.localUri);

      // Convert asset URI to base64
      footer1Base64 = await FileSystem.readAsStringAsync(
        footer1Asset.localUri!,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      footer2Base64 = await FileSystem.readAsStringAsync(
        footer2Asset.localUri!,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      console.log("✅ Footer images loaded successfully");
    } catch (imageError) {
      console.error("❌ Error loading footer images:", imageError);
      console.log("🔄 Continuing without footer images...");
    }

    // const isPerSqft = proposal.persqf && proposal.sqftTotal;

    // ✅ Generate unique file name with timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `invoice_${proposal.customerName.replace(
      /\s+/g,
      "_"
    )}_${timestamp}_${randomId}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // ✅ Create clean, styled HTML for PDF matching the exact invoice design from image
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              margin: 0;
              background: white;
              font-size: 12px;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .logo {
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #666 0%, #00234C 100%);
              border-radius: 4px;
              margin-right: 15px;
              position: relative;
            }
            .logo::after {
              content: '⛰';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 24px;
            }
            .company-logo {
              width: 50px;
              height: 50px;
              margin-right: 15px;
              object-fit: contain;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #00234C;
              margin: 0;
              letter-spacing: 1px;
            }
            .company-subtitle {
              font-size: 16px;
              color: #00234C;
              margin: 0;
              margin-top: 2px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            .section-header {
              background: #2F4F8F;
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 15px;
              letter-spacing: 0.5px;
              border-radius: 4px;
            }
            .customer-fields {
              margin-bottom: 25px;
            }
            .field-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
              min-height: 25px;
            }
            .field-label {
              font-weight: bold;
              min-width: 80px;
              margin-right: 15px;
              font-size: 13px;
            }
            .dashed-line {
              flex: 1;
              border-bottom: 2px dashed #999;
              margin-right: 15px;
              height: 2px;
            }
            .field-value {
              font-weight: normal;
              font-size: 13px;
            }
            .proposal-details {
              display: flex;
              margin-bottom: 25px;
              background: #f8f9fa;
              padding: 15px;
              border-radius: 4px;
            }
            .detail-column {
              flex: 1;
              margin-right: 20px;
            }
            .detail-column:last-child {
              margin-right: 0;
            }
            .detail-label {
              font-weight: bold;
              margin-bottom: 8px;
              font-size: 13px;
              color: #00234C;
            }
            .detail-value {
              border-bottom: 1px solid #ccc;
              padding-bottom: 5px;
              font-size: 13px;
            }
            .table-container {
              margin-bottom: 25px;
              border: 1px solid #D3D3D3;
              border-radius: 4px;
              overflow: hidden;
            }
            .table-header {
              background: #00234C !important;
              color: white !important;
              display: flex;
              font-weight: bold;
              font-size: 13px;
            }
            .sr-column {
              width: 50px;
              padding: 12px 8px;
              text-align: center;
              border-right: 1px solid #D3D3D3;
            }
            .spec-column {
              flex: 2.5;
              padding: 12px 8px;
              border-right: 1px solid #D3D3D3;
            }
            .process-column {
              flex: 2.5;
              padding: 12px 8px;
              border-right: 1px solid #D3D3D3;
            }
            .quantity-column {
              width: 100px;
              padding: 12px 8px;
              text-align: center;
              border-right: 1px solid #D3D3D3;
            }
            .total-column {
              width: 100px;
              padding: 12px 8px;
              text-align: center;
            }
            .table-header .sr-column,
            .table-header .spec-column,
            .table-header .process-column,
            .table-header .quantity-column,
            .table-header .total-column {
              background: #00234C !important;
              color: white !important;
            }
            .table-row {
              display: flex;
              border-bottom: 1px solid #D3D3D3;
              min-height: 40px;
              align-items: center;
            }
            .table-row .sr-column,
            .table-row .spec-column,
            .table-row .process-column,
            .table-row .quantity-column,
            .table-row .total-column {
              border-right: 1px solid #D3D3D3;
            }
            .table-row .total-column {
              border-right: none;
            }
            .comments-section {
              margin-bottom: 25px;
            }
            .comments-header {
              background: #2F4F8F;
              color: white;
              padding: 10px 15px;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 15px;
              letter-spacing: 0.5px;
            }
            .comments-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .comments-list {
              list-style: none;
              padding: 0;
              flex: 1;
              margin-right: 20px;
            }
            .comment-item {
              margin-bottom: 8px;
              font-size: 12px;
              line-height: 1.4;
            }
            .totals-section {
              display: flex;
              flex-direction: column;
              align-items: flex-end;
              width: 200px;
            }
            .total-row {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .total-label {
              font-size: 14px;
              font-weight: 600;
              margin-right: 15px;
              min-width: 80px;
            }
            .total-box {
              background: white;
              border: 2px solid #E0E0E0;
              padding: 10px 15px;
              min-width: 100px;
              text-align: center;
              border-radius: 4px;
            }
            .total-box-highlighted {
              background: #2F4F8F;
              color: white;
              border-color: #2F4F8F;
            }
            .total-value {
              font-size: 14px;
              font-weight: 600;
            }
            .total-value-highlighted {
              color: white;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #E0E0E0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .footer-left {
              display: flex;
              flex-direction: column;
            }
            .footer-text {
              font-size: 12px;
              color: #666;
              margin-bottom: 3px;
            }
            .footer-right {
              display: flex;
              gap: 20px;
            }
            .footer-image {
              max-width: 120px;
              max-height: 60px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${
              companyInfo?.logo
                ? `<img src="${companyInfo.logo}" alt="Company Logo" class="company-logo" />`
                : '<div class="logo"></div>'
            }
            <div>
              <h1 class="company-name">${companyInfo?.name || "SOLID ROCK"}</h1>
              <p class="company-subtitle">${
                companyInfo?.subtitle || "STONE WORK LLC"
              }</p>
            </div>
          </div>

          <div class="section-header">CUSTOMER INFO</div>
          <div class="customer-fields">
            <div class="field-row">
              <span class="field-label">Name</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.customerName || ""}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Address</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.address || ""}</span>
            </div>
            <div class="field-row">
              <span class="field-label">City</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.city || ""}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Phone</span>
              <div class="dashed-line"></div>
              <span class="field-value">${proposal.phone || ""}</span>
            </div>
          </div>

          <div class="proposal-details">
            <div class="detail-column">
              <div class="detail-label">Created By</div>
              <div class="detail-value">${
                userData?.name || "Andrew Lacey"
              }</div>
            </div>
            <div class="detail-column">
              <div class="detail-label">Date</div>
              <div class="detail-value">${new Date(
                proposal.createdAt
              ).toLocaleDateString()}</div>
            </div>
            <div class="detail-column">
              <div class="detail-label">Scope</div>
              <div class="detail-value">${proposal.scope || ""}</div>
            </div>
          </div>

          <div class="table-container">
            ${
              proposal.persqf && proposal.persqf.trim() !== ""
                ? `
            <!-- Per/sq ft Pricing Option -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #D3D3D3;">
              <thead>
                <tr style="background-color: #00234C; color: white;">
                  <th style="width: 50px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">SR</th>
                  <th style="padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Specifications</th>
                  <th style="padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Process</th>
                  <th style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Per/sq ft.</th>
                  <th style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Total sq ft.</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="width: 50px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">1</td>
                  <td style="padding: 12px 8px; border: 1px solid #D3D3D3;">${
                    proposal.specifications || ""
                  }</td>
                  <td style="padding: 12px 8px; border: 1px solid #D3D3D3;">${
                    proposal.process || ""
                  }</td>
                  <td style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">$${parseFloat(
                    proposal.persqf || "0"
                  ).toFixed(2)}</td>
                  <td style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">${
                    proposal.sqftTotal || ""
                  }</td>
                </tr>
              </tbody>
            </table>
            `
                : `
            <!-- Quantity/Total Cost Pricing Option -->
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #D3D3D3;">
              <thead>
                <tr style="background-color: #00234C; color: white;">
                  <th style="width: 50px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">SR</th>
                  <th style="padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Specifications</th>
                  <th style="padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Process</th>
                  <th style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Quantity</th>
                  <th style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3; background-color: #00234C; color: white; font-weight: bold;">Total Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="width: 50px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">1</td>
                  <td style="padding: 12px 8px; border: 1px solid #D3D3D3;">${
                    proposal.specifications || ""
                  }</td>
                  <td style="padding: 12px 8px; border: 1px solid #D3D3D3;">${
                    proposal.process || ""
                  }</td>
                  <td style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">${
                    proposal.quantity || ""
                  }</td>
                  <td style="width: 100px; padding: 12px 8px; text-align: center; border: 1px solid #D3D3D3;">$${parseFloat(
                    proposal.totalCost || "0"
                  ).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            `
            }
          </div>

          <div class="comments-section">
            <div class="comments-header">Other comments or Special instruction</div>
            <div class="comments-content">
              <div class="comments-list">
                ${
                  proposal.notes
                    ? proposal.notes
                        .split("\n")
                        .map(
                          (note) => `<div class="comment-item">${note}</div>`
                        )
                        .join("")
                    : `
                <div class="comment-item">1. Contractor will provide all necessary equipment, labor and materials</div>
                <div class="comment-item">2. Prices are valid for 30 days</div>
                <div class="comment-item">3. No money due until customer is satisfied with all completed work</div>
                <div class="comment-item">4. Contractor will not initiate any change orders</div>
                `
                }
              </div>
              <div class="totals-section">
                <div class="total-row">
                  <span class="total-label">SUBTOTAL</span>
                  <div class="total-box">
                    <span class="total-value">$${parseFloat(
                      proposal.totalCost || "0"
                    ).toFixed(2)}</span>
                  </div>
                </div>
                <div class="total-row">
                  <span class="total-label">TOTAL</span>
                  <div class="total-box total-box-highlighted">
                    <span class="total-value total-value-highlighted">$${parseFloat(
                      proposal.totalCost || "0"
                    ).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-left">
              <div class="footer-text">Submitted By: ${
                userData?.name || "Andrew Lacey"
              }</div>
              <div class="footer-text">${
                userData?.email || "terryasphalt@gmail.com"
              }</div>
              <div class="footer-text">${
                userData?.phone || "443-271-3811"
              }</div>
            </div>
            <div class="footer-right">
              ${
                footer1Base64 && footer2Base64
                  ? `
              <img src="data:image/png;base64,${footer1Base64}" alt="BBB Accredited Business" class="footer-image" />
              <img src="data:image/png;base64,${footer2Base64}" alt="Mid-Atlantic Chapter GCSAA" class="footer-image" />
              `
                  : ""
              }
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Generate the PDF using react-native-html-to-pdf (better background color support)
    const { uri } = await Print.printToFileAsync({ html });
    console.log("✅ PDF generated with expo-print:", uri);

    // ✅ Copy to our desired location
    await FileSystem.copyAsync({
      from: uri,
      to: filePath,
    });

    console.log("✅ Invoice PDF generated at:", filePath);

    // ✅ Share PDF - Direct approach
    console.log("📤 Attempting to open sharing dialog...");
    console.log("📤 File path:", filePath);

    // Check if sharing is available first
    const isSharingAvailable = await Sharing.isAvailableAsync();
    console.log("📤 Sharing available:", isSharingAvailable);

    if (!isSharingAvailable) {
      console.log("❌ Sharing not available on this device");
      return filePath;
    }

    // Add a longer delay for real device
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For real device, try simpler approaches first
    const sharingMethods = [
      {
        name: "Method 1: Simple sharing (works best on real device)",
        fn: () => Sharing.shareAsync(filePath),
      },
      {
        name: "Method 2: With UTI only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            UTI: "com.adobe.pdf",
          }),
      },
      {
        name: "Method 3: With MIME type only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            mimeType: "application/pdf",
          }),
      },
      {
        name: "Method 4: With title only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            dialogTitle: `Invoice - ${proposal.customerName}`,
          }),
      },
    ];

    for (const method of sharingMethods) {
      try {
        console.log(`📤 Trying ${method.name}...`);
        await method.fn();
        console.log(`✅ ${method.name} succeeded`);
        return filePath;
      } catch (error) {
        console.log(
          `❌ ${method.name} failed:`,
          error instanceof Error ? error.message : error
        );
        // Add small delay between attempts
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("⚠️ All sharing methods failed - PDF saved to device");
    return filePath;
  } catch (error) {
    console.error("❌ Error generating invoice PDF:", error);
    throw error;
  }
}

export async function generateProposalPDF(
  proposal: Proposal,
  userData?: UserData
): Promise<string> {
  try {
    console.log("🔄 Starting proposal PDF generation...");
    console.log("👤 User data received:", userData);
    console.log("👤 User name:", userData?.name || "No name");
    console.log("👤 User email:", userData?.email || "No email");
    console.log("👤 User phone:", userData?.phone || "No phone");
    console.log("📋 Proposal data received:", proposal);
    console.log("📋 Customer name:", proposal.customerName);
    console.log("📋 Address:", proposal.address);
    console.log("📋 City:", proposal.city);
    console.log("📋 Phone:", proposal.phone);
    console.log("📋 Total cost:", proposal.totalCost);

    // Get company information
    const companyInfo = getCompanyInfo(proposal.company);
    console.log("🏢 Company info for proposal:", companyInfo);

    // Load footer images as base64
    let footer1Base64 = "";
    let footer2Base64 = "";

    try {
      console.log("🖼️ Loading footer images for proposal...");

      // Use Asset.fromModule() to get proper asset URIs
      const footer1Asset = Asset.fromModule(
        require("../assets/images/footer1.png")
      );
      const footer2Asset = Asset.fromModule(
        require("../assets/images/footer2.png")
      );

      // Download assets if needed
      await footer1Asset.downloadAsync();
      await footer2Asset.downloadAsync();

      console.log("🖼️ Footer1 URI:", footer1Asset.localUri);
      console.log("🖼️ Footer2 URI:", footer2Asset.localUri);

      // Convert asset URI to base64
      footer1Base64 = await FileSystem.readAsStringAsync(
        footer1Asset.localUri!,
        { encoding: FileSystem.EncodingType.Base64 }
      );
      footer2Base64 = await FileSystem.readAsStringAsync(
        footer2Asset.localUri!,
        { encoding: FileSystem.EncodingType.Base64 }
      );

      console.log("✅ Footer images loaded successfully for proposal");
    } catch (imageError) {
      console.error("❌ Error loading footer images for proposal:", imageError);
      console.log("🔄 Continuing without footer images...");
    }

    // const isPerSqft = proposal.persqf && proposal.sqftTotal;

    // ✅ Generate unique file name with timestamp
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const fileName = `proposal_${proposal.customerName.replace(
      /\s+/g,
      "_"
    )}_${timestamp}_${randomId}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // ✅ Create clean, styled HTML for PDF matching the image design
    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              margin: 0;
              background: white;
              font-size: 14px;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .logo {
              width: 50px;
              height: 50px;
              background: linear-gradient(135deg, #666 0%, #00234C 100%);
              border-radius: 4px;
              margin-right: 15px;
              position: relative;
            }
            .logo::after {
              content: '⛰';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 24px;
            }
            .company-logo {
              width: 50px;
              height: 50px;
              margin-right: 15px;
              object-fit: contain;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #00234C;
              margin: 0;
              letter-spacing: 1px;
            }
            .company-subtitle {
              font-size: 16px;
              color: #00234C;
              margin: 0;
              margin-top: 2px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            .section {
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #E0E0E0;
            }
            .section:last-of-type {
              border-bottom: none;
            }
            .section-label {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .section-content {
              font-size: 14px;
              line-height: 1.4;
              margin: 0;
            }
            .pricing-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 10px 0;
            }
            .pricing-label {
              font-size: 14px;
              font-weight: bold;
              color: #333;
            }
            .pricing-value {
              font-size: 14px;
              color: #333;
            }
            .total-cost-section {
              margin: 15px 0;
              padding: 10px 0;
            }
            .total-cost-label {
              font-size: 14px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .total-cost-value {
              font-size: 16px;
              font-weight: bold;
              color: #00234C;
            }
            .bullet-list {
              margin: 0;
              padding-left: 0;
              list-style: none;
            }
            .bullet-list li {
              margin: 5px 0;
              position: relative;
              padding-left: 15px;
            }
            .bullet-list li::before {
              content: '•';
              position: absolute;
              left: 0;
              color: #333;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #E0E0E0;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .footer-left {
              display: flex;
              flex-direction: column;
            }
            .footer-text {
              font-size: 12px;
              color: #666;
              margin-bottom: 3px;
            }
            .footer-right {
              display: flex;
              gap: 20px;
            }
            .footer-image {
              max-width: 120px;
              max-height: 60px;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${
              companyInfo?.logo
                ? `<img src="${companyInfo.logo}" alt="Company Logo" class="company-logo" />`
                : '<div class="logo"></div>'
            }
            <div>
              <h1 class="company-name">${companyInfo?.name || "SOLID ROCK"}</h1>
              <p class="company-subtitle">${
                companyInfo?.subtitle || "STONE WORK LLC"
              }</p>
            </div>
          </div>

          <div class="section">
            <div class="section-label">Customer:</div>
            <div class="section-content">
              ${proposal.customerName || ""}<br>
              ${proposal.address || ""} ${proposal.city || ""}
            </div>
          </div>

          <div class="section">
            <div class="section-label">Contact:</div>
            <div class="section-content">
              Mr. ${proposal.customerName || ""}<br>
              ${proposal.companyEmail || ""}<br>
              ${proposal.phone || ""}
            </div>
          </div>

          <div class="section">
            <div class="section-label">Specifications:</div>
            <div class="section-content">${proposal.specifications || ""}</div>
          </div>

          <div class="section">
            <div class="section-label">Process:</div>
            <div class="section-content">${proposal.process || ""}</div>
          </div>

          <div class="section">
            ${
              proposal.persqf && proposal.persqf.trim() !== ""
                ? `
            <div class="pricing-row">
              <div class="pricing-label">Per Sq ft Cost:</div>
              <div class="pricing-value">$${parseFloat(
                proposal.persqf || "0"
              ).toFixed(2)}</div>
            </div>
            <div class="pricing-row">
              <div class="pricing-label">Sq ft Total:</div>
              <div class="pricing-value">${proposal.sqftTotal || ""}</div>
            </div>
            `
                : ""
            }
            ${
              proposal.quantity
                ? `
            <div class="pricing-row">
              <div class="pricing-label">Quantity:</div>
              <div class="pricing-value">${proposal.quantity}</div>
            </div>
            `
                : ""
            }
            <div class="pricing-row">
              <div class="pricing-label">Total Cost:</div>
              <div class="pricing-value">$${parseFloat(
                proposal.totalCost || "0"
              ).toFixed(2)}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-label">Notes:</div>
            <div class="section-content">
              <ul class="bullet-list">
                ${
                  proposal.notes
                    ? proposal.notes
                        .split("\n")
                        .map((note) => `<li>${note}</li>`)
                        .join("")
                    : `
                <li>Contractor will provide all necessary equipment's labor and material</li>
                <li>No Money due until customer is satisfied with all Completed work</li>
                <li>Contractor will not initiate any change orders</li>
                <li>Prices are Valid for 30 days</li>
                `
                }
              </ul>
            </div>
          </div>

          <div class="footer">
            <div class="footer-left">
              <div class="footer-text">Submitted By: ${
                userData?.name || "Andrew Lacey"
              }</div>
              <div class="footer-text">${
                userData?.email || "terryasphalt@gmail.com"
              }</div>
              <div class="footer-text">${
                userData?.phone || "443-271-3811"
              }</div>
            </div>
            <div class="footer-right">
              ${
                footer1Base64 && footer2Base64
                  ? `
              <img src="data:image/png;base64,${footer1Base64}" alt="BBB Accredited Business" class="footer-image" />
              <img src="data:image/png;base64,${footer2Base64}" alt="Mid-Atlantic Chapter GCSAA" class="footer-image" />
              `
                  : ""
              }
            </div>
          </div>
        </body>
      </html>
    `;

    // ✅ Generate the PDF using react-native-html-to-pdf (better background color support)
    const { uri } = await Print.printToFileAsync({ html });
    console.log("✅ PDF generated with expo-print:", uri);

    // ✅ Copy to our desired location
    await FileSystem.copyAsync({
      from: uri,
      to: filePath,
    });

    console.log("✅ PDF generated at:", filePath);

    // ✅ Share PDF - Direct approach
    console.log("📤 Attempting to open sharing dialog...");
    console.log("📤 File path:", filePath);

    // Check if sharing is available first
    const isSharingAvailable = await Sharing.isAvailableAsync();
    console.log("📤 Sharing available:", isSharingAvailable);

    if (!isSharingAvailable) {
      console.log("❌ Sharing not available on this device");
      return filePath;
    }

    // Add a longer delay for real device
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For real device, try simpler approaches first
    const sharingMethods = [
      {
        name: "Method 1: Simple sharing (works best on real device)",
        fn: () => Sharing.shareAsync(filePath),
      },
      {
        name: "Method 2: With UTI only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            UTI: "com.adobe.pdf",
          }),
      },
      {
        name: "Method 3: With MIME type only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            mimeType: "application/pdf",
          }),
      },
      {
        name: "Method 4: With title only",
        fn: () =>
          Sharing.shareAsync(filePath, {
            dialogTitle: `Proposal - ${proposal.customerName}`,
          }),
      },
    ];

    for (const method of sharingMethods) {
      try {
        console.log(`📤 Trying ${method.name}...`);
        await method.fn();
        console.log(`✅ ${method.name} succeeded`);
        return filePath;
      } catch (error) {
        console.log(
          `❌ ${method.name} failed:`,
          error instanceof Error ? error.message : error
        );
        // Add small delay between attempts
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log("⚠️ All sharing methods failed - PDF saved to device");
    return filePath;
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    throw error;
  }
}
