# ERP Calculator

## Environment Setup

1. Create a `.env` file in the root directory
2. Copy contents from `.env.example` and fill in your values
3. Never commit the `.env` file to version control

### Production Deployment

1. Set environment variables in Netlify:
   - Go to Site settings > Build & deploy > Environment
   - Add each variable from `.env.example`
   - Keep these values secure and never share them

### Local Development

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your development credentials to `.env`

3. The `.env` file is automatically ignored by Git

### Security Notes

- Never commit `.env` files to Git
- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Keep production credentials secure in Netlify
- Regularly rotate API keys and credentials