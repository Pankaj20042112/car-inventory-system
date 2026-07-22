const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding showroom inventory with luxury vehicles...');

  const vehicles = [
    {
      make: 'Tesla',
      model: 'Model S Plaid',
      category: 'Sedan',
      price: 89990,
      quantity: 5,
      imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=600&q=80'
    },
    {
      make: 'Lamborghini',
      model: 'Urus Performante',
      category: 'SUV',
      price: 260000,
      quantity: 2,
      imageUrl: 'https://images.unsplash.com/photo-1582270929555-52da11666e85?auto=format&fit=crop&w=600&q=80'
    },
    {
      make: 'Ford',
      model: 'F-150 Raptor',
      category: 'Truck',
      price: 79975,
      quantity: 3,
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80'
    },
    {
      make: 'BMW',
      model: 'M8 Competition Coupe',
      category: 'Sedan',
      price: 134100,
      quantity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80'
    }
  ];

  for (const vehicle of vehicles) {
    const created = await prisma.vehicle.create({
      data: vehicle
    });
    console.log(`Created vehicle: ${created.make} ${created.model} (ID: ${created.id})`);
  }

  console.log('Showroom seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
