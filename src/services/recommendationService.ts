export interface RecommendationItem {
  id: string;
  type: 'topic' | 'marketplace';
  title: string;
  description: string;
  category: string;
  matchScore: number; // e.g. 98 for 98%
  tags: string[];
  image: string;
  author?: string;
  membersCount?: string;
  price?: string;
  rating?: number;
  link: string;
  badge?: string;
}

const MOCK_TOPICS: RecommendationItem[] = [
  {
    id: 'topic-1',
    type: 'topic',
    title: 'Redes Neurales Cuánticas & Optimización de Cómputo',
    description: 'Debate de la comunidad sobre la aceleración de modelos IA con chips fotónicos y cifrado homomórfico.',
    category: 'Abstract Quantum Architecture',
    matchScore: 98,
    tags: ['Abstract Quantum Architecture', 'AI Hardware', 'Neural Net'],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    author: '@matrix_dev',
    membersCount: '4.2k Miembros',
    link: '/social',
    badge: 'TEMA TENDENCIA'
  },
  {
    id: 'topic-2',
    type: 'topic',
    title: 'Arquitectura Neon Metropolis & Fotografía Cyberpunk',
    description: 'Explora galerías de estética urbana futurista, luces de neón y diseño cibernético vanguardista.',
    category: 'Cyberpunk Neon City',
    matchScore: 95,
    tags: ['Cyberpunk Neon City', 'Digital Holographic Aura'],
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=80&w=800',
    author: '@cyber_city',
    membersCount: '8.9k Miembros',
    link: '/social',
    badge: 'POPULAR'
  },
  {
    id: 'topic-3',
    type: 'topic',
    title: 'Laboratorio de Sonido Synthwave & Módulos Analógicos',
    description: 'Intercambio de parches de sintetizador, loops de audio binaural y paisajes sonoros retro-futuristas.',
    category: 'Futuristic Synthwave',
    matchScore: 92,
    tags: ['Futuristic Synthwave', 'Audio FX', 'Synth'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
    author: '@synth_master',
    membersCount: '3.1k Miembros',
    link: '/social'
  },
  {
    id: 'topic-4',
    type: 'topic',
    title: 'Investigación Espacial Profunda & Telemetría Orbital',
    description: 'Monitoreo en tiempo real de satélites, imágenes de nebulosas lejanas y teoría astrofísica cuántica.',
    category: 'Deep Space Nebula',
    matchScore: 90,
    tags: ['Deep Space Nebula', 'Minimalist Zen Garden'],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    author: '@orion_space',
    membersCount: '5.6k Miembros',
    link: '/social'
  },
  {
    id: 'topic-5',
    type: 'topic',
    title: 'Protocolos de Identidad Cero Conocimiento (ZKP)',
    description: 'Debate de seguridad cibernética sobre la protección de datos personales mediante criptografía avanzada.',
    category: 'Digital Holographic Aura',
    matchScore: 89,
    tags: ['Digital Holographic Aura', 'Security'],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    author: '@crypto_ghost',
    membersCount: '2.8k Miembros',
    link: '/social'
  }
];

const MOCK_MARKETPLACE: RecommendationItem[] = [
  {
    id: 'market-1',
    type: 'marketplace',
    title: 'Co-Procesador Cuántico Neural v9.4',
    description: 'Módulo de hardware acelerador con interfaz táctil holográfica y baja latencia de respuesta.',
    category: 'Abstract Quantum Architecture',
    matchScore: 97,
    tags: ['Abstract Quantum Architecture', 'Hardware'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
    price: '450 ELITE',
    rating: 4.9,
    link: '/marketplace',
    badge: 'OFERTA DESTACADA'
  },
  {
    id: 'market-2',
    type: 'marketplace',
    title: 'Visor Cibernético HUD Holográfico Gen-4',
    description: 'Gafas de realidad aumentada con superposición de datos biométricos en tiempo real y diseño neón.',
    category: 'Cyberpunk Neon City',
    matchScore: 94,
    tags: ['Cyberpunk Neon City', 'Digital Holographic Aura'],
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=800',
    price: '280 ELITE',
    rating: 4.8,
    link: '/marketplace'
  },
  {
    id: 'market-3',
    type: 'marketplace',
    title: 'Módulo de Proyección de Nebulosa Holográfica',
    description: 'Proyector ambiental para salas zen con simulación de auroras espaciales y relajación binaural.',
    category: 'Deep Space Nebula',
    matchScore: 91,
    tags: ['Deep Space Nebula', 'Minimalist Zen Garden'],
    image: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&q=80&w=800',
    price: '190 ELITE',
    rating: 4.7,
    link: '/marketplace'
  },
  {
    id: 'market-4',
    type: 'marketplace',
    title: 'Paquete Master Synthwave Audio FX & Samples',
    description: 'Más de 2,000 muestras de sintetizadores analógicos, sintetizadores de voz y efectos cinematográficos.',
    category: 'Futuristic Synthwave',
    matchScore: 93,
    tags: ['Futuristic Synthwave', 'Audio'],
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
    price: '120 ELITE',
    rating: 5.0,
    link: '/marketplace',
    badge: 'BEST SELLER'
  },
  {
    id: 'market-5',
    type: 'marketplace',
    title: 'Llave de Cifrado Biométrico CyberKey',
    description: 'Dispositivo físico de seguridad con escáner huella holográfico para firmas digitales en la red.',
    category: 'Digital Holographic Aura',
    matchScore: 88,
    tags: ['Digital Holographic Aura', 'Security'],
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
    price: '310 ELITE',
    rating: 4.9,
    link: '/marketplace'
  }
];

export const ALL_INTEREST_OPTIONS = [
  "Cyberpunk Neon City",
  "Minimalist Zen Garden",
  "Deep Space Nebula",
  "Futuristic Synthwave",
  "Abstract Quantum Architecture",
  "Digital Holographic Aura"
];

/**
 * Mock data fetching service to retrieve personalized recommendations based on profile interests.
 */
export async function fetchTailoredRecommendations(
  userInterests: string[] = [],
  filterType: 'all' | 'topic' | 'marketplace' = 'all'
): Promise<RecommendationItem[]> {
  // Simulate network API request latency
  await new Promise((resolve) => setTimeout(resolve, 450));

  const allItems = [...MOCK_TOPICS, ...MOCK_MARKETPLACE];

  // Calculate dynamic match scores based on user interests
  const scoredItems = allItems.map((item) => {
    let baseScore = item.matchScore;

    if (userInterests.length > 0) {
      const matchesCategory = userInterests.includes(item.category);
      const tagMatches = item.tags.filter((tag) => userInterests.includes(tag)).length;

      if (matchesCategory) {
        baseScore = Math.min(99, baseScore + 5);
      } else if (tagMatches > 0) {
        baseScore = Math.min(98, baseScore + 2);
      } else {
        baseScore = Math.max(65, baseScore - 15);
      }
    }

    return {
      ...item,
      matchScore: baseScore
    };
  });

  // Filter by category type if selected
  let filtered = scoredItems;
  if (filterType === 'topic') {
    filtered = scoredItems.filter((i) => i.type === 'topic');
  } else if (filterType === 'marketplace') {
    filtered = scoredItems.filter((i) => i.type === 'marketplace');
  }

  // Sort by highest match score
  return filtered.sort((a, b) => b.matchScore - a.matchScore);
}
