import { PrismaClient } from '@prisma/client';
import { Role } from '@car-dealership/shared';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.purchase.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Dealership Admin',
      email: 'admin@dealership.com',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: 'John Customer',
      email: 'user@dealership.com',
      passwordHash: userPasswordHash,
      role: Role.USER
    }
  });

  console.log('Seeded Users:', { admin: admin.email, customer: customer.email });

  const vehicles = [
    { make: 'Tesla', model: 'Model 3', category: 'Electric', year: 2024, price: 42990, quantity: 8, imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500', description: 'Dual Motor All-Wheel Drive, Long Range premium sedan.' },
    { make: 'Tesla', model: 'Model Y', category: 'Electric', year: 2024, price: 47990, quantity: 5, imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=500', description: 'Electric compact crossover SUV with high safety ratings.' },
    { make: 'BMW', model: '3 Series', category: 'Sedan', year: 2023, price: 44500, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500', description: 'Executive sport sedan with precision handling.' },
    { make: 'BMW', model: 'X5', category: 'SUV', year: 2023, price: 65200, quantity: 4, imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500', description: 'Luxury mid-size SAV offering superb comfort.' },
    { make: 'Mercedes', model: 'C-Class', category: 'Sedan', year: 2024, price: 46900, quantity: 3, imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500', description: 'Sleek luxury sedan with modern driver aids.' },
    { make: 'Audi', model: 'Q5', category: 'SUV', year: 2023, price: 44200, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=500', description: 'Versatile premium crossover with Quattro AWD.' },
    { make: 'Toyota', model: 'Camry', category: 'Sedan', year: 2024, price: 26400, quantity: 12, imageUrl: 'https://images.unsplash.com/photo-1621007947382-cc34c866d204?w=500', description: 'Reliable and highly fuel-efficient mid-size sedan.' },
    { make: 'Honda', model: 'Civic', category: 'Sedan', year: 2023, price: 23900, quantity: 15, imageUrl: 'https://images.unsplash.com/photo-1594070319944-7c0cbebb6f58?w=500', description: 'Compact vehicle with excellent cargo options.' },
    { make: 'Ford', model: 'Mustang', category: 'Sports', year: 2024, price: 30900, quantity: 2, imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=500', description: 'Classic American muscle car with high horsepower.' },
    { make: 'Porsche', model: '911', category: 'Sports', year: 2024, price: 114000, quantity: 1, imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500', description: 'High-performance rear-engine luxury sports car.' },
    { make: 'Hyundai', model: 'Ioniq 5', category: 'Electric', year: 2024, price: 41800, quantity: 0, imageUrl: 'https://images.unsplash.com/photo-1669062335191-45f8f8f94635?w=500', description: 'Award-winning retro-futuristic electric utility.' }
  ];

  for (const v of vehicles) {
    await prisma.vehicle.create({ data: v });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
