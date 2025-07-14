import type { NextApiRequest, NextApiResponse } from 'next';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, inviteLink } = req.body;
    if (!email || !inviteLink) {
      return res.status(400).json({ error: 'Missing email or inviteLink' });
    }
    try {
      await sendgrid.send({
        to: email,
        from: 'your@email.com', // TODO: Replace with your verified sender
        subject: 'You have been invited to collaborate!',
        html: `<p>You have been invited to collaborate on a category.<br/><a href="${inviteLink}">Accept invitation</a></p>`,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send email.' });
    }
  } else {
    res.status(405).end();
  }
} 