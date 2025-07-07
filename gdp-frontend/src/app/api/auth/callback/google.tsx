import { NextApiRequest, NextApiResponse } from 'next';
// import { handleGoogleCallback } from '@/services/authService';

export default function GoogleCallback(req: NextApiRequest, res: NextApiResponse) {
  // Ensure req.url is defined
  if (!req.url) {
    return res.status(400).json({ error: 'URL is undefined' });
  }

  // Extract search parameters from the URL
  const searchParams = new URLSearchParams(req.url.split('?')[1]);

  // Handle the Google callback
  // handleGoogleCallback(searchParams);

  // Redirect to the dashboard after handling the callback
  res.writeHead(302, { Location: '/Dashboard' });
  res.end();
}
