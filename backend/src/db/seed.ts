import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

async function seed() {
  console.log('🌱 Seeding database...');

  // Initialize database connection
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/bughunting';
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  try {
    // Create sample CVE
    const cve = await db.insert(schema.cves).values({
      cveId: 'CVE-2025-55182',
      title: 'Next.js React Server Components RCE',
      description: 'A critical remote code execution vulnerability in Next.js React Server Components that allows attackers to execute arbitrary code on the server through crafted malicious payloads.',
      severity: 'CRITICAL',
      cvssScore: '9.8',
      publishedDate: new Date('2025-01-15'),
      affectedProducts: ['Next.js 13.x', 'Next.js 14.x', 'Next.js 15.x'],
      references: [
        'https://nvd.nist.gov/vuln/detail/CVE-2025-55182',
        'https://www.cybertechmind.com',
      ],
    }).returning();

    console.log('✓ Created CVE:', cve[0].cveId);

    // Create sample POC
    const poc = await db.insert(schema.pocs).values({
      cveId: cve[0].id,
      name: 'React2Shell - CVE-2025-55182 Exploit',
      description: 'Automated exploitation tool for CVE-2025-55182. Crafts malicious payloads to achieve remote code execution on vulnerable Next.js servers.',
      language: 'python',
      scriptPath: '/app/exploits/react2shell/exploit.py',
      usageExamples: `exploit.py -t localhost:3000 -c "whoami"
exploit.py -t http://target.com -c "cat /etc/passwd"
exploit.py -t http://target.com -c "id"`,
      author: 'Moovendhan V',
    }).returning();

    console.log('✓ Created POC:', poc[0].name);

    // Create another sample CVE
    const cve2 = await db.insert(schema.cves).values({
      cveId: 'CVE-2024-12345',
      title: 'Example SQL Injection in Web Framework',
      description: 'SQL injection vulnerability allowing unauthorized database access.',
      severity: 'HIGH',
      cvssScore: '8.5',
      publishedDate: new Date('2024-11-20'),
      affectedProducts: ['ExampleFramework 2.x'],
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-12345'],
    }).returning();

    console.log('✓ Created CVE:', cve2[0].cveId);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await client.end();
  }

  process.exit(0);
}

seed();
