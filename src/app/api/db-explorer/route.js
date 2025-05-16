import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    redirect: '/db-explorer',
    message: 'Bu bir API endpoint\'i değil, bir sayfa rotasıdır. Lütfen /db-explorer adresine gidin.'
  }, {
    status: 307,
    headers: {
      'Location': '/db-explorer'
    }
  });
} 