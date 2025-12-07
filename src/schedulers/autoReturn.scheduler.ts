
import cron from 'node-cron';
import { bookingService } from '../modules/bookings/bookings.service';

export const startAutoReturnScheduler = () => {
  
  cron.schedule('* * * * *', async () => {
    try {
      const count = await bookingService.autoReturnExpiredBookings();
      console.log(`Auto-returned ${count} expired bookings`);
    } catch (error) {
      console.error('Auto-return scheduler error:', error);
    }
  });
  
  console.log('Auto-return scheduler started');
};