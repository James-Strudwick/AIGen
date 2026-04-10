import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

function generateReferralCode(): string {
  // 6 character alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email, referralCode } = await request.json();

    if (!userId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const supabase = getServiceClient();

    // Check slug uniqueness
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const { data: existing } = await supabase
        .from('trainers')
        .select('id')
        .eq('slug', slug)
        .single();
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Generate unique referral code
    let myReferralCode = generateReferralCode();
    let codeAttempt = 0;
    while (codeAttempt < 10) {
      const { data: existing } = await supabase
        .from('trainers')
        .select('id')
        .eq('referral_code', myReferralCode)
        .single();
      if (!existing) break;
      myReferralCode = generateReferralCode();
      codeAttempt++;
    }

    // Validate referral code if provided
    let referredBy: string | null = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from('trainers')
        .select('referral_code')
        .eq('referral_code', referralCode.toUpperCase())
        .single();
      if (referrer) {
        referredBy = referralCode.toUpperCase();
      }
    }

    // Create trainer record
    const { error: insertError } = await supabase.from('trainers').insert({
      user_id: userId,
      slug,
      name,
      brand_color_primary: '#1a1a1a',
      brand_color_secondary: '#f5f5f7',
      booking_link: '',
      contact_method: 'whatsapp',
      contact_value: '',
      active: false,
      referral_code: myReferralCode,
      referred_by: referredBy,
    });

    if (insertError) {
      console.error('Trainer insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ slug });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
