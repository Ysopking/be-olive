import { PrismaClient } from '@prisma/client';
import { requireAuth, hashPassword } from '../../../lib/auth';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = requireAuth(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { email, password } = req.body;

  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.passwordHash = await hashPassword(password);

    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: updateData,
      select: { id: true, email: true, role: true }
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}