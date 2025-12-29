import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface IconCloudProps {
  icons: string[];
}

interface IconPosition {
  name: string;
  x: number;
  y: number;
  z: number;
  scale: number;
}

const iconMap: Record<string, string> = {
  'React': 'https://cdn.simpleicons.org/react/61DAFB',
  'TypeScript': 'https://cdn.simpleicons.org/typescript/3178C6',
  'JavaScript': 'https://cdn.simpleicons.org/javascript/F7DF1E',
  'Node.js': 'https://cdn.simpleicons.org/nodedotjs/339933',
  'Python': 'https://cdn.simpleicons.org/python/3776AB',
  'AWS': 'https://cdn.simpleicons.org/amazonaws/FF9900',
  'Docker': 'https://cdn.simpleicons.org/docker/2496ED',
  'Git': 'https://cdn.simpleicons.org/git/F05032',
  'Vue': 'https://cdn.simpleicons.org/vuedotjs/4FC08D',
  'Angular': 'https://cdn.simpleicons.org/angular/DD0031',
  'Next.js': 'https://cdn.simpleicons.org/nextdotjs/fff',
  'Tailwind': 'https://cdn.simpleicons.org/tailwindcss/06B6D4',
  'MongoDB': 'https://cdn.simpleicons.org/mongodb/47A248',
  'PostgreSQL': 'https://cdn.simpleicons.org/postgresql/4169E1',
  'MySQL': 'https://cdn.simpleicons.org/mysql/4479A1',
  'Redis': 'https://cdn.simpleicons.org/redis/DC382D',
  'GraphQL': 'https://cdn.simpleicons.org/graphql/E10098',
  'Kubernetes': 'https://cdn.simpleicons.org/kubernetes/326CE5',
  'Linux': 'https://cdn.simpleicons.org/linux/FCC624',
  'Rust': 'https://cdn.simpleicons.org/rust/fff',
  'Go': 'https://cdn.simpleicons.org/go/00ADD8',
  'Java': 'https://cdn.simpleicons.org/openjdk/fff',
  'C++': 'https://cdn.simpleicons.org/cplusplus/00599C',
  'Swift': 'https://cdn.simpleicons.org/swift/F05138',
  'Kotlin': 'https://cdn.simpleicons.org/kotlin/7F52FF',
  'Flutter': 'https://cdn.simpleicons.org/flutter/02569B',
  'Firebase': 'https://cdn.simpleicons.org/firebase/FFCA28',
  'Figma': 'https://cdn.simpleicons.org/figma/F24E1E',
  'Vite': 'https://cdn.simpleicons.org/vite/646CFF',
  'Webpack': 'https://cdn.simpleicons.org/webpack/8DD6F9',
  'Jest': 'https://cdn.simpleicons.org/jest/C21325',
  'Power Automate': '/svgs/PowerAutomate_scalable.svg',
  'Power Apps': '/svgs/PowerApps_scalable.svg',
  'Power Pages': '/svgs/PowerPages_scalable.svg',
};

export function IconCloud({ icons }: IconCloudProps) {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 0.3);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const positions = useMemo(() => {
    const count = icons.length;
    const result: IconPosition[] = [];
    
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      result.push({
        name: icons[i],
        x: Math.cos(theta) * Math.sin(phi),
        y: Math.sin(theta) * Math.sin(phi),
        z: Math.cos(phi),
        scale: 1,
      });
    }
    return result;
  }, [icons]);

  const transformedPositions = useMemo(() => {
    const rad = (rotation * Math.PI) / 180;
    return positions.map((pos) => {
      const cosR = Math.cos(rad);
      const sinR = Math.sin(rad);
      const x = pos.x * cosR - pos.z * sinR;
      const z = pos.x * sinR + pos.z * cosR;
      const scale = (z + 2) / 3;
      const opacity = (z + 1.5) / 2.5;
      return {
        ...pos,
        screenX: x * 120,
        screenY: pos.y * 120,
        scale: Math.max(0.5, scale),
        opacity: Math.max(0.3, Math.min(1, opacity)),
        zIndex: Math.round((z + 1) * 50),
      };
    });
  }, [positions, rotation]);

  return (
    <div className="relative w-[300px] h-[300px] mx-auto">
      {transformedPositions.map((pos) => {
        const iconUrl = iconMap[pos.name] || `https://cdn.simpleicons.org/${pos.name.toLowerCase().replace(/[^a-z0-9]/g, '')}/fff`;
        return (
          <motion.div
            key={pos.name}
            className="absolute left-1/2 top-1/2 flex items-center justify-center"
            style={{
              transform: `translate(-50%, -50%) translate(${pos.screenX}px, ${pos.screenY}px) scale(${pos.scale})`,
              opacity: pos.opacity,
              zIndex: pos.zIndex,
            }}
            title={pos.name}
          >
            <img
              src={iconUrl}
              alt={pos.name}
              className="w-10 h-10 object-contain drop-shadow-lg"
              loading="lazy"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
