<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          #sitemap {
            max-width: 980px;
            margin: 0 auto;
          }
          #sitemap__table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          #sitemap__table tr:hover {
            background-color: #f6f6f6;
          }
          #sitemap__table th {
            padding: 12px;
            border-bottom: 2px solid #ddd;
            text-align: left;
            background-color: #f8f9fa;
          }
          #sitemap__table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }
          .url {
            color: #2563eb;
            text-decoration: none;
          }
          .url:hover {
            text-decoration: underline;
          }
          .priority, .changefreq {
            text-align: center;
          }
          h1 {
            color: #1f2937;
            margin-bottom: 20px;
          }
          .stats {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
          }
        </style>
      </head>
      <body>
        <div id="sitemap">
          <h1>XML Sitemap</h1>
          <div class="stats">
            <p>
              Number of URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
            </p>
          </div>
          <table id="sitemap__table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td>
                    <a class="url" href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                  </td>
                  <td><xsl:value-of select="sitemap:lastmod"/></td>
                  <td class="changefreq"><xsl:value-of select="sitemap:changefreq"/></td>
                  <td class="priority"><xsl:value-of select="sitemap:priority"/></td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
