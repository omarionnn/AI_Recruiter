# Deployment Guide

Follow these steps to deploy your AI Recruiter Console to the web so anyone can use it.

## Prerequisites
- A [GitHub account](https://github.com/)
- A [Vercel account](https://vercel.com/) (Free tier is sufficient)
- Your Vapi API Keys (The ones currently in your `.env` file)

## Step 1: Push your code to GitHub

1. Open your terminal in the project directory.
2. Stage and commit all your recent changes:
   ```bash
   git add .
   git commit -m "Ready for deployment: UI updates and dashboard stats"
   ```
3. Push to your GitHub repository:
   ```bash
   git push origin main
   ```
   *(If you are on a different branch, use that branch name instead of `main`)*

## Step 2: Deploy on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Select your `AI_Recruiter` repository from the list (you may need to install the Vercel GitHub App if you haven't already).
4. Click **"Import"**.

## Step 3: Configure Environment Variables

**CRITICAL STEP**: The app will not work without these keys.

1. In the "Configure Project" screen, look for the **"Environment Variables"** section.
2. Add the following variables (copy the values from your local `.env` file):

   | Name | Value |
   |------|-------|
   | `VAPI_API_KEY` | *Your Vapi Private API Key* |
   | `VAPI_PHONE_NUMBER_ID` | *Your Vapi Phone Number ID* |
   | `VAPI_ASSISTANT_ID` | *Your Vapi Assistant ID* (Optional but recommended) |

3. Click **"Deploy"**.

## Step 4: Verify

1. Vercel will build your project. This usually takes 1-2 minutes.
2. Once complete, you will get a public URL (e.g., `ai-recruiter-gamma.vercel.app`).
3. Visit the URL and test the "Start Call" functionality.

---

### Important Notes
- **Usage Costs**: Anyone who visits this website can initiate calls using **your** Vapi account credits. Ensure you monitor your usage in the Vapi Dashboard.
- **Security**: Your API keys are stored securely on the Vercel server. Users of the website cannot see them.
