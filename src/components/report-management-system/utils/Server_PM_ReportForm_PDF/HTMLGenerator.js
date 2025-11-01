/**
 * HTMLGenerator - Utility component for generating HTML reports
 * Handles conversion of React components to downloadable HTML files with embedded images
 */

export class HTMLGenerator {
  /**
   * Convert image element to base64 data URL
   * @param {HTMLImageElement} imgElement - The image element to convert
   * @returns {Promise<string>} Base64 data URL or empty string if conversion fails
   */
  static convertImageToBase64(imgElement) {
    return new Promise((resolve) => {
      if (!imgElement || !imgElement.src) {
        resolve('');
        return;
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Create a new image to ensure it's loaded
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        try {
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        } catch (e) {
          console.warn('Could not convert image to base64:', e);
          resolve('');
        }
      };
      
      img.onerror = () => {
        console.warn('Could not load image for base64 conversion');
        resolve('');
      };
      
      img.src = imgElement.src;
    });
  }

  /**
   * Collect all CSS styles from the current page
   * @returns {string} Combined CSS styles
   */
  static collectPageStyles() {
    return Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');
  }

  /**
   * Generate Material-UI inspired CSS styles
   * @returns {string} CSS styles for Material-UI components
   */
  static getMaterialUIStyles() {
    return `
      /* Material-UI inspired styles */
      body {
        font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
        margin: 0;
        padding: 20px;
        background-color: #f5f5f5;
        color: rgba(0, 0, 0, 0.87);
        line-height: 1.5;
      }
      
      .report-container {
        max-width: 210mm;
        margin: 0 auto;
        background: white;
        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
      }
      
      .MuiPaper-root {
        background-color: #fff;
        color: rgba(0, 0, 0, 0.87);
        transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
        border-radius: 4px;
        box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12);
        margin-bottom: 24px;
        padding: 32px;
        border: 1px solid #e0e0e0;
      }
      
      .MuiBox-root {
        box-sizing: border-box;
      }
      
      .MuiTypography-h4 {
        font-size: 2.125rem;
        font-weight: 400;
        line-height: 1.235;
        letter-spacing: 0.00735em;
        margin: 0 0 16px 0;
      }
      
      .MuiTypography-h5 {
        font-size: 1.5rem;
        font-weight: 400;
        line-height: 1.334;
        letter-spacing: 0em;
        margin: 0 0 16px 0;
      }
      
      .MuiTypography-h6 {
        font-size: 1.25rem;
        font-weight: 500;
        line-height: 1.6;
        letter-spacing: 0.0075em;
        margin: 0 0 16px 0;
      }
      
      .MuiTypography-body1 {
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        letter-spacing: 0.00938em;
        margin: 0 0 8px 0;
      }
      
      .MuiTypography-body2 {
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.43;
        letter-spacing: 0.01071em;
        margin: 0 0 8px 0;
      }
      
      /* Page breaks */
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      
      /* Letterhead styling */
      .letterhead-container {
        text-align: center;
        margin-bottom: 32px;
      }
      
      .letterhead-container img {
        max-width: 100%;
        height: auto;
        max-height: 120px;
      }
      
      /* Info boxes */
      .info-box {
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
        background-color: #fafafa;
      }
      
      /* Table styling */
      .MuiTable-root {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
      }
      
      .MuiTableHead-root {
        background-color: #f5f5f5;
      }
      
      .MuiTableCell-root {
        padding: 16px;
        border-bottom: 1px solid rgba(224, 224, 224, 1);
        text-align: left;
        font-size: 0.875rem;
        line-height: 1.43;
        letter-spacing: 0.01071em;
      }
      
      .MuiTableCell-head {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
        background-color: #f5f5f5;
      }
      
      /* Footer styling */
      .report-footer {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid #e0e0e0;
        text-align: center;
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
      }
      
      /* Section titles */
      .section-title {
        color: #1976d2;
        font-weight: 500;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #1976d2;
      }
      
      /* Signature areas */
      .signature-line {
        border-bottom: 1px solid #000;
        margin-bottom: 8px;
        height: 40px;
      }
      
      .signature-label {
        font-size: 0.875rem;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }
      
      /* Print styles */
      @media print {
        body {
          background-color: white;
          padding: 0;
        }
        
        .report-container {
          box-shadow: none;
          max-width: none;
        }
        
        .MuiPaper-root {
          box-shadow: none;
          border: none;
          page-break-inside: avoid;
        }
        
        .page-break {
          page-break-before: always;
        }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        body {
          padding: 10px;
        }
        
        .MuiPaper-root {
          padding: 16px;
        }
      }
    `;
  }

  
  /**
   * Generate HTML content for PDF conversion (returns HTML string instead of downloading)
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.element - The DOM element to convert
   * @param {Object} options.reportData - Report data for filename generation
   * @param {string} options.title - Document title (optional)
   * @returns {Promise<string>} Promise that resolves with HTML string
   */
  static async generateHTMLForPDF({ element, reportData = {}, title = '' }) {
    if (!element) {
      throw new Error('PDF content element not found');
    }

    // Find and convert all report images (letterhead and ServerHealth) to base64
    const reportImages = element.querySelectorAll(`
      img[alt*="Letterhead"], 
      img[src*="letterhead"], 
      img[src*="ServerHealth"],
      img[alt*="Server Health"],
      img[alt*="ServerHealth"],
      img[src*="willowglen_letterhead"]
    `.replace(/\s+/g, ''));
    
    const imagePromises = Array.from(reportImages).map(async (img) => {
      const base64 = await this.convertImageToBase64(img);
      return { element: img, base64 };
    });
    
    const imageResults = await Promise.all(imagePromises);

    // Collect all computed styles from the current page
    const allStyles = this.collectPageStyles();

    // Get the HTML content and replace image sources with base64
    let htmlContent = element.innerHTML;
    
    // Replace report image sources (letterhead and ServerHealth) with base64 data URLs
    imageResults.forEach(({ element, base64 }) => {
      if (base64 && element.outerHTML) {
        const originalSrc = element.getAttribute('src');
        if (originalSrc) {
          htmlContent = htmlContent.replace(
            new RegExp(`src="${originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            `src="${base64}"`
          );
        }
      }
    });

    // Create a complete HTML document with embedded styles (optimized for PDF)
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
  <style>
    ${allStyles}
    ${this.getMaterialUIStyles()}
    
    /* PDF-specific optimizations */
    * {
      box-sizing: border-box !important;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      font-family: 'Roboto', sans-serif !important;
      line-height: 1.5 !important;
      color: #333 !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    .report-container {
      max-width: none !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Remove default margins from common elements */
    h1, h2, h3, h4, h5, h6, p, div, section, article {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    /* Ensure full width for containers */
    .MuiBox-root, .MuiPaper-root, .MuiContainer-root {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }
    
    /* Hide buttons and interactive elements */
    .pdf-buttons,
    .no-print,
    button,
    .MuiButton-root {
      display: none !important;
    }
    
    /* Ensure proper page breaks */
    .page-break {
      page-break-before: always !important;
    }
    
    /* Optimize images for PDF */
    img {
      max-width: 100% !important;
      height: auto !important;
      display: block !important;
    }
  </style>
</head>
<body>
  <div class="report-container">
    ${htmlContent}
  </div>
</body>
</html>`;

    return fullHTML;
  }
  
  /**
   * Generate HTML report from DOM element
   * @param {Object} options - Configuration options
   * @param {HTMLElement} options.element - The DOM element to convert
   * @param {Object} options.reportData - Report data for filename generation
   * @param {string} options.title - Document title (optional)
   * @returns {Promise<void>} Promise that resolves when download is complete
   */
  static async generateHTMLReport({ element, reportData = {}, title = '' }) {
    if (!element) {
      throw new Error('PDF content element not found');
    }

    // Find and convert all report images (letterhead and ServerHealth) to base64
    const reportImages = element.querySelectorAll(`
      img[alt*="Letterhead"], 
      img[src*="letterhead"], 
      img[src*="ServerHealth"],
      img[alt*="Server Health"],
      img[alt*="ServerHealth"],
      img[src*="willowglen_letterhead"]
    `.replace(/\s+/g, ''));
    
    const imagePromises = Array.from(reportImages).map(async (img) => {
      const base64 = await this.convertImageToBase64(img);
      return { element: img, base64 };
    });
    
    const imageResults = await Promise.all(imagePromises);

    // Collect all computed styles from the current page
    const allStyles = this.collectPageStyles();

    // Get the HTML content and replace image sources with base64
    let htmlContent = element.innerHTML;
    
    // Replace report image sources (letterhead and ServerHealth) with base64 data URLs
    imageResults.forEach(({ element, base64 }) => {
      if (base64 && element.outerHTML) {
        const originalSrc = element.getAttribute('src');
        if (originalSrc) {
          htmlContent = htmlContent.replace(
            new RegExp(`src="${originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'),
            `src="${base64}"`
          );
        }
      }
    });

    // Create a complete HTML document with embedded styles
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || `Server PM Report - ${reportData?.pmReportFormServer?.jobNo || ''}`}</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <style>
        ${allStyles}
        ${this.getMaterialUIStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        ${htmlContent}
    </div>
</body>
</html>`;

    // Create and download the file
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with job number and date
    const jobNo = reportData?.pmReportFormServer?.jobNo || '';
    const date = new Date().toISOString().split('T')[0];
    const filename = jobNo ? `Server_PM_Report_${jobNo}_${date}.html` : `Server_PM_Report_${date}.html`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Hide buttons during HTML generation
   * @param {string} selector - CSS selector for buttons to hide
   */
  static hideButtons(selector = '.pdf-buttons') {
    const buttons = document.querySelectorAll(selector);
    buttons.forEach(button => {
      button.style.display = 'none';
    });
    return buttons;
  }

  /**
   * Show buttons after HTML generation
   * @param {NodeList} buttons - Buttons to show
   */
  static showButtons(buttons) {
    buttons.forEach(button => {
      button.style.display = '';
    });
  }
}

export default HTMLGenerator;