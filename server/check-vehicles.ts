import { config } from 'dotenv';
import { db } from './database/db';
import { vehicles } from '../shared/schema';

config();

async function checkVehicles() {
  try {
    console.log('Vehicles in database:');
    const allVehicles = await db.select().from(vehicles);
    
    if (allVehicles.length === 0) {
      console.log('No vehicles found in database.');
      return;
    }
    
    allVehicles.forEach((vehicle, index) => {
      console.log(`- Vehicle ${index + 1}:`);
      console.log(`  ID: ${vehicle.id}`);
      console.log(`  License Plate: ${JSON.stringify(vehicle.licensePlate)}`);
      console.log(`  Make: ${vehicle.make}`);
      console.log(`  Model: ${vehicle.model}`);
      console.log(`  Year: ${vehicle.year}`);
      console.log(`  Type: ${vehicle.type}`);
      console.log(`  Status: ${vehicle.status}`);
      console.log(`  Active: ${vehicle.isActive}`);
      console.log('---');
    });
    
    // Check for duplicates
    const licensePlates = allVehicles.map(v => v.licensePlate);
    const duplicates = licensePlates.filter((plate, index) => licensePlates.indexOf(plate) !== index);
    
    if (duplicates.length > 0) {
      console.log('\nDuplicate license plates found:');
      duplicates.forEach(plate => console.log(`- ${JSON.stringify(plate)}`));
    } else {
      console.log('\nNo duplicate license plates found.');
    }
    
  } catch (error) {
    console.error('Error checking vehicles:', error);
  } finally {
    process.exit(0);
  }
}

checkVehicles();