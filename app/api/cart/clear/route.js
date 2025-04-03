import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import { getServerSession } from 'next-auth/next';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function DELETE(req) {
  await dbConnect();
  const session = await getServerSession(options);

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.cart = [];
    await user.save();
    return NextResponse.json({ cart: user.cart });
  } catch (error) {
    console.error('DELETE /api/cart/clear error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}