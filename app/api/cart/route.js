import { NextResponse } from 'next/server';
import dbConnect from '@/backend/lib/mongodb';
import User from '@/backend/models/User';
import { getServerSession } from 'next-auth/next';
import { options } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(options);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ 
      $or: [
        { email: session.user?.email },
        { lineId: session.user?.sub }
      ]
    }).select('cart');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const session = await getServerSession(options);
    const { product } = await request.json();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!product || !product.id || !product.name || !product.price) {
      return NextResponse.json(
        { error: 'Invalid product data' },
        { status: 400 }
      );
    }

    // Check if the product already exists in the cart
    const existingUser = await User.findOne({
      $or: [
        { email: session.user?.email },
        { lineId: session.user?.sub }
      ],
      'cart.productId': product.id
    });

    if (existingUser) {
      // If product exists, update the quantity instead of adding new item
      const existingItem = existingUser.cart.find(item => item.productId === product.id);
      const newQuantity = existingItem ? existingItem.quantity + 1 : 1;
      
      const user = await User.findOneAndUpdate(
        { 
          $or: [
            { email: session.user?.email },
            { lineId: session.user?.sub }
          ],
          'cart.productId': product.id
        },
        {
          $set: {
            'cart.$.quantity': newQuantity,
            'cart.$.lastUpdated': new Date()
          }
        },
        { new: true }
      ).select('cart');
      
      return NextResponse.json({ cart: user.cart });
    } else {
      // If product doesn't exist, add it to the cart
      const user = await User.findOneAndUpdate(
        { 
          $or: [
            { email: session.user?.email },
            { lineId: session.user?.sub }
          ]
        },
        {
          $push: {
            cart: {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
              image: product.image || '/images/placeholder.jpg',
              variant: product.variant || {}
            }
          }
        },
        { new: true }
      ).select('cart');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({ cart: user.cart });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add to cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const session = await getServerSession(options);
    const { productId, quantity } = await request.json();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId || quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { email: session.user?.email },
          { lineId: session.user?.sub }
        ],
        'cart.productId': productId
      },
      {
        $set: {
          'cart.$.quantity': quantity,
          'cart.$.lastUpdated': new Date()
        }
      },
      { new: true }
    ).select('cart');

    if (!user) {
      return NextResponse.json(
        { error: 'Product not found in cart' },
        { status: 404 }
      );
    }

    return NextResponse.json({ cart: user.cart });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const session = await getServerSession(options);
    const { productId } = await request.json();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { 
        $or: [
          { email: session.user?.email },
          { lineId: session.user?.sub }
        ]
      },
      {
        $pull: {
          cart: { productId }
        }
      },
      { new: true }
    ).select('cart');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to remove from cart', details: error.message },
      { status: 500 }
    );
  }
}