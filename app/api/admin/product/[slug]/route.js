import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/mongodb';
import Product from '@/backend/models/Product';
import { getServerSession } from 'next-auth/next';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request, { params }) {
  const { slug } = params;
  try {
    await dbConnect();
    const product = await Product.findOne({ slug }).lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession(options);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = params;
  try {
    await dbConnect();
    const data = await request.json();
    const product = await Product.findOneAndUpdate(
      { slug },
      { ...data, updatedBy: session.user.id },
      { new: true }
    );
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(options);
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = params;
  try {
    await dbConnect();
    const product = await Product.findOneAndDelete({ slug });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 400 });
  }
}