const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
        {
            email: 'ahmad.subekti@trimulyo.desa.id',
            password: hashedPassword,
            name: 'Ahmad Subekti',
            jabatan: 'Lurah',
            phoneNumber: '081234567890',
        },
        {
            email: 'siti.rahayu@trimulyo.desa.id',
            password: hashedPassword,
            name: 'Siti Rahayu',
            jabatan: 'Dukuh A',
            phoneNumber: '081234567891',
        },
        {
            email: 'budi.santoso@trimulyo.desa.id',
            password: hashedPassword,
            name: 'Budi Santoso',
            jabatan: 'Dukuh B',
            phoneNumber: '081234567892',
        },
        {
            email: 'dewi.kusuma@trimulyo.desa.id',
            password: hashedPassword,
            name: 'Dewi Kusuma',
            jabatan: 'Ulu-ulu',
            phoneNumber: '081234567893',
        },
        {
            email: 'eko.prasetyo@trimulyo.desa.id',
            password: hashedPassword,
            name: 'Eko Prasetyo',
            jabatan: 'Staf Administrasi',
            phoneNumber: '081234567894',
        },
    ];

    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData,
        });
        console.log(`✅ Created user: ${user.name} (${user.jabatan})`);
    }

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
