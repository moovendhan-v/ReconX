"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_js_1 = require("drizzle-orm/postgres-js");
const drizzle_orm_1 = require("drizzle-orm");
const postgres_1 = require("postgres");
const schema = require("./schema");
async function seed() {
    console.log('🌱 Seeding database...');
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/bughunting';
    const client = (0, postgres_1.default)(connectionString);
    const db = (0, postgres_js_1.drizzle)(client, { schema });
    try {
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
        const existingCve3 = await db.select().from(schema.cves).where((0, drizzle_orm_1.eq)(schema.cves.cveId, 'CVE-2025-99999'));
        if (existingCve3.length === 0) {
            const cve3 = await db.insert(schema.cves).values({
                cveId: 'CVE-2025-99999',
                title: 'Critical Buffer Overflow in Core Lib',
                description: 'A heap-based buffer overflow vulnerability in the core processing library allows remote attackers to execute arbitrary code via specially crafted packets.',
                severity: 'CRITICAL',
                cvssScore: '9.9',
                publishedDate: new Date('2025-02-01'),
                affectedProducts: ['CoreLib 1.0', 'CoreLib 2.0'],
                references: ['https://nvd.nist.gov/vuln/detail/CVE-2025-99999'],
            }).returning();
            console.log('✓ Created CVE:', cve3[0].cveId);
        }
        else {
            console.log('ℹ️ CVE CVE-2025-99999 already exists, skipping.');
        }
        console.log('✅ Database seeded successfully!');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
    finally {
        await client.end();
    }
    process.exit(0);
}
seed();
//# sourceMappingURL=seed.js.map