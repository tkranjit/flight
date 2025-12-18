import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        hasApiKey: !!process.env.AVIATION_STACK_API_KEY,
        keyLength: process.env.AVIATION_STACK_API_KEY?.length || 0,
        nodeEnv: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('AVIATION'))
    });
}
