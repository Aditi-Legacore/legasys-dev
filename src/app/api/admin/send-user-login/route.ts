import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1️⃣ Generate temp password
    const tempPassword = Math.random().toString(36).slice(-8); // eg: a9K2pLx3

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3️⃣ Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: true,
        forcePasswordReset: true,
      },
    });

    // 4️⃣ Send email
    const appUrl = process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== "undefined" ? process.env.NEXT_PUBLIC_APP_URL : "http://localhost:3000";
    const loginUrl = `${appUrl}/login`;

    await sendEmail({
      to: user.email,
      subject: 'Your Legasys Login Credentials',
      text: `
Hello,

Your account has been activated.

Login Email: ${user.email}
Temporary Password: ${tempPassword}

Login here:
${loginUrl}

⚠️ You will be required to reset your password after login.

— Legasys Team
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
