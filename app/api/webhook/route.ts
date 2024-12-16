import { NextResponse } from 'next/server';
import bot from '../../telegram/bot';

export async function POST(request: Request) {
  try {
    const update = await request.json();
    // @ts-expect-error - handleUpdate exists but is not in type definitions
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
