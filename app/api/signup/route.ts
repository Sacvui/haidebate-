import { NextRequest, NextResponse } from 'next/server';
import { createUser, getTotalUsers, validateReferralCode, processReferral } from '@/lib/kv';

export async function POST(request: NextRequest) {
    try {
        const { email, referralCode } = await request.json();

        // Check if signup requires referral
        const total = await getTotalUsers();
        if (total >= 100 && !referralCode) {
            return NextResponse.json(
                { error: 'Cần mã giới thiệu để đăng ký' },
                { status: 403 }
            );
        }

        // Validate referral code if provided
        if (referralCode) {
            const isValid = await validateReferralCode(referralCode);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Mã giới thiệu không hợp lệ' },
                    { status: 400 }
                );
            }
        }

        // Create user
        const user = await createUser(email, referralCode);

        // Process referral
        if (referralCode) {
            await processReferral(user.id, referralCode);
        }

        return NextResponse.json(user);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Đăng ký thất bại' },
            { status: 500 }
        );
    }
}
