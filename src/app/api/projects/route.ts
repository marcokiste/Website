import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const projectsDir = path.join(process.cwd(), 'public', 'images', 'projects');
    const projects = [];
    
    // Lade alle proX Ordner
    for (let i = 0; i <= 5; i++) {
      const proDir = path.join(projectsDir, `pro${i}`);
      
      if (fs.existsSync(proDir)) {
        const headerFile = path.join(proDir, `headerpro${i}.txt`);
        const textFile = path.join(proDir, `textpro${i}.txt`);
        
        let name = `Projekt ${i}`;
        let description = 'Beschreibung wird geladen...';
        
        // Lade Header
        if (fs.existsSync(headerFile)) {
          name = fs.readFileSync(headerFile, 'utf-8').trim();
        }
        
        // Lade Beschreibung
        if (fs.existsSync(textFile)) {
          description = fs.readFileSync(textFile, 'utf-8').trim();
        }
        
        // Lade alle Bilder aus dem Projektordner
        const images = [];
        const files = fs.readdirSync(proDir);
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.webm', '.ogg', '.mov'];
        
        files.forEach(file => {
          const ext = path.extname(file).toLowerCase();
          if (imageExtensions.includes(ext)) {
            images.push(`/images/projects/pro${i}/${file}`);
          }
        });
        
        // Fallback: Standard-Bild wenn keine Bilder gefunden wurden
        if (images.length === 0) {
          images.push('/images/projects/IMG_8903.jpg');
        }
        
        projects.push({
          name,
          description,
          images,
        });
      }
    }
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Fehler beim Laden der Projekte:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Projekte' }, { status: 500 });
  }
} 