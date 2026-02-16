# Deployment Guide - Azure Static Web Apps

## Prerequisites

1. Azure account with an active subscription
2. GitHub repository for this project
3. Node.js 18+ installed locally

## Setup Instructions

### 1. Create Azure Static Web Apps Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" and search for "Static Web Apps"
3. Click "Create"
4. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Name**: Enter a name for your app (e.g., `neural-network-arena`)
   - **Plan**: Select "Free" for development
   - **Region**: Select closest region
5. Click "Next: Deployment details"

### 2. Configure GitHub Connection

1. Click "Sign in with GitHub"
2. Authorize Azure to access your GitHub account
3. Select your **Organization**, **Repository**, and **Branch** (main)
4. For build presets, select "Custom"
5. Configure build details:
   - **App location**: `/` (root)
   - **API location**: (leave empty - no API)
   - **Output location**: `out`
6. Click "Review + Create", then "Create"

### 3. Add GitHub Secret

After creation, Azure will display your API token:

1. Copy the API token from the Azure Portal
2. Go to your GitHub repository
3. Settings → Secrets and variables → Actions
4. Click "New repository secret"
5. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
6. Value: Paste the token from Azure
7. Click "Add secret"

### 4. Build and Deploy

The GitHub Actions workflow will automatically:
- Run on every push to `main` branch
- Build the Next.js static export
- Deploy to Azure Static Web Apps

To manually trigger:
1. Push changes to `main` branch
2. Go to GitHub Actions tab
3. Monitor the "Azure Static Web Apps CI/CD" workflow

## Project Structure

- `out/` - Static output built by Next.js
- `staticwebapp.config.json` - Azure Static Web Apps routing configuration
- `.github/workflows/` - GitHub Actions CI/CD workflow
- `next.config.mjs` - Next.js configuration with static export

## Local Testing

### Build locally:
```bash
npm run build
```

### Serve static files locally:
```bash
npx serve out
```

Then open `http://localhost:3000`

## Troubleshooting

### Build fails
- Check Node.js version: `node --version` (should be 18+)
- Clear cache: `rm -rf node_modules .next out` and `npm install`
- Check logs in GitHub Actions

### Routes not working
- Verify `staticwebapp.config.json` exists in root
- Check that the app renders correctly with `npx serve out`

### Deployment takes long
- First deployment may take 5-10 minutes
- Subsequent deployments are typically faster

## Performance Tips

1. The build output is static - pages load instantly
2. All assets are pre-built and optimized
3. Use Azure CDN with Static Web Apps for global distribution

## Support

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
