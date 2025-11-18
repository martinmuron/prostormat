/**
 * Unified Email Template System for Prostormat
 * Consistent branding matching prostormat.cz website
 */

// Unified email styles matching website branding
export const EMAIL_STYLES = `
  /* Base styles matching Prostormat website */
  body {
    margin: 0;
    padding: 0;
    font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #fafafa;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .email-wrapper {
    width: 100%;
    padding: 40px 20px;
    background-color: #fafafa;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  }
  /* Header with blue gradient matching website */
  .email-header {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    padding: 40px 30px;
    text-align: center;
  }
  .email-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
  .email-header p {
    margin: 8px 0 0 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.9);
  }
  /* Content */
  .email-body {
    padding: 40px 30px;
    color: #171717;
  }
  .greeting {
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: #171717;
  }
  .text-block {
    font-size: 16px;
    line-height: 1.6;
    color: #404040;
    margin: 0 0 16px 0;
  }
  .text-block strong {
    color: #171717;
    font-weight: 600;
  }
  /* Info cards */
  .info-card {
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border: 2px solid #bfdbfe;
    border-radius: 16px;
    padding: 24px;
    margin: 24px 0;
  }
  .info-card.orange {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-color: #fed7aa;
  }
  .info-card.green {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #bbf7d0;
  }
  .info-card.gray {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-color: #e2e8f0;
  }
  .info-card h3 {
    font-size: 18px;
    font-weight: 600;
    color: #171717;
    margin: 0 0 12px 0;
  }
  .info-card p {
    font-size: 15px;
    line-height: 1.5;
    color: #525252;
    margin: 0;
  }
  /* Detail rows */
  .detail-row {
    margin: 12px 0;
    padding: 12px 0;
    border-bottom: 1px solid #e5e5e5;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #737373;
    margin: 0 0 4px 0;
  }
  .detail-value {
    font-size: 16px;
    color: #171717;
    margin: 0;
  }
  .detail-value a {
    color: #2563eb;
    text-decoration: none;
  }
  .detail-value a:hover {
    text-decoration: underline;
  }
  /* CTA Button */
  .cta-section {
    text-align: center;
    margin: 32px 0;
  }
  .cta-button {
    display: inline-block;
    background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
    color: #ffffff;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: -0.01em;
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  }
  .cta-button:hover {
    background: linear-gradient(180deg, #1d4ed8 0%, #1e40af 100%);
  }
  .cta-button.secondary {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    color: #171717;
    border: 2px solid #e5e5e5;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  /* Footer */
  .email-footer {
    background-color: #fafafa;
    padding: 30px;
    text-align: center;
    color: #737373;
    font-size: 14px;
    line-height: 1.6;
  }
  .email-footer a {
    color: #2563eb;
    text-decoration: none;
  }
  .email-footer a:hover {
    text-decoration: underline;
  }
  /* Mobile responsive */
  @media only screen and (max-width: 600px) {
    .email-wrapper {
      padding: 20px 12px;
    }
    .email-header {
      padding: 32px 24px;
    }
    .email-header h1 {
      font-size: 24px;
    }
    .email-body {
      padding: 32px 24px;
    }
    .greeting {
      font-size: 20px;
    }
    .info-card {
      padding: 20px;
    }
  }
`

interface EmailTemplateOptions {
  subject: string
  headerTitle?: string
  headerSubtitle?: string
  greeting?: string
  body: string
  footerText?: string
}

/**
 * Generate a unified email template
 */
export function generateUnifiedEmailTemplate(options: EmailTemplateOptions): string {
  const {
    subject,
    headerTitle = 'Prostormat',
    headerSubtitle = 'Platforma pro hledání event prostorů',
    greeting,
    body,
    footerText,
  } = options

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>${EMAIL_STYLES}</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <h1>${headerTitle}</h1>
        ${headerSubtitle ? `<p>${headerSubtitle}</p>` : ''}
      </div>

      <!-- Body -->
      <div class="email-body">
        ${greeting ? `<h2 class="greeting">${greeting}</h2>` : ''}
        ${body}
      </div>

      <!-- Footer -->
      <div class="email-footer">
        ${footerText || `
          <p><strong>Prostormat</strong> – Platforma pro hledání event prostorů</p>
          <p>
            <a href="mailto:info@prostormat.cz">info@prostormat.cz</a> |
            <a href="https://prostormat.cz">prostormat.cz</a>
          </p>
        `}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version from HTML
 */
export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()
}
