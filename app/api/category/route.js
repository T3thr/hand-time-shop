import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/mongodb';
import Category from '@/backend/models/Category';

export async function GET() {
    try {
      await dbConnect();
      // Now include 'description' in the select method
      const categories = await Category.find().select('name slug description image').lean();
      return NextResponse.json(categories);
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
  }
  