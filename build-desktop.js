const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = __dirname;
const DESKTOP_DIR = path.join(ROOT_DIR, 'apps/desktop');
const API_DIR = path.join(ROOT_DIR, 'apps/api');
const DB_PACKAGE_DIR = path.join(ROOT_DIR, 'packages/database');
const WEB_DIR = path.join(ROOT_DIR, 'apps/web');

const BUILD_DIR = path.join(DESKTOP_DIR, 'backend');

// Helper to run command
function run(cmd, cwd = ROOT_DIR) {
    console.log(`> ${cmd}`);
    execSync(cmd, { cwd, stdio: 'inherit' });
}

// Helper to copy directory
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

async function main() {
    try {
        console.log('--- Starting Desktop Build Process ---');

        // 1. Build Shared Database Package
        console.log('1. Building Database Package...');
        run('npm run generate', DB_PACKAGE_DIR); // generate prisma client
        run('npm run build', DB_PACKAGE_DIR);    // tsc build

        // 2. Build API
        console.log('2. Building API...');
        run('npm run build', API_DIR);

        // 3. Build Web
        console.log('3. Building Web App...');
        run('npm run build', WEB_DIR);

        // 3.5 Copy Web Assets to Desktop Folder
        console.log('3.5 Copying Web Assets...');
        const webDest = path.join(DESKTOP_DIR, 'web-dist');
        if (fs.existsSync(webDest)) {
            try { fs.rmSync(webDest, { recursive: true, force: true }); } catch (e) { }
        }
        if (!fs.existsSync(webDest)) fs.mkdirSync(webDest, { recursive: true });
        // copyDir(src, dest) copies contents of src to dest if existing, or creates dest.
        // My implementation iterates entries in src and puts them in dest.
        // If dest exists, it puts inside dest? No, path.join(dest, entry.name).
        // So putting 'dist' contents into 'web-dist' is correct.
        copyDir(path.join(WEB_DIR, 'dist'), webDest);

        // 4. Prepare Backend Bundle
        console.log('4. Preparing Backend Bundle...');

        // Clean previous build
        if (fs.existsSync(BUILD_DIR)) {
            // fs.rmSync(BUILD_DIR, { recursive: true, force: true });
            // Windows sometimes keeps files locked, so just try to overwrite or delete content?
            // Proper cleanup is safer
            try {
                fs.rmSync(BUILD_DIR, { recursive: true, force: true });
            } catch (e) {
                console.warn('Could not fully clean build dir, attempting to overwrite...');
            }
        }
        if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR, { recursive: true });

        // Copy API dist
        copyDir(path.join(API_DIR, 'dist'), path.join(BUILD_DIR, 'dist'));

        // Copy API package.json
        const apiPkg = JSON.parse(fs.readFileSync(path.join(API_DIR, 'package.json'), 'utf8'));

        // Adjust dependencies to point to local package copy
        apiPkg.dependencies['@evergreen/database'] = 'file:./packages/database';

        // Remove devDependencies and scripts to keep it clean
        delete apiPkg.devDependencies;
        delete apiPkg.scripts;

        fs.writeFileSync(path.join(BUILD_DIR, 'package.json'), JSON.stringify(apiPkg, null, 2));

        // Copy Database Package
        const dbDest = path.join(BUILD_DIR, 'packages/database');
        fs.mkdirSync(dbDest, { recursive: true });

        // Copy dist and package.json only
        copyDir(path.join(DB_PACKAGE_DIR, 'dist'), path.join(dbDest, 'dist'));
        fs.copyFileSync(path.join(DB_PACKAGE_DIR, 'package.json'), path.join(dbDest, 'package.json'));

        // Also copy prisma schema to package so client can find it if needed
        const prismaDest = path.join(dbDest, 'prisma');
        fs.mkdirSync(prismaDest, { recursive: true });
        fs.copyFileSync(path.join(DB_PACKAGE_DIR, 'prisma/schema.prisma'), path.join(prismaDest, 'schema.prisma'));

        // 5. Copy Prisma Resources to Root of Backend
        // This is crucial for generation
        const backendPrismaDir = path.join(BUILD_DIR, 'prisma');
        fs.mkdirSync(backendPrismaDir, { recursive: true });
        fs.copyFileSync(path.join(DB_PACKAGE_DIR, 'prisma/schema.prisma'), path.join(backendPrismaDir, 'schema.prisma'));

        // Copy dev.db as template if exists
        const devDbPath = path.join(DB_PACKAGE_DIR, 'prisma/dev.db');
        if (fs.existsSync(devDbPath)) {
            console.log('Copying dev.db to bundle...');
            fs.copyFileSync(devDbPath, path.join(backendPrismaDir, 'dev.db'));
        } else {
            console.log('No dev.db found. Creating empty db during first run might require migration deploy (packaged separately).');
        }

        // 6. Install Production Dependencies
        console.log('6. Installing Production Dependencies (this may take a moment)...');
        // We use --omit=dev to avoid huge devDeps
        // But we need prisma CLI to generate? No, prisma CLI is devDep usually.
        // If we want to run 'prisma generate', we need prisma CLI.
        // But generating locally uses global or local prisma.
        // We can use the root `npx prisma generate` pointing to the backend schema!
        // So install deps first.
        run('npm install --omit=dev --no-audit', BUILD_DIR);

        // 7. Generate Prisma Client for the bundle platform
        console.log('7. Generating Prisma Client for bundle...');
        // We run generate using root prisma but target the schema inside build dir
        // This ensures the artifacts are placed in node_modules/.prisma/client relative to the schema
        // which is inside BUILD_DIR
        run(`npx prisma generate --schema=${path.join(BUILD_DIR, 'prisma/schema.prisma')}`, ROOT_DIR);

        // 8. Package Electron App
        console.log('8. Packaging Electron App...');
        run('npm run dist', DESKTOP_DIR);

        console.log('--- Build Complete! Check apps/desktop/dist for the installer. ---');

    } catch (error) {
        console.error('Build Failed:', error);
        process.exit(1);
    }
}

main();
