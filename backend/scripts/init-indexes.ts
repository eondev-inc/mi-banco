import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/modules/usuarios/schemas/user.schema';

async function createIndexes() {
  console.log('🚀 Initializing NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const userModel = app.get(getModelToken(User.name));

    console.log('📊 Creating indexes for User collection...');
    await userModel.createIndexes();
    console.log('✅ Indexes created successfully');

    // List all created indexes
    console.log('\n📋 Current indexes:');
    const indexes = await userModel.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    // Count and display statistics
    const indexCount = Object.keys(indexes).length;
    console.log(`\n✅ Total indexes: ${indexCount}`);
    console.log('🎉 Index creation completed successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  } finally {
    await app.close();
  }
}

createIndexes()
  .then(() => {
    console.log('\n✅ Process completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Process failed:', err);
    process.exit(1);
  });
