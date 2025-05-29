import { connectDB } from '../config/database';
import { SeedData } from '../utils/seedData';
import { DatabaseUtils } from '../utils/database';
import { Helpers } from '../utils/helpers';

class InitScript {
  static async initialize(): Promise<void> {
    try {
      Helpers.logInfo('🚀 Initializing application...');
      
      // Connect to database
      await connectDB();
      
      // Get database stats
      const stats = await DatabaseUtils.getDbStats();
      if (stats) {
        Helpers.logInfo('📊 Database Stats:', stats);
      }
      
      // Seed data if needed
      await SeedData.seedDatabase();
      
      // Verify email configuration
      this.verifyEmailConfig();
      
      Helpers.logSuccess('✅ Application initialization completed');
      
    } catch (error) {
      Helpers.logError('❌ Initialization failed:', error);
      process.exit(1);
    }
  }

  private static verifyEmailConfig(): void {
    const requiredEmailEnvs = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD'];
    const missingEnvs = requiredEmailEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      Helpers.logError(`⚠️  Missing email configuration: ${missingEnvs.join(', ')}`);
      Helpers.logInfo('📧 Email functionality may not work properly');
    } else {
      Helpers.logSuccess('📧 Email configuration verified');
    }
  }
}

export { InitScript };

// Run if called directly
if (require.main === module) {
  InitScript.initialize()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
