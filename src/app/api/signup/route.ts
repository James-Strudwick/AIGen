import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, name, email } = await request.json();

    if (!userId || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate a slug from the name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const supabase = getServiceClient();

    // Check slug uniqueness, append number if needed
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
      active: false, // Not live until onboarding complete
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
