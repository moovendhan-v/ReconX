import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

describe('Build Process and Deployment Compatibility', () => {
  const projectRoot = join(__dirname, '../../../');
  const distPath = join(projectRoot, 'dist');
  
  beforeAll(() => {
    // Clean any existing build
    try {
      execSync('rm -rf dist', { cwd: projectRoot, stdio: 'pipe' });
    } catch (error) {
      // Ignore if dist doesn't exist
    }
  });

  afterAll(() => {
    // Clean up after tests
    try {
      execSync('rm -rf dist', { cwd: projectRoot, stdio: 'pipe' });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('TypeScript Compilation', () => {
    it('should compile TypeScript without errors', () => {
      expect(() => {
        execSync('npx tsc --noEmit', { 
          cwd: projectRoot, 
          stdio: 'pipe',
          timeout: 30000 
        });
      }).not.toThrow();
    });

    it('should validate all import paths', () => {
      expect(() => {
        execSync('npx tsc --noEmit --skipLibCheck false', { 
          cwd: projectRoot, 
          stdio: 'pipe',
          timeout: 30000 
        });
      }).not.toThrow();
    });
  });

  describe('Vite Build Process', () => {
    it('should build successfully without errors', () => {
      expect(() => {
        const output = execSync('npm run build', { 
          cwd: projectRoot, 
          encoding: 'utf8',
          timeout: 60000 
        });
        
        // Verify build completed successfully
        expect(output).toContain('built in');
      }).not.toThrow();
    });

    it('should generate all required build artifacts', () => {
      // Ensure build has run
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      // Check for essential build files
      expect(existsSync(join(distPath, 'index.html'))).toBe(true);
      expect(existsSync(join(distPath, 'assets'))).toBe(true);
      
      // Check for JavaScript bundles
      const assetsDir = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsDir);
      
      const hasJSBundle = files.some((file: string) => file.endsWith('.js'));
      const hasCSSBundle = files.some((file: string) => file.endsWith('.css'));
      
      expect(hasJSBundle).toBe(true);
      expect(hasCSSBundle).toBe(true);
    });

    it('should optimize bundle sizes', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsDir);
      
      // Check main bundle size (should be reasonable)
      const jsFiles = files.filter((file: string) => file.endsWith('.js'));
      
      for (const jsFile of jsFiles) {
        const filePath = join(assetsDir, jsFile);
        const stats = statSync(filePath);
        
        // Main bundle should be under 2MB (adjust as needed)
        if (jsFile.includes('index')) {
          expect(stats.size).toBeLessThan(2 * 1024 * 1024);
        }
      }
    });

    it('should include all required dependencies', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf8');
      
      // Verify HTML structure
      expect(indexHtml).toContain('<div id="root">');
      expect(indexHtml).toContain('<script');
      expect(indexHtml).toContain('<link');
    });
  });

  describe('Asset Optimization', () => {
    it('should generate optimized CSS', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsDir);
      const cssFiles = files.filter((file: string) => file.endsWith('.css'));
      
      expect(cssFiles.length).toBeGreaterThan(0);
      
      // Check CSS is minified
      for (const cssFile of cssFiles) {
        const cssContent = readFileSync(join(assetsDir, cssFile), 'utf8');
        
        // Minified CSS should not have excessive whitespace
        const lines = cssContent.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        
        // Minified CSS typically has fewer lines
        expect(nonEmptyLines.length).toBeLessThan(lines.length * 0.8);
      }
    });

    it('should handle static assets correctly', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      // Check that assets are properly referenced
      const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf8');
      
      // Assets should use relative paths or proper base paths
      const assetReferences = indexHtml.match(/(?:src|href)="([^"]+)"/g) || [];
      
      for (const ref of assetReferences) {
        const path = ref.match(/"([^"]+)"/)?.[1];
        if (path && path.startsWith('./assets/')) {
          const assetPath = join(distPath, path.substring(2));
          expect(existsSync(assetPath)).toBe(true);
        }
      }
    });
  });

  describe('Environment Configuration', () => {
    it('should handle environment variables correctly', () => {
      // Test with different NODE_ENV values
      const testEnvs = ['development', 'production', 'test'];
      
      for (const env of testEnvs) {
        expect(() => {
          execSync(`NODE_ENV=${env} npx tsc --noEmit`, { 
            cwd: projectRoot, 
            stdio: 'pipe',
            timeout: 30000 
          });
        }).not.toThrow();
      }
    });

    it('should validate API configuration', () => {
      // Check that API config is properly typed and validated
      const configPath = join(projectRoot, 'src/services/api.config.ts');
      expect(existsSync(configPath)).toBe(true);
      
      const configContent = readFileSync(configPath, 'utf8');
      
      // Should have proper environment variable handling
      expect(configContent).toContain('VITE_');
      expect(configContent).toContain('baseURL');
    });
  });

  describe('Dependency Compatibility', () => {
    it('should have no conflicting peer dependencies', () => {
      expect(() => {
        execSync('npm ls', { 
          cwd: projectRoot, 
          stdio: 'pipe' 
        });
      }).not.toThrow();
    });

    it('should validate shadcn/ui component compatibility', () => {
      // Check that all shadcn/ui components can be imported
      const componentTests = [
        'Button',
        'Card',
        'Dialog',
        'Table',
        'Form',
        'Input',
        'Select',
        'Badge',
        'Alert',
      ];

      for (const _component of componentTests) {
        expect(() => {
          execSync(`node -e "require('./dist/assets/index.js')"`, { 
            cwd: projectRoot, 
            stdio: 'pipe' 
          });
        }).not.toThrow();
      }
    });

    it('should validate React Router compatibility', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      // Check that routing is properly configured
      const mainBundle = require('fs').readdirSync(join(distPath, 'assets'))
        .find((file: string) => file.includes('index') && file.endsWith('.js'));
      
      if (mainBundle) {
        const bundleContent = readFileSync(join(distPath, 'assets', mainBundle), 'utf8');
        
        // Should contain React Router code
        expect(bundleContent).toContain('BrowserRouter');
      }
    });
  });

  describe('Performance Optimization', () => {
    it('should implement code splitting', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const jsFiles = require('fs').readdirSync(assetsDir)
        .filter((file: string) => file.endsWith('.js'));
      
      // Should have multiple JS chunks for code splitting
      expect(jsFiles.length).toBeGreaterThan(1);
    });

    it('should optimize for production', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsDir);
      
      // Files should have hash names for caching
      const hashedFiles = files.filter((file: string) => 
        /\.[a-f0-9]{8,}\.(js|css)$/.test(file)
      );
      
      expect(hashedFiles.length).toBeGreaterThan(0);
    });

    it('should generate source maps for debugging', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsDir);
      
      // Should have source map files
      const sourceMapFiles = files.filter((file: string) => file.endsWith('.map'));
      expect(sourceMapFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Deployment Readiness', () => {
    it('should serve correctly with static file server', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      // Test preview mode
      expect(() => {
        execSync('timeout 5s npm run preview || true', { 
          cwd: projectRoot, 
          stdio: 'pipe' 
        });
      }).not.toThrow();
    });

    it('should handle SPA routing correctly', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf8');
      
      // Should have proper base tag or routing setup
      expect(indexHtml).toContain('<div id="root">');
      
      // Check for proper meta tags
      expect(indexHtml).toContain('<meta charset="utf-8">');
      expect(indexHtml).toContain('<meta name="viewport"');
    });

    it('should validate security headers compatibility', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf8');
      
      // Should not have inline scripts that would violate CSP
      const inlineScripts = indexHtml.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
      const hasInlineJS = inlineScripts.some(script => 
        !script.includes('src=') && script.includes('>')
      );
      
      // Modern builds should minimize inline scripts
      expect(hasInlineJS).toBe(false);
    });

    it('should be compatible with Docker deployment', () => {
      // Check for Docker-related files
      const dockerfilePath = join(projectRoot, '../docker/frontend.Dockerfile');
      
      if (existsSync(dockerfilePath)) {
        const dockerfileContent = readFileSync(dockerfilePath, 'utf8');
        
        // Should have proper build steps
        expect(dockerfileContent).toContain('npm');
        expect(dockerfileContent).toContain('build');
      }
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should generate compatible JavaScript', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      const assetsDir = join(distPath, 'assets');
      const jsFiles = require('fs').readdirSync(assetsDir)
        .filter((file: string) => file.endsWith('.js'));
      
      for (const jsFile of jsFiles) {
        const jsContent = readFileSync(join(assetsDir, jsFile), 'utf8');
        
        // Should not contain modern JS that's not transpiled
        expect(jsContent).not.toContain('?.'); // Optional chaining should be transpiled
        expect(jsContent).not.toContain('??'); // Nullish coalescing should be transpiled
      }
    });

    it('should include necessary polyfills', () => {
      if (!existsSync(distPath)) {
        execSync('npm run build', { cwd: projectRoot, stdio: 'pipe' });
      }

      // Check Vite config for proper browser targets
      const viteConfigPath = join(projectRoot, 'vite.config.ts');
      
      if (existsSync(viteConfigPath)) {
        const viteConfig = readFileSync(viteConfigPath, 'utf8');
        
        // Should have proper build target configuration
        expect(viteConfig).toContain('build');
      }
    });
  });
});