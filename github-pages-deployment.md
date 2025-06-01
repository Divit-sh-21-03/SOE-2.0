# GitHub Pages Deployment Guide for Summer of Electronics 2.0 Website

This guide will walk you through how to deploy the Summer of Electronics 2.0 website to GitHub Pages step by step.

## Prerequisites

- A GitHub account
- Git installed on your computer
- Basic knowledge of Git commands

## Step 1: Create a New GitHub Repository

1. Log in to your GitHub account
2. Click on the "+" icon in the top-right corner and select "New repository"
3. Name your repository `summer-electronics-2025` (or any name you prefer)
4. Make sure the repository is set to "Public" (GitHub Pages requires this for free accounts)
5. Click "Create repository"

## Step 2: Clone the Repository to Your Computer

```bash
git clone https://github.com/YOUR-USERNAME/summer-electronics-2025.git
cd summer-electronics-2025
```

Replace `YOUR-USERNAME` with your actual GitHub username.

## Step 3: Add Website Files to the Repository

1. Copy all the website files (HTML, CSS, JS, images) into the repository folder
2. Make sure the main HTML file is named `index.html` (GitHub Pages uses this as the homepage)

## Step 4: Commit and Push the Files

```bash
git add .
git commit -m "Initial website commit"
git push origin main
```

## Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" (tab with gear icon)
3. Scroll down to the "GitHub Pages" section
4. Under "Source", select "main" branch
5. Click "Save"

## Step 6: Access Your Website

After enabling GitHub Pages, you'll see a message like:

> Your site is published at https://YOUR-USERNAME.github.io/summer-electronics-2025/

This is the URL of your live website. It may take a few minutes for the site to become available.

## Step 7: Adding a Custom Domain (Optional)

If you have a custom domain you'd like to use:

1. In the GitHub Pages section of your repository settings, enter your domain in the "Custom domain" field
2. Add a CNAME record at your domain registrar pointing to `YOUR-USERNAME.github.io`
3. Add a file named `CNAME` to your repository with your domain name as its content

## Updating Your Website

To make changes to your website:

1. Make the changes to your local files
2. Commit and push the changes:

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

GitHub Pages will automatically update your site with the new changes (usually within minutes).

## Troubleshooting

- **404 Error**: Make sure your main HTML file is named `index.html` and is in the root of the repository
- **CSS or JS not loading**: Check the paths in your HTML files - they should be relative to the root
- **Changes not appearing**: It can take a few minutes for changes to propagate. Try clearing your browser cache

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Setting up a custom domain with GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Troubleshooting GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-github-pages-sites)