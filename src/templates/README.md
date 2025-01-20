## CSV Template Format

This template includes all fields for importing system data into the ERP comparison database.

### Required Fields
- `name`: System name (text)
- `vendor`: Vendor name (text)
- `website`: Website URL (text)
- `description`: System description (text)
- `size`: Company sizes as PostgreSQL array (e.g., "{Małe,Średnie,Duże}")

### Basic Modules (boolean)
- `finance`: Financial management
- `hr`: Human resources
- `scm`: Supply chain management
- `production`: Production management
- `crm`: Customer relationship management
- `warehouse`: Warehouse management
- `purchasing`: Purchasing management

### Special Modules (boolean)
- `project`: Project management
- `bi`: Business intelligence
- `grc`: Governance, risk and compliance
- `dam`: Digital asset management
- `cmms`: Maintenance management
- `plm`: Product lifecycle management
- `rental`: Rental and leasing management
- `ecommerce`: E-commerce integration

### Connectivity Modules (boolean)
- `edi`: Electronic data interchange
- `iot`: IoT integration
- `api`: API availability
- `dms`: Document management
- `mobile`: Mobile apps
- `portals`: Partner/customer portals

### Technical Aspects
- `customization_level`: "Low", "Medium", or "High"
- `update_frequency`: "Monthly", "Quarterly", "Semi-annually", or "Annually"
- `supported_databases`: Array of supported databases (e.g., "{MS SQL,Oracle}")
- `multilingual`: Boolean for multilingual support
- `max_users`: Maximum number of users (integer, null for unlimited)
- `concurrent_users`: Maximum concurrent users (integer)

### Detailed Information (Arrays in PostgreSQL format with curly braces)
- `pricing_model`: e.g., "{subscription,perpetual,user-based}"
- `implementation_time`: Text description (e.g., "3-6 months")
- `target_industries`: e.g., "{Produkcja,Handel,Usługi}"
- `languages`: e.g., "{Polski,Angielski}"
- `support_options`: e.g., "{Email,Telefon,Chat,On-site}"
- `training_options`: e.g., "{Online,On-site,Dokumentacja}"
- `integration_options`: e.g., "{API,Web Services,Import/Export}"
- `security_features`: e.g., "{2FA,Role-based access}"
- `compliance_standards`: e.g., "{GDPR,ISO 27001}"
- `backup_options`: e.g., "{Automatic,Manual,Cloud}"
- `reporting_features`: e.g., "{Custom reports,Dashboards}"

### Notes
1. Array values must be enclosed in curly braces and comma-separated
2. Text values containing commas must be enclosed in double quotes
3. Boolean values should be "true" or "false"
4. Empty values are allowed for optional fields
5. Dates and timestamps are handled automatically by the database