export const locales = ['en', 'pt-BR', 'es'] as const;

export type PublicLocale = (typeof locales)[number];

export type PublicPageSlug =
  | 'features'
  | 'how-it-works'
  | 'faq'
  | 'contact'
  | 'terms'
  | 'privacy'
  | 'cookies';

export const publicPageSlugs: readonly PublicPageSlug[] = [
  'features',
  'how-it-works',
  'faq',
  'contact',
  'terms',
  'privacy',
  'cookies',
];

const isLocale = (value: string): value is PublicLocale =>
  locales.some((locale) => locale === value);

export function isPublicLocale(value: unknown): value is PublicLocale {
  return typeof value === 'string' && isLocale(value);
}

export type PublicMetadataPage = 'home' | PublicPageSlug;

export type PublicDictionary = {
  locale: PublicLocale;
  shell: {
    nav: {
      home: string;
      features: string;
      howItWorks: string;
      faq: string;
      contact: string;
      signIn: string;
      skipToContent: string;
      menu: string;
      closeMenu: string;
    };
    theme: {
      switchToLight: string;
      switchToDark: string;
    };
    locale: {
      label: string;
      names: Record<PublicLocale, string>;
    };
    footer: {
      tagline: string;
      navigationTitle: string;
      legalTitle: string;
      contactTitle: string;
      contactNote: string;
      statusLabel: string;
      statusBody: string;
      copyright: string;
    };
  };
  metadata: Record<PublicMetadataPage, { title: string; description: string }>;
  home: {
    hero: {
      eyebrow: string;
      title: string;
      description: string;
      primaryCta: string;
      secondaryCta: string;
      image: string;
      imageAlt: string;
    };
    trust: {
      title: string;
      description: string;
      principles: Array<{ title: string; body: string }>;
    };
    categories: {
      title: string;
      description: string;
      plannedLabel: string;
      items: Record<
        'characters' | 'sprites' | 'mobs' | 'items' | 'maps' | 'uiHud',
        {
          title: string;
          description: string;
          status: 'planned';
          statusLabel: string;
          image: string;
          alt: string;
        }
      >;
    };
    workflow: {
      title: string;
      description: string;
      plannedLabel: string;
      steps: Array<{ title: string; body: string }>;
    };
    status: {
      label: string;
      title: string;
      currentBody: string;
      plannedTitle: string;
      plannedBody: string;
      plannedItems: Array<{ title: string; body: string }>;
    };
    faq: {
      title: string;
      description: string;
      items: Array<{ question: string; answer: string }>;
    };
    cta: {
      title: string;
      body: string;
      primaryCta: string;
      secondaryCta: string;
    };
  };
  pages: {
    features: {
      eyebrow: string;
      title: string;
      intro: string;
      currentTitle: string;
      currentBody: string;
      plannedLabel: string;
      sections: Array<{ title: string; body: string }>;
    };
    howItWorks: {
      eyebrow: string;
      title: string;
      intro: string;
      plannedLabel: string;
      steps: Array<{ title: string; body: string }>;
      statusNote: string;
    };
    faq: {
      eyebrow: string;
      title: string;
      intro: string;
      items: Array<{ question: string; answer: string }>;
    };
    contact: {
      eyebrow: string;
      title: string;
      intro: string;
      noteTitle: string;
      noteBody: string;
    };
    legal: Record<
      'terms' | 'privacy' | 'cookies',
      {
        title: string;
        draftNotice: string;
        intro: string;
        sections: Array<{ title: string; body: string }>;
      }
    >;
  };
};

const localizedTextMarker: unique symbol = Symbol('localizedText');

type LocalizedText = {
  readonly [localizedTextMarker]: true;
  readonly values: Readonly<Record<PublicLocale, string>>;
};

const localizedText = (values: Readonly<Record<PublicLocale, string>>): LocalizedText => ({
  [localizedTextMarker]: true,
  values,
});

type LocalizedContentSchema<T> = T extends string
  ? T | LocalizedText
  : T extends readonly (infer Item)[]
    ? readonly LocalizedContentSchema<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: LocalizedContentSchema<T[Key]> }
      : T;

type ResolvedContent<T> = T extends LocalizedText
  ? string
  : T extends readonly (infer Item)[]
    ? ResolvedContent<Item>[]
    : T extends object
      ? { [Key in keyof T]: ResolvedContent<T[Key]> }
      : T;

function isLocalizedText(value: unknown): value is LocalizedText {
  return typeof value === 'object' && value !== null && localizedTextMarker in value;
}

function resolveContent<T>(value: T, locale: PublicLocale): ResolvedContent<T> {
  if (isLocalizedText(value)) return value.values[locale] as ResolvedContent<T>;
  if (Array.isArray(value))
    return value.map((item) => resolveContent(item, locale)) as ResolvedContent<T>;
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveContent(item, locale)]),
    ) as ResolvedContent<T>;
  }
  return value as ResolvedContent<T>;
}

// One semantic content schema stores each translation together and materializes the existing dictionary API.
const publicCopy = {
  shellNavHome: localizedText({
    en: 'Home',
    'pt-BR': 'Início',
    es: 'Inicio',
  }),
  shellNavFeatures: localizedText({
    en: 'Features',
    'pt-BR': 'Recursos',
    es: 'Funciones',
  }),
  shellNavHowItWorks: localizedText({
    en: 'How it works',
    'pt-BR': 'Como funciona',
    es: 'Cómo funciona',
  }),
  shellNavFaq: localizedText({
    en: 'FAQ',
    'pt-BR': 'Perguntas frequentes',
    es: 'Preguntas frecuentes',
  }),
  shellNavContact: localizedText({
    en: 'Contact',
    'pt-BR': 'Contato',
    es: 'Contacto',
  }),
  shellNavSignIn: localizedText({
    en: 'Sign in',
    'pt-BR': 'Entrar',
    es: 'Iniciar sesión',
  }),
  shellNavSkipToContent: localizedText({
    en: 'Skip to main content',
    'pt-BR': 'Pular para o conteúdo principal',
    es: 'Saltar al contenido principal',
  }),
  shellNavMenu: localizedText({
    en: 'Open menu',
    'pt-BR': 'Abrir menu',
    es: 'Abrir menú',
  }),
  shellNavCloseMenu: localizedText({
    en: 'Close menu',
    'pt-BR': 'Fechar menu',
    es: 'Cerrar menú',
  }),
  shellThemeSwitchToLight: localizedText({
    en: 'Switch to light theme',
    'pt-BR': 'Mudar para o tema claro',
    es: 'Cambiar al tema claro',
  }),
  shellThemeSwitchToDark: localizedText({
    en: 'Switch to dark theme',
    'pt-BR': 'Mudar para o tema escuro',
    es: 'Cambiar al tema oscuro',
  }),
  shellLocaleLabel: localizedText({
    en: 'Language',
    'pt-BR': 'Idioma',
    es: 'Idioma',
  }),
  shellFooterTagline: localizedText({
    en: 'A focused workspace for organizing game asset projects.',
    'pt-BR': 'Um espaço de trabalho focado em organizar projetos de recursos para jogos.',
    es: 'Un espacio de trabajo dedicado a organizar proyectos de recursos para videojuegos.',
  }),
  shellFooterNavigationTitle: localizedText({
    en: 'Explore',
    'pt-BR': 'Explore',
    es: 'Explorar',
  }),
  shellFooterLegalTitle: localizedText({
    en: 'Legal',
    'pt-BR': 'Informações legais',
    es: 'Legal',
  }),
  shellFooterContactTitle: localizedText({
    en: 'Contact',
    'pt-BR': 'Contato',
    es: 'Contacto',
  }),
  shellFooterContactNote: localizedText({
    en: 'Verified contact details will be published here when available.',
    'pt-BR': 'Os dados de contato verificados serão publicados aqui quando estiverem disponíveis.',
    es: 'Los datos de contacto verificados se publicarán aquí cuando estén disponibles.',
  }),
  shellFooterStatusLabel: localizedText({
    en: 'Product status',
    'pt-BR': 'Status do produto',
    es: 'Estado del producto',
  }),
  shellFooterStatusBody: localizedText({
    en: 'The project workspace foundation is available. Asset contracts, durable jobs, generation, and export are planned.',
    'pt-BR':
      'A base do espaço de trabalho de projetos está disponível. Contratos de recursos, tarefas duráveis, geração e exportação estão planejados.',
    es: 'La base del espacio de trabajo de proyectos está disponible. Los contratos de recursos, las tareas duraderas, la generación y la exportación están planificados.',
  }),
  metadataHomeTitle: localizedText({
    en: 'Spryxel — Plan game asset projects',
    'pt-BR': 'Spryxel — Planeje projetos de recursos para jogos',
    es: 'Spryxel — Planifica proyectos de recursos para videojuegos',
  }),
  metadataHomeDescription: localizedText({
    en: 'Explore Spryxel, a focused workspace foundation for organizing game asset projects and a clearly planned path for future tools.',
    'pt-BR':
      'Conheça o Spryxel, uma base de espaço de trabalho focada em organizar projetos de recursos para jogos, com ferramentas futuras claramente planejadas.',
    es: 'Descubre Spryxel, una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos, con herramientas futuras claramente planificadas.',
  }),
  metadataFeaturesTitle: localizedText({
    en: 'Features — Spryxel',
    'pt-BR': 'Recursos — Spryxel',
    es: 'Funciones — Spryxel',
  }),
  metadataFeaturesDescription: localizedText({
    en: 'See what the Spryxel project workspace supports today and which game asset tools remain planned.',
    'pt-BR':
      'Veja o que a base de espaço de trabalho do Spryxel oferece hoje e quais ferramentas para recursos de jogos ainda estão planejadas.',
    es: 'Consulta qué ofrece hoy la base del espacio de trabajo de Spryxel y qué herramientas para recursos de videojuegos siguen planificadas.',
  }),
  metadataHowItWorksTitle: localizedText({
    en: 'How it works — Spryxel',
    'pt-BR': 'Como funciona — Spryxel',
    es: 'Cómo funciona — Spryxel',
  }),
  metadataHowItWorksDescription: localizedText({
    en: 'Learn about the planned Spryxel workflow for organizing game asset projects, from project setup to future exports.',
    'pt-BR':
      'Conheça o fluxo planejado do Spryxel para organizar projetos de recursos para jogos, da configuração do projeto às futuras exportações.',
    es: 'Conoce el flujo planificado de Spryxel para organizar proyectos de recursos para videojuegos, desde la configuración del proyecto hasta futuras exportaciones.',
  }),
  metadataFaqTitle: localizedText({
    en: 'FAQ — Spryxel',
    'pt-BR': 'Perguntas frequentes — Spryxel',
    es: 'Preguntas frecuentes — Spryxel',
  }),
  metadataFaqDescription: localizedText({
    en: 'Answers about the Spryxel project workspace, planned capabilities, and current product status.',
    'pt-BR':
      'Respostas sobre o espaço de trabalho de projetos do Spryxel, os recursos planejados e o status atual do produto.',
    es: 'Respuestas sobre el espacio de trabajo de proyectos de Spryxel, las funciones planificadas y el estado actual del producto.',
  }),
  metadataContactTitle: localizedText({
    en: 'Contact — Spryxel',
    'pt-BR': 'Contato — Spryxel',
    es: 'Contacto — Spryxel',
  }),
  metadataContactDescription: localizedText({
    en: 'Find the current contact status for Spryxel. Verified support details will be published when available.',
    'pt-BR':
      'Consulte o status atual dos contatos do Spryxel. Os dados de suporte verificados serão publicados quando estiverem disponíveis.',
    es: 'Consulta el estado actual del contacto con Spryxel. Los datos de soporte verificados se publicarán cuando estén disponibles.',
  }),
  metadataTermsTitle: localizedText({
    en: 'Terms outline — Spryxel',
    'pt-BR': 'Rascunho dos termos — Spryxel',
    es: 'Borrador de condiciones — Spryxel',
  }),
  metadataTermsDescription: localizedText({
    en: 'A draft outline for future Spryxel terms, pending legal review and verified product details.',
    'pt-BR':
      'Estrutura preliminar dos futuros termos do Spryxel, sujeita à revisão jurídica e à confirmação dos detalhes do produto.',
    es: 'Esquema preliminar de las futuras condiciones de Spryxel, pendiente de revisión legal y de verificar los detalles del producto.',
  }),
  metadataPrivacyTitle: localizedText({
    en: 'Privacy outline — Spryxel',
    'pt-BR': 'Rascunho de privacidade — Spryxel',
    es: 'Borrador de privacidad — Spryxel',
  }),
  metadataPrivacyDescription: localizedText({
    en: 'A draft privacy notice outline that requires review against confirmed Spryxel data practices.',
    'pt-BR':
      'Estrutura preliminar do aviso de privacidade, que precisa ser revisada conforme as práticas de dados confirmadas do Spryxel.',
    es: 'Esquema preliminar del aviso de privacidad, que debe revisarse según las prácticas de datos confirmadas de Spryxel.',
  }),
  metadataCookiesTitle: localizedText({
    en: 'Cookie notice outline — Spryxel',
    'pt-BR': 'Rascunho de cookies — Spryxel',
    es: 'Borrador de cookies — Spryxel',
  }),
  metadataCookiesDescription: localizedText({
    en: 'A draft cookie notice outline pending a technical audit and legal review.',
    'pt-BR':
      'Estrutura preliminar do aviso de cookies, sujeita a auditoria técnica e revisão jurídica.',
    es: 'Esquema preliminar del aviso de cookies, pendiente de una auditoría técnica y revisión legal.',
  }),
  homeHeroEyebrow: localizedText({
    en: 'A foundation for game asset projects',
    'pt-BR': 'Uma base para projetos de recursos de jogos',
    es: 'Una base para proyectos de recursos de videojuegos',
  }),
  homeHeroTitle: localizedText({
    en: 'A clearer home for game asset projects.',
    'pt-BR': 'Um espaço claro para projetos de recursos de jogos.',
    es: 'Un espacio claro para proyectos de recursos de videojuegos.',
  }),
  homeHeroDescription: localizedText({
    en: 'Spryxel is building a focused workspace for organizing game asset projects. The project workspace foundation is available; asset definitions, durable processing, generation, and export are still planned.',
    'pt-BR':
      'O Spryxel está criando um espaço de trabalho focado em organizar projetos de recursos para jogos. A base do espaço de trabalho de projetos está disponível; definições de recursos, processamento durável, geração e exportação ainda estão planejados.',
    es: 'Spryxel está creando un espacio de trabajo dedicado a organizar proyectos de recursos para videojuegos. La base del espacio de trabajo de proyectos está disponible; las definiciones de recursos, el procesamiento duradero, la generación y la exportación siguen planificados.',
  }),
  homeHeroPrimaryCta: localizedText({
    en: 'Explore the features',
    'pt-BR': 'Explore os recursos',
    es: 'Explorar las funciones',
  }),
  homeHeroSecondaryCta: localizedText({
    en: 'See the planned workflow',
    'pt-BR': 'Veja o fluxo planejado',
    es: 'Ver el flujo planificado',
  }),
  homeHeroImageAlt: localizedText({
    en: 'Fantasy game art with a fox spirit on a forest island and a hooded traveler against a plum backdrop.',
    'pt-BR':
      'Arte de fantasia com um espírito de raposa em uma ilha florestal e uma viajante encapuzada sobre um fundo ameixa.',
    es: 'Arte de fantasía con un espíritu de zorro en una isla boscosa y una viajera encapuchada sobre un fondo ciruela.',
  }),
  homeTrustTitle: localizedText({
    en: 'A clear foundation, with room to grow',
    'pt-BR': 'Uma base clara, pronta para crescer',
    es: 'Una base clara, lista para crecer',
  }),
  homeTrustDescription: localizedText({
    en: 'Spryxel is being built around useful project organization and a straightforward account of what is ready and what is still ahead.',
    'pt-BR':
      'O Spryxel está sendo desenvolvido com foco na organização útil de projetos e em uma descrição direta do que está pronto e do que ainda vem pela frente.',
    es: 'Spryxel se está desarrollando para organizar proyectos de forma útil y explicar claramente qué está listo y qué queda por hacer.',
  }),
  homeTrustPrinciplesItem1Title: localizedText({
    en: 'Project workspace first',
    'pt-BR': 'Primeiro, o espaço de trabalho',
    es: 'Primero, el espacio de trabajo',
  }),
  homeTrustPrinciplesItem1Body: localizedText({
    en: 'The current foundation is a workspace for creating and organizing projects.',
    'pt-BR': 'A base atual é um espaço de trabalho para criar e organizar projetos.',
    es: 'La base actual es un espacio de trabajo para crear y organizar proyectos.',
  }),
  homeTrustPrinciplesItem2Title: localizedText({
    en: 'Clear product status',
    'pt-BR': 'Status claro do produto',
    es: 'Estado claro del producto',
  }),
  homeTrustPrinciplesItem2Body: localizedText({
    en: 'Planned tools are identified as planned, including asset contracts, durable jobs, generation, and export.',
    'pt-BR':
      'As ferramentas planejadas são identificadas como planejadas, incluindo contratos de recursos, tarefas duráveis, geração e exportação.',
    es: 'Las herramientas planificadas se identifican como tales, incluidos los contratos de recursos, las tareas duraderas, la generación y la exportación.',
  }),
  homeTrustPrinciplesItem3Title: localizedText({
    en: 'Game asset focus',
    'pt-BR': 'Foco em recursos para jogos',
    es: 'Enfoque en recursos de videojuegos',
  }),
  homeTrustPrinciplesItem3Body: localizedText({
    en: 'The planned categories cover characters, sprites, mobs, items, maps, and interface art.',
    'pt-BR':
      'As categorias planejadas abrangem personagens, sprites, mobs, itens, mapas e arte de interface.',
    es: 'Las categorías planificadas abarcan personajes, sprites, mobs, objetos, mapas y arte de interfaz.',
  }),
  homeCategoriesTitle: localizedText({
    en: 'Game asset categories on the roadmap',
    'pt-BR': 'Categorias de recursos para jogos no roteiro',
    es: 'Categorías de recursos de videojuegos en la hoja de ruta',
  }),
  homeCategoriesDescription: localizedText({
    en: 'These categories describe the intended scope. Every category is planned and is not yet an available generation or export tool.',
    'pt-BR':
      'Estas categorias descrevem o escopo pretendido. Todas estão planejadas e ainda não são ferramentas disponíveis de geração ou exportação.',
    es: 'Estas categorías describen el alcance previsto. Todas están planificadas y todavía no son herramientas disponibles de generación o exportación.',
  }),
  homeCategoriesPlannedLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsCharactersTitle: localizedText({
    en: 'Characters',
    'pt-BR': 'Personagens',
    es: 'Personajes',
  }),
  homeCategoriesItemsCharactersDescription: localizedText({
    en: 'Character concepts, looks, and variations for a game project.',
    'pt-BR': 'Conceitos, visuais e variações de personagens para um projeto de jogo.',
    es: 'Conceptos, apariencias y variaciones de personajes para un proyecto de videojuego.',
  }),
  homeCategoriesItemsCharactersStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsCharactersAlt: localizedText({
    en: 'Hooded fox adventurer holding a teal lantern in a moonlit forest.',
    'pt-BR': 'Aventureira raposa encapuzada com uma lanterna turquesa em uma floresta ao luar.',
    es: 'Aventurera zorro encapuchada con una linterna turquesa en un bosque bajo la luna.',
  }),
  homeCategoriesItemsSpritesDescription: localizedText({
    en: 'Sprite artwork and animation sets for future project workflows.',
    'pt-BR': 'Arte de sprites e conjuntos de animação para futuros fluxos de projeto.',
    es: 'Arte de sprites y conjuntos de animación para futuros flujos de proyectos.',
  }),
  homeCategoriesItemsSpritesStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsSpritesAlt: localizedText({
    en: 'Illustration of a pixel art sprite sheet.',
    'pt-BR': 'Ilustração de uma folha de sprites em pixel art.',
    es: 'Ilustración de una hoja de sprites en pixel art.',
  }),
  homeCategoriesItemsMobsDescription: localizedText({
    en: 'Enemy and creature concepts organized around a game world.',
    'pt-BR': 'Conceitos de inimigos e criaturas organizados em torno de um mundo de jogo.',
    es: 'Conceptos de enemigos y criaturas organizados en torno a un mundo de juego.',
  }),
  homeCategoriesItemsMobsStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsMobsAlt: localizedText({
    en: 'Moss-covered forest guardian with glowing antlers beside a waterfall.',
    'pt-BR':
      'Guardião da floresta coberto de musgo, com galhadas brilhantes ao lado de uma cachoeira.',
    es: 'Guardián del bosque cubierto de musgo, con astas brillantes junto a una cascada.',
  }),
  homeCategoriesItemsItemsTitle: localizedText({
    en: 'Items',
    'pt-BR': 'Itens',
    es: 'Objetos',
  }),
  homeCategoriesItemsItemsDescription: localizedText({
    en: 'Equipment, collectibles, and other in-game object concepts.',
    'pt-BR': 'Equipamentos, colecionáveis e outros conceitos de objetos do jogo.',
    es: 'Equipo, coleccionables y otros conceptos de objetos del juego.',
  }),
  homeCategoriesItemsItemsStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsItemsAlt: localizedText({
    en: 'Glowing crystal, violet potion, ornate key, and a small moonlit charm.',
    'pt-BR': 'Cristal brilhante, poção violeta, chave ornamentada e um pequeno amuleto lunar.',
    es: 'Cristal luminoso, poción violeta, llave ornamentada y un pequeño amuleto lunar.',
  }),
  homeCategoriesItemsMapsTitle: localizedText({
    en: 'Maps',
    'pt-BR': 'Mapas',
    es: 'Mapas',
  }),
  homeCategoriesItemsMapsDescription: localizedText({
    en: 'World, level, and location art planned for project workflows.',
    'pt-BR': 'Arte de mundos, fases e locais planejada para futuros fluxos de projeto.',
    es: 'Arte de mundos, niveles y lugares planificado para futuros flujos de proyectos.',
  }),
  homeCategoriesItemsMapsStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsMapsAlt: localizedText({
    en: 'Floating forest island with ancient ruins, winding paths, and waterfalls.',
    'pt-BR': 'Ilha florestal flutuante com ruínas antigas, caminhos sinuosos e cachoeiras.',
    es: 'Isla boscosa flotante con ruinas antiguas, caminos sinuosos y cascadas.',
  }),
  homeCategoriesItemsUiHudTitle: localizedText({
    en: 'UI & HUD',
    'pt-BR': 'UI e HUD',
    es: 'UI y HUD',
  }),
  homeCategoriesItemsUiHudDescription: localizedText({
    en: 'User interface and heads-up display artwork for games.',
    'pt-BR': 'Arte de interface do usuário e de heads-up display para jogos.',
    es: 'Arte de interfaz de usuario y pantalla de juego para videojuegos.',
  }),
  homeCategoriesItemsUiHudStatusLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  homeCategoriesItemsUiHudAlt: localizedText({
    en: 'Fantasy HUD concepts with an ornate compass, heart crystals, an empty meter, and framed slots.',
    'pt-BR':
      'Conceitos de HUD de fantasia com bússola ornamentada, cristais em forma de coração, medidor vazio e espaços emoldurados.',
    es: 'Conceptos de HUD fantástico con brújula ornamentada, cristales de corazón, medidor vacío y espacios enmarcados.',
  }),
  homeWorkflowTitle: localizedText({
    en: 'A workflow taking shape',
    'pt-BR': 'Um fluxo em desenvolvimento',
    es: 'Un flujo en desarrollo',
  }),
  homeWorkflowDescription: localizedText({
    en: 'The following steps describe the planned direction. Only the project workspace foundation is available today.',
    'pt-BR':
      'As etapas a seguir descrevem a direção planejada. Hoje, apenas a base do espaço de trabalho de projetos está disponível.',
    es: 'Los siguientes pasos describen la dirección planificada. Hoy solo está disponible la base del espacio de trabajo de proyectos.',
  }),
  homeWorkflowPlannedLabel: localizedText({
    en: 'Planned workflow',
    'pt-BR': 'Fluxo planejado',
    es: 'Flujo planificado',
  }),
  homeWorkflowStepsItem1Title: localizedText({
    en: 'Organize a project',
    'pt-BR': 'Organize um projeto',
    es: 'Organizar un proyecto',
  }),
  homeWorkflowStepsItem1Body: localizedText({
    en: 'Start from a project workspace to keep a game effort in one place.',
    'pt-BR':
      'Comece em um espaço de trabalho de projeto para manter um esforço de jogo em um só lugar.',
    es: 'Empezar desde un espacio de trabajo de proyecto para mantener un proyecto de videojuego en un solo lugar.',
  }),
  homeWorkflowStepsItem2Title: localizedText({
    en: 'Define the assets',
    'pt-BR': 'Defina os recursos',
    es: 'Definir los recursos',
  }),
  homeWorkflowStepsItem2Body: localizedText({
    en: 'Planned asset contracts will make each asset brief and its requirements explicit.',
    'pt-BR':
      'Contratos de recursos planejados tornarão explícitos o briefing e os requisitos de cada recurso.',
    es: 'Los contratos de recursos planificados harán explícitos el resumen y los requisitos de cada recurso.',
  }),
  homeWorkflowStepsItem3Title: localizedText({
    en: 'Run durable jobs',
    'pt-BR': 'Execute tarefas duráveis',
    es: 'Ejecutar tareas duraderas',
  }),
  homeWorkflowStepsItem3Body: localizedText({
    en: 'Durable processing jobs are planned to track work as it moves through a workflow.',
    'pt-BR':
      'Tarefas de processamento duráveis estão planejadas para acompanhar o trabalho ao longo do fluxo.',
    es: 'Se planifican tareas de procesamiento duraderas para seguir el trabajo a lo largo del flujo.',
  }),
  homeWorkflowStepsItem4Title: localizedText({
    en: 'Generate and export',
    'pt-BR': 'Gere e exporte',
    es: 'Generar y exportar',
  }),
  homeWorkflowStepsItem4Body: localizedText({
    en: 'Generation and export are planned capabilities and are not available yet.',
    'pt-BR': 'Geração e exportação são recursos planejados e ainda não estão disponíveis.',
    es: 'La generación y la exportación son funciones planificadas y aún no están disponibles.',
  }),
  homeStatusLabel: localizedText({
    en: 'Current status',
    'pt-BR': 'Status atual',
    es: 'Estado actual',
  }),
  homeStatusTitle: localizedText({
    en: 'The project workspace foundation is available.',
    'pt-BR': 'A base do espaço de trabalho de projetos está disponível.',
    es: 'La base del espacio de trabajo de proyectos está disponible.',
  }),
  homeStatusCurrentBody: localizedText({
    en: 'Spryxel currently provides a foundation for project workspaces. This does not include asset generation or export.',
    'pt-BR':
      'Atualmente, o Spryxel oferece uma base para espaços de trabalho de projetos. Isso não inclui geração ou exportação de recursos.',
    es: 'Actualmente, Spryxel ofrece una base para espacios de trabajo de proyectos. Esto no incluye la generación ni la exportación de recursos.',
  }),
  homeStatusPlannedTitle: localizedText({
    en: 'More asset tools are planned',
    'pt-BR': 'Mais ferramentas para recursos estão planejadas',
    es: 'Hay más herramientas para recursos planificadas',
  }),
  homeStatusPlannedBody: localizedText({
    en: 'The roadmap includes asset contracts and durable jobs, followed by generation and export. These capabilities are not available yet.',
    'pt-BR':
      'O roteiro inclui contratos de recursos e tarefas duráveis, seguidos por geração e exportação. Esses recursos ainda não estão disponíveis.',
    es: 'La hoja de ruta incluye contratos de recursos y tareas duraderas, seguidos de generación y exportación. Estas funciones aún no están disponibles.',
  }),
  homeStatusPlannedItemsItem1Title: localizedText({
    en: 'Asset contracts',
    'pt-BR': 'Contratos de recursos',
    es: 'Contratos de recursos',
  }),
  homeStatusPlannedItemsItem1Body: localizedText({
    en: 'Planned structured definitions for asset briefs and requirements.',
    'pt-BR': 'Definições estruturadas planejadas para briefings e requisitos de recursos.',
    es: 'Definiciones estructuradas planificadas para resúmenes y requisitos de recursos.',
  }),
  homeStatusPlannedItemsItem2Title: localizedText({
    en: 'Durable jobs',
    'pt-BR': 'Tarefas duráveis',
    es: 'Tareas duraderas',
  }),
  homeStatusPlannedItemsItem2Body: localizedText({
    en: 'Planned processing that can track asset work across steps.',
    'pt-BR': 'Processamento planejado para acompanhar o trabalho de recursos em várias etapas.',
    es: 'Procesamiento planificado para seguir el trabajo de recursos a través de varios pasos.',
  }),
  homeStatusPlannedItemsItem3Title: localizedText({
    en: 'Generation and export',
    'pt-BR': 'Geração e exportação',
    es: 'Generación y exportación',
  }),
  homeStatusPlannedItemsItem3Body: localizedText({
    en: 'Planned outputs; generation and export are not available today.',
    'pt-BR': 'Resultados planejados; geração e exportação não estão disponíveis hoje.',
    es: 'Resultados planificados; la generación y la exportación no están disponibles hoy.',
  }),
  homeFaqTitle: localizedText({
    en: 'Common questions',
    'pt-BR': 'Perguntas comuns',
    es: 'Preguntas habituales',
  }),
  homeFaqDescription: localizedText({
    en: 'A quick guide to the product foundation and its planned direction.',
    'pt-BR': 'Um guia rápido sobre a base do produto e sua direção planejada.',
    es: 'Una guía rápida sobre la base del producto y su dirección planificada.',
  }),
  homeFaqItemsItem1Question: localizedText({
    en: 'What is Spryxel?',
    'pt-BR': 'O que é o Spryxel?',
    es: '¿Qué es Spryxel?',
  }),
  homeFaqItemsItem1Answer: localizedText({
    en: 'Spryxel is a focused workspace foundation for organizing game asset projects. Asset tooling is still being planned.',
    'pt-BR':
      'O Spryxel é uma base de espaço de trabalho focada em organizar projetos de recursos para jogos. As ferramentas para recursos ainda estão sendo planejadas.',
    es: 'Spryxel es una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos. Las herramientas para recursos siguen planificándose.',
  }),
  homeFaqItemsItem2Question: localizedText({
    en: 'Can I generate or export assets now?',
    'pt-BR': 'Já posso gerar ou exportar recursos?',
    es: '¿Ya puedo generar o exportar recursos?',
  }),
  homeFaqItemsItem2Answer: localizedText({
    en: 'No. Asset generation and export are planned capabilities and are not currently available.',
    'pt-BR':
      'Não. A geração e a exportação de recursos são capacidades planejadas e ainda não estão disponíveis.',
    es: 'No. La generación y la exportación de recursos son funciones planificadas y todavía no están disponibles.',
  }),
  homeFaqItemsItem3Question: localizedText({
    en: 'What can I use today?',
    'pt-BR': 'O que posso usar hoje?',
    es: '¿Qué puedo usar hoy?',
  }),
  homeFaqItemsItem3Answer: localizedText({
    en: 'The current capability is the project workspace foundation. Asset contracts and durable jobs are planned.',
    'pt-BR':
      'A capacidade atual é a base do espaço de trabalho de projetos. Contratos de recursos e tarefas duráveis estão planejados.',
    es: 'La función actual es la base del espacio de trabajo de proyectos. Los contratos de recursos y las tareas duraderas están planificados.',
  }),
  homeFaqItemsItem4Question: localizedText({
    en: 'Where can I find support?',
    'pt-BR': 'Onde encontro suporte?',
    es: '¿Dónde puedo encontrar soporte?',
  }),
  homeFaqItemsItem4Answer: localizedText({
    en: 'A verified contact or support channel has not been published yet. The contact page will be updated when one is available.',
    'pt-BR':
      'Um contato verificado ou canal de suporte ainda não foi publicado. A página de contato será atualizada quando houver um.',
    es: 'Todavía no se ha publicado un contacto verificado ni un canal de soporte. La página de contacto se actualizará cuando haya uno disponible.',
  }),
  homeCtaTitle: localizedText({
    en: 'Start with a project workspace',
    'pt-BR': 'Comece com um espaço de trabalho de projeto',
    es: 'Empieza con un espacio de trabajo de proyecto',
  }),
  homeCtaBody: localizedText({
    en: 'Explore the current foundation and the asset capabilities planned for future development.',
    'pt-BR':
      'Explore a base atual e os recursos para jogos planejados para o desenvolvimento futuro.',
    es: 'Explora la base actual y las funciones para recursos planificadas para el desarrollo futuro.',
  }),
  homeCtaPrimaryCta: localizedText({
    en: 'Explore features',
    'pt-BR': 'Explore os recursos',
    es: 'Explorar las funciones',
  }),
  homeCtaSecondaryCta: localizedText({
    en: 'Read the FAQ',
    'pt-BR': 'Leia as perguntas frequentes',
    es: 'Leer las preguntas frecuentes',
  }),
  pagesFeaturesEyebrow: localizedText({
    en: 'Product status',
    'pt-BR': 'Status do produto',
    es: 'Estado del producto',
  }),
  pagesFeaturesTitle: localizedText({
    en: 'A project workspace foundation, with asset tools on the roadmap.',
    'pt-BR':
      'Uma base de espaço de trabalho de projetos, com ferramentas para recursos no roteiro.',
    es: 'Una base de espacio de trabajo de proyectos, con herramientas para recursos en la hoja de ruta.',
  }),
  pagesFeaturesIntro: localizedText({
    en: 'Spryxel is being developed for game asset projects. The current capability is the project workspace foundation; generation and export are not available.',
    'pt-BR':
      'O Spryxel está sendo desenvolvido para projetos de recursos de jogos. A capacidade atual é a base do espaço de trabalho de projetos; geração e exportação não estão disponíveis.',
    es: 'Spryxel se está desarrollando para proyectos de recursos de videojuegos. La función actual es la base del espacio de trabajo de proyectos; la generación y la exportación no están disponibles.',
  }),
  pagesFeaturesCurrentTitle: localizedText({
    en: 'Available today',
    'pt-BR': 'Disponível hoje',
    es: 'Disponible hoy',
  }),
  pagesFeaturesCurrentBody: localizedText({
    en: 'The project workspace foundation for creating and organizing projects.',
    'pt-BR': 'A base do espaço de trabalho de projetos para criar e organizar projetos.',
    es: 'La base del espacio de trabajo de proyectos para crear y organizar proyectos.',
  }),
  pagesFeaturesPlannedLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  pagesFeaturesSectionsItem1Title: localizedText({
    en: 'Asset contracts',
    'pt-BR': 'Contratos de recursos',
    es: 'Contratos de recursos',
  }),
  pagesFeaturesSectionsItem1Body: localizedText({
    en: 'Planned structured asset briefs that describe requirements and intended outputs.',
    'pt-BR':
      'Briefings estruturados planejados para descrever requisitos e resultados esperados de recursos.',
    es: 'Resúmenes estructurados planificados para describir requisitos y resultados previstos de los recursos.',
  }),
  pagesFeaturesSectionsItem2Title: localizedText({
    en: 'Durable jobs',
    'pt-BR': 'Tarefas duráveis',
    es: 'Tareas duraderas',
  }),
  pagesFeaturesSectionsItem2Body: localizedText({
    en: 'Planned processing jobs designed to track work through its steps.',
    'pt-BR': 'Tarefas de processamento planejadas para acompanhar o trabalho em cada etapa.',
    es: 'Tareas de procesamiento planificadas para seguir el trabajo a lo largo de sus pasos.',
  }),
  pagesFeaturesSectionsItem3Title: localizedText({
    en: 'Generation and export',
    'pt-BR': 'Geração e exportação',
    es: 'Generación y exportación',
  }),
  pagesFeaturesSectionsItem3Body: localizedText({
    en: 'Planned capabilities. Neither asset generation nor export is available today.',
    'pt-BR':
      'Recursos planejados. A geração e a exportação de recursos ainda não estão disponíveis.',
    es: 'Funciones planificadas. La generación y la exportación de recursos no están disponibles hoy.',
  }),
  pagesHowItWorksEyebrow: localizedText({
    en: 'Planned workflow',
    'pt-BR': 'Fluxo planejado',
    es: 'Flujo planificado',
  }),
  pagesHowItWorksTitle: localizedText({
    en: 'A project-first path for game assets.',
    'pt-BR': 'Um caminho para recursos de jogos que começa pelo projeto.',
    es: 'Un camino para recursos de videojuegos que empieza por el proyecto.',
  }),
  pagesHowItWorksIntro: localizedText({
    en: 'This is the intended workflow direction for Spryxel. Its later asset processing steps are planned and are not available yet.',
    'pt-BR':
      'Esta é a direção pretendida para o fluxo do Spryxel. As etapas posteriores de processamento de recursos estão planejadas e ainda não estão disponíveis.',
    es: 'Esta es la dirección prevista para el flujo de Spryxel. Sus etapas posteriores de procesamiento de recursos están planificadas y aún no están disponibles.',
  }),
  pagesHowItWorksPlannedLabel: localizedText({
    en: 'Planned',
    'pt-BR': 'Planejado',
    es: 'Planificado',
  }),
  pagesHowItWorksStepsItem1Title: localizedText({
    en: 'Create a project workspace',
    'pt-BR': 'Crie um espaço de trabalho de projeto',
    es: 'Crear un espacio de trabajo de proyecto',
  }),
  pagesHowItWorksStepsItem1Body: localizedText({
    en: 'Use the available project workspace foundation to give a game effort a home.',
    'pt-BR':
      'Use a base disponível do espaço de trabalho de projetos para dar um lugar a um esforço de jogo.',
    es: 'Usa la base disponible del espacio de trabajo de proyectos para dar un lugar a un proyecto de videojuego.',
  }),
  pagesHowItWorksStepsItem2Title: localizedText({
    en: 'Write an asset contract',
    'pt-BR': 'Escreva um contrato de recurso',
    es: 'Escribir un contrato de recurso',
  }),
  pagesHowItWorksStepsItem2Body: localizedText({
    en: 'A planned contract will capture the brief and requirements for an asset.',
    'pt-BR': 'Um contrato planejado registrará o briefing e os requisitos de um recurso.',
    es: 'Un contrato planificado recogerá el resumen y los requisitos de un recurso.',
  }),
  pagesHowItWorksStepsItem3Title: localizedText({
    en: 'Track durable jobs',
    'pt-BR': 'Acompanhe tarefas duráveis',
    es: 'Seguir tareas duraderas',
  }),
  pagesHowItWorksStepsItem3Body: localizedText({
    en: 'Planned durable jobs will make processing status trackable across steps.',
    'pt-BR':
      'Tarefas duráveis planejadas permitirão acompanhar o status do processamento entre etapas.',
    es: 'Las tareas duraderas planificadas permitirán seguir el estado del procesamiento entre pasos.',
  }),
  pagesHowItWorksStepsItem4Title: localizedText({
    en: 'Generate and export',
    'pt-BR': 'Gere e exporte',
    es: 'Generar y exportar',
  }),
  pagesHowItWorksStepsItem4Body: localizedText({
    en: 'Generation and export are planned outcomes, not available capabilities.',
    'pt-BR': 'Geração e exportação são resultados planejados, não recursos disponíveis.',
    es: 'La generación y la exportación son resultados planificados, no funciones disponibles.',
  }),
  pagesHowItWorksStatusNote: localizedText({
    en: 'Today, only the project workspace foundation is available. Asset contracts, durable jobs, generation, and export remain planned.',
    'pt-BR':
      'Hoje, apenas a base do espaço de trabalho de projetos está disponível. Contratos de recursos, tarefas duráveis, geração e exportação continuam planejados.',
    es: 'Hoy solo está disponible la base del espacio de trabajo de proyectos. Los contratos de recursos, las tareas duraderas, la generación y la exportación siguen planificados.',
  }),
  pagesFaqEyebrow: localizedText({
    en: 'Answers',
    'pt-BR': 'Respostas',
    es: 'Respuestas',
  }),
  pagesFaqTitle: localizedText({
    en: 'Frequently asked questions',
    'pt-BR': 'Perguntas frequentes',
    es: 'Preguntas frecuentes',
  }),
  pagesFaqIntro: localizedText({
    en: 'What is available now, and what is still planned for Spryxel?',
    'pt-BR': 'O que está disponível agora e o que ainda está planejado para o Spryxel?',
    es: '¿Qué está disponible ahora y qué sigue planificado para Spryxel?',
  }),
  pagesFaqItemsItem1Question: localizedText({
    en: 'What is Spryxel?',
    'pt-BR': 'O que é o Spryxel?',
    es: '¿Qué es Spryxel?',
  }),
  pagesFaqItemsItem1Answer: localizedText({
    en: 'Spryxel is a focused workspace foundation for organizing game asset projects. Asset tooling is still being planned.',
    'pt-BR':
      'O Spryxel é uma base de espaço de trabalho focada em organizar projetos de recursos para jogos. As ferramentas para recursos ainda estão sendo planejadas.',
    es: 'Spryxel es una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos. Las herramientas para recursos siguen planificándose.',
  }),
  pagesFaqItemsItem2Question: localizedText({
    en: 'Can I generate or export assets now?',
    'pt-BR': 'Já posso gerar ou exportar recursos?',
    es: '¿Ya puedo generar o exportar recursos?',
  }),
  pagesFaqItemsItem2Answer: localizedText({
    en: 'No. Asset generation and export are planned capabilities and are not currently available.',
    'pt-BR':
      'Não. A geração e a exportação de recursos são capacidades planejadas e ainda não estão disponíveis.',
    es: 'No. La generación y la exportación de recursos son funciones planificadas y todavía no están disponibles.',
  }),
  pagesFaqItemsItem3Question: localizedText({
    en: 'What can I use today?',
    'pt-BR': 'O que posso usar hoje?',
    es: '¿Qué puedo usar hoy?',
  }),
  pagesFaqItemsItem3Answer: localizedText({
    en: 'The current capability is the project workspace foundation. Asset contracts and durable jobs are planned.',
    'pt-BR':
      'A capacidade atual é a base do espaço de trabalho de projetos. Contratos de recursos e tarefas duráveis estão planejados.',
    es: 'La función actual es la base del espacio de trabajo de proyectos. Los contratos de recursos y las tareas duraderas están planificados.',
  }),
  pagesFaqItemsItem4Question: localizedText({
    en: 'Where can I find support?',
    'pt-BR': 'Onde encontro suporte?',
    es: '¿Dónde puedo encontrar soporte?',
  }),
  pagesFaqItemsItem4Answer: localizedText({
    en: 'A verified contact or support channel has not been published yet. The contact page will be updated when one is available.',
    'pt-BR':
      'Um contato verificado ou canal de suporte ainda não foi publicado. A página de contato será atualizada quando houver um.',
    es: 'Todavía no se ha publicado un contacto verificado ni un canal de soporte. La página de contacto se actualizará cuando haya uno disponible.',
  }),
  pagesContactEyebrow: localizedText({
    en: 'Contact',
    'pt-BR': 'Contato',
    es: 'Contacto',
  }),
  pagesContactTitle: localizedText({
    en: 'Stay tuned for verified contact details.',
    'pt-BR': 'Aguarde os dados de contato verificados.',
    es: 'Pronto publicaremos datos de contacto verificados.',
  }),
  pagesContactIntro: localizedText({
    en: 'No public support channel has been confirmed for this page. We will publish contact details here when they are ready.',
    'pt-BR':
      'Nenhum canal público de suporte foi confirmado para esta página. Publicaremos os dados de contato aqui quando estiverem prontos.',
    es: 'No se ha confirmado ningún canal público de soporte para esta página. Publicaremos aquí los datos de contacto cuando estén listos.',
  }),
  pagesContactNoteTitle: localizedText({
    en: 'Contact information pending',
    'pt-BR': 'Informações de contato pendentes',
    es: 'Información de contacto pendiente',
  }),
  pagesContactNoteBody: localizedText({
    en: 'This page does not list an email address, mailing address, or support channel because none has been verified for publication.',
    'pt-BR':
      'Esta página não lista endereço de e-mail, endereço postal ou canal de suporte, pois nenhum foi verificado para publicação.',
    es: 'Esta página no incluye un correo electrónico, una dirección postal ni un canal de soporte porque ninguno se ha verificado para su publicación.',
  }),
  pagesLegalTermsTitle: localizedText({
    en: 'Terms of service outline',
    'pt-BR': 'Estrutura dos termos de serviço',
    es: 'Esquema de las condiciones del servicio',
  }),
  pagesLegalTermsDraftNotice: localizedText({
    en: 'DRAFT — This outline is not final terms. It requires review and approval by the responsible legal owner before publication.',
    'pt-BR':
      'RASCUNHO — Esta estrutura não representa os termos finais. Ela precisa de revisão e aprovação da pessoa responsável pela área jurídica antes da publicação.',
    es: 'BORRADOR — Este esquema no constituye las condiciones finales. Requiere revisión y aprobación de la persona responsable del área legal antes de publicarse.',
  }),
  pagesLegalTermsIntro: localizedText({
    en: 'Use this outline to prepare terms from verified product and business information. Replace each placeholder after review.',
    'pt-BR':
      'Use esta estrutura para preparar os termos com informações verificadas sobre o produto e a empresa. Substitua cada marcador após a revisão.',
    es: 'Usa este esquema para preparar condiciones con información verificada del producto y del negocio. Sustituye cada marcador después de revisarlo.',
  }),
  pagesLegalTermsSectionsItem1Title: localizedText({
    en: 'Service provider and scope',
    'pt-BR': 'Prestador do serviço e escopo',
    es: 'Proveedor del servicio y alcance',
  }),
  pagesLegalTermsSectionsItem1Body: localizedText({
    en: 'Placeholder: identify the responsible legal entity and describe the service and scope of these terms.',
    'pt-BR':
      'Marcador: identifique a entidade jurídica responsável e descreva o serviço e o escopo destes termos.',
    es: 'Marcador: identifica la entidad legal responsable y describe el servicio y el alcance de estas condiciones.',
  }),
  pagesLegalTermsSectionsItem2Title: localizedText({
    en: 'Eligibility and account responsibilities',
    'pt-BR': 'Elegibilidade e responsabilidades da conta',
    es: 'Requisitos y responsabilidades de la cuenta',
  }),
  pagesLegalTermsSectionsItem2Body: localizedText({
    en: 'Outline: confirm who may use the service and describe account responsibilities and acceptable use.',
    'pt-BR':
      'Estrutura: confirme quem pode usar o serviço e descreva as responsabilidades da conta e o uso aceitável.',
    es: 'Esquema: confirma quién puede usar el servicio y describe las responsabilidades de la cuenta y el uso aceptable.',
  }),
  pagesLegalTermsSectionsItem3Title: localizedText({
    en: 'Availability and service changes',
    'pt-BR': 'Disponibilidade e mudanças no serviço',
    es: 'Disponibilidad y cambios del servicio',
  }),
  pagesLegalTermsSectionsItem3Body: localizedText({
    en: 'Placeholder: describe availability, support, and changes using confirmed product behavior.',
    'pt-BR':
      'Marcador: descreva disponibilidade, suporte e mudanças com base no comportamento confirmado do produto.',
    es: 'Marcador: describe la disponibilidad, el soporte y los cambios según el funcionamiento confirmado del producto.',
  }),
  pagesLegalTermsSectionsItem4Title: localizedText({
    en: 'Fees and cancellation',
    'pt-BR': 'Taxas e cancelamento',
    es: 'Tarifas y cancelación',
  }),
  pagesLegalTermsSectionsItem4Body: localizedText({
    en: 'Placeholder: add verified billing, fee, renewal, and cancellation terms if they apply.',
    'pt-BR':
      'Marcador: inclua termos verificados de cobrança, taxas, renovação e cancelamento, se aplicáveis.',
    es: 'Marcador: añade condiciones verificadas de facturación, tarifas, renovación y cancelación, si corresponden.',
  }),
  pagesLegalTermsSectionsItem5Title: localizedText({
    en: 'Intellectual property and user content',
    'pt-BR': 'Propriedade intelectual e conteúdo do usuário',
    es: 'Propiedad intelectual y contenido del usuario',
  }),
  pagesLegalTermsSectionsItem5Body: localizedText({
    en: 'Outline: clarify rights, licenses, and user responsibilities after legal review.',
    'pt-BR':
      'Estrutura: esclareça direitos, licenças e responsabilidades dos usuários após revisão jurídica.',
    es: 'Esquema: aclara los derechos, las licencias y las responsabilidades de los usuarios tras una revisión legal.',
  }),
  pagesLegalTermsSectionsItem6Title: localizedText({
    en: 'Disclaimers and disputes',
    'pt-BR': 'Isenções e disputas',
    es: 'Exenciones y disputas',
  }),
  pagesLegalTermsSectionsItem6Body: localizedText({
    en: 'Placeholder: obtain legal review of warranty, liability, governing law, and dispute provisions.',
    'pt-BR':
      'Marcador: solicite revisão jurídica das disposições sobre garantias, responsabilidade, lei aplicável e disputas.',
    es: 'Marcador: solicita una revisión legal de las disposiciones sobre garantías, responsabilidad, legislación aplicable y disputas.',
  }),
  pagesLegalTermsSectionsItem7Title: localizedText({
    en: 'Effective date and legal contact',
    'pt-BR': 'Data de vigência e contato jurídico',
    es: 'Fecha de entrada en vigor y contacto legal',
  }),
  pagesLegalTermsSectionsItem7Body: localizedText({
    en: 'Placeholder: add an approved effective date and verified legal contact before publication.',
    'pt-BR':
      'Marcador: inclua uma data de vigência aprovada e um contato jurídico verificado antes da publicação.',
    es: 'Marcador: añade una fecha de entrada en vigor aprobada y un contacto legal verificado antes de publicarlo.',
  }),
  pagesLegalPrivacyTitle: localizedText({
    en: 'Privacy notice outline',
    'pt-BR': 'Estrutura do aviso de privacidade',
    es: 'Esquema del aviso de privacidad',
  }),
  pagesLegalPrivacyDraftNotice: localizedText({
    en: 'DRAFT — This privacy outline is not a final notice. Do not publish it until privacy and legal reviewers verify it against actual data practices.',
    'pt-BR':
      'RASCUNHO — Esta estrutura de privacidade não é um aviso final. Não publique até que as pessoas responsáveis por privacidade e jurídico confirmem as práticas reais de dados.',
    es: 'BORRADOR — Este esquema de privacidad no es un aviso final. No lo publiques hasta que las personas responsables de privacidad y legal lo verifiquen con las prácticas reales de datos.',
  }),
  pagesLegalPrivacyIntro: localizedText({
    en: 'Document only data practices confirmed by a product and infrastructure review. No collection, sharing, or retention details are asserted here.',
    'pt-BR':
      'Documente apenas práticas de dados confirmadas por uma revisão do produto e da infraestrutura. Nenhum detalhe de coleta, compartilhamento ou retenção é afirmado aqui.',
    es: 'Documenta únicamente las prácticas de datos confirmadas mediante una revisión del producto y la infraestructura. Aquí no se afirma ningún detalle de recopilación, divulgación ni conservación.',
  }),
  pagesLegalPrivacySectionsItem1Title: localizedText({
    en: 'Data collected and sources',
    'pt-BR': 'Dados coletados e fontes',
    es: 'Datos recopilados y fuentes',
  }),
  pagesLegalPrivacySectionsItem1Body: localizedText({
    en: 'Placeholder: list each confirmed category of personal data and how it is obtained.',
    'pt-BR': 'Marcador: liste cada categoria confirmada de dados pessoais e como ela é obtida.',
    es: 'Marcador: enumera cada categoría confirmada de datos personales y cómo se obtiene.',
  }),
  pagesLegalPrivacySectionsItem2Title: localizedText({
    en: 'Purposes and legal grounds',
    'pt-BR': 'Finalidades e bases legais',
    es: 'Fines y bases jurídicas',
  }),
  pagesLegalPrivacySectionsItem2Body: localizedText({
    en: 'Placeholder: document each verified purpose and the applicable legal ground after review.',
    'pt-BR':
      'Marcador: documente cada finalidade verificada e a base legal aplicável após revisão.',
    es: 'Marcador: documenta cada finalidad verificada y la base jurídica aplicable después de revisarla.',
  }),
  pagesLegalPrivacySectionsItem3Title: localizedText({
    en: 'Processors and other recipients',
    'pt-BR': 'Operadores e outros destinatários',
    es: 'Encargados y otros destinatarios',
  }),
  pagesLegalPrivacySectionsItem3Body: localizedText({
    en: 'Placeholder: identify confirmed service providers and recipients, and explain their roles.',
    'pt-BR':
      'Marcador: identifique prestadores e destinatários confirmados e explique seus papéis.',
    es: 'Marcador: identifica a los proveedores de servicios y destinatarios confirmados y explica sus funciones.',
  }),
  pagesLegalPrivacySectionsItem4Title: localizedText({
    en: 'International transfers',
    'pt-BR': 'Transferências internacionais',
    es: 'Transferencias internacionales',
  }),
  pagesLegalPrivacySectionsItem4Body: localizedText({
    en: 'Placeholder: describe verified international transfers and safeguards, if any.',
    'pt-BR':
      'Marcador: descreva transferências internacionais verificadas e as salvaguardas, se houver.',
    es: 'Marcador: describe las transferencias internacionales verificadas y las salvaguardas, si las hay.',
  }),
  pagesLegalPrivacySectionsItem5Title: localizedText({
    en: 'Retention and security',
    'pt-BR': 'Retenção e segurança',
    es: 'Conservación y seguridad',
  }),
  pagesLegalPrivacySectionsItem5Body: localizedText({
    en: 'Placeholder: add verified retention periods or criteria and an accurate description of safeguards.',
    'pt-BR':
      'Marcador: adicione períodos ou critérios de retenção verificados e uma descrição precisa das medidas de proteção.',
    es: 'Marcador: añade los periodos o criterios de conservación verificados y una descripción precisa de las medidas de seguridad.',
  }),
  pagesLegalPrivacySectionsItem6Title: localizedText({
    en: 'Privacy choices and rights',
    'pt-BR': 'Opções e direitos de privacidade',
    es: 'Opciones y derechos de privacidad',
  }),
  pagesLegalPrivacySectionsItem6Body: localizedText({
    en: 'Outline: confirm applicable rights, choices, and request procedures for each relevant region.',
    'pt-BR':
      'Estrutura: confirme os direitos, as opções e os procedimentos de solicitação aplicáveis em cada região relevante.',
    es: 'Esquema: confirma los derechos, las opciones y los procedimientos de solicitud aplicables en cada región pertinente.',
  }),
  pagesLegalPrivacySectionsItem7Title: localizedText({
    en: 'Privacy contact and notice updates',
    'pt-BR': 'Contato de privacidade e atualizações do aviso',
    es: 'Contacto de privacidad y cambios del aviso',
  }),
  pagesLegalPrivacySectionsItem7Body: localizedText({
    en: 'Placeholder: add a verified privacy contact and explain how notice changes will be communicated.',
    'pt-BR':
      'Marcador: adicione um contato de privacidade verificado e explique como as mudanças no aviso serão comunicadas.',
    es: 'Marcador: añade un contacto de privacidad verificado y explica cómo se comunicarán los cambios del aviso.',
  }),
  pagesLegalCookiesTitle: localizedText({
    en: 'Cookie notice outline',
    'pt-BR': 'Estrutura do aviso de cookies',
    es: 'Esquema del aviso de cookies',
  }),
  pagesLegalCookiesDraftNotice: localizedText({
    en: 'DRAFT — This cookie outline is not a final notice. Complete a technical audit and legal review before publication.',
    'pt-BR':
      'RASCUNHO — Esta estrutura de cookies não é um aviso final. Faça uma auditoria técnica e uma revisão jurídica antes da publicação.',
    es: 'BORRADOR — Este esquema de cookies no es un aviso final. Completa una auditoría técnica y una revisión legal antes de publicarlo.',
  }),
  pagesLegalCookiesIntro: localizedText({
    en: 'No cookie or similar-technology inventory is confirmed in this draft. Do not treat this outline as a statement about current site behavior.',
    'pt-BR':
      'Este rascunho não confirma nenhum inventário de cookies ou tecnologia semelhante. Não o trate como uma declaração sobre o comportamento atual do site.',
    es: 'Este borrador no confirma ningún inventario de cookies o tecnologías similares. No lo interpretes como una afirmación sobre el comportamiento actual del sitio.',
  }),
  pagesLegalCookiesSectionsItem1Title: localizedText({
    en: 'Verified inventory',
    'pt-BR': 'Inventário verificado',
    es: 'Inventario verificado',
  }),
  pagesLegalCookiesSectionsItem1Body: localizedText({
    en: 'Placeholder: list each cookie or similar technology confirmed by a technical audit, including its provider and purpose.',
    'pt-BR':
      'Marcador: liste cada cookie ou tecnologia semelhante confirmada por uma auditoria técnica, incluindo fornecedor e finalidade.',
    es: 'Marcador: enumera cada cookie o tecnología similar confirmada mediante una auditoría técnica, incluido su proveedor y finalidad.',
  }),
  pagesLegalCookiesSectionsItem2Title: localizedText({
    en: 'Duration and category',
    'pt-BR': 'Duração e categoria',
    es: 'Duración y categoría',
  }),
  pagesLegalCookiesSectionsItem2Body: localizedText({
    en: 'Placeholder: record the verified duration and category for each listed technology.',
    'pt-BR': 'Marcador: registre a duração e a categoria verificadas de cada tecnologia listada.',
    es: 'Marcador: registra la duración y la categoría verificadas de cada tecnología enumerada.',
  }),
  pagesLegalCookiesSectionsItem3Title: localizedText({
    en: 'Consent and controls',
    'pt-BR': 'Consentimento e controles',
    es: 'Consentimiento y controles',
  }),
  pagesLegalCookiesSectionsItem3Body: localizedText({
    en: 'Placeholder: describe verified consent behavior and available browser or site controls.',
    'pt-BR':
      'Marcador: descreva o comportamento de consentimento confirmado e os controles disponíveis no navegador ou no site.',
    es: 'Marcador: describe el comportamiento de consentimiento verificado y los controles disponibles en el navegador o el sitio.',
  }),
  pagesLegalCookiesSectionsItem4Title: localizedText({
    en: 'Updates and contact',
    'pt-BR': 'Atualizações e contato',
    es: 'Cambios y contacto',
  }),
  pagesLegalCookiesSectionsItem4Body: localizedText({
    en: 'Placeholder: add the review date, an approved update process, and a verified contact before publication.',
    'pt-BR':
      'Marcador: inclua a data da revisão, um processo de atualização aprovado e um contato verificado antes da publicação.',
    es: 'Marcador: añade la fecha de revisión, un proceso de actualización aprobado y un contacto verificado antes de publicarlo.',
  }),
} satisfies Record<string, LocalizedText>;

const publicContentSchema = {
  shell: {
    nav: {
      home: publicCopy.shellNavHome,
      features: publicCopy.shellNavFeatures,
      howItWorks: publicCopy.shellNavHowItWorks,
      faq: publicCopy.shellNavFaq,
      contact: publicCopy.shellNavContact,
      signIn: publicCopy.shellNavSignIn,
      skipToContent: publicCopy.shellNavSkipToContent,
      menu: publicCopy.shellNavMenu,
      closeMenu: publicCopy.shellNavCloseMenu,
    },
    theme: {
      switchToLight: publicCopy.shellThemeSwitchToLight,
      switchToDark: publicCopy.shellThemeSwitchToDark,
    },
    locale: {
      label: publicCopy.shellLocaleLabel,
      names: {
        en: 'English',
        'pt-BR': 'Português (Brasil)',
        es: 'Español',
      },
    },
    footer: {
      tagline: publicCopy.shellFooterTagline,
      navigationTitle: publicCopy.shellFooterNavigationTitle,
      legalTitle: publicCopy.shellFooterLegalTitle,
      contactTitle: publicCopy.shellFooterContactTitle,
      contactNote: publicCopy.shellFooterContactNote,
      statusLabel: publicCopy.shellFooterStatusLabel,
      statusBody: publicCopy.shellFooterStatusBody,
      copyright: '© Spryxel',
    },
  },
  metadata: {
    home: {
      title: publicCopy.metadataHomeTitle,
      description: publicCopy.metadataHomeDescription,
    },
    features: {
      title: publicCopy.metadataFeaturesTitle,
      description: publicCopy.metadataFeaturesDescription,
    },
    'how-it-works': {
      title: publicCopy.metadataHowItWorksTitle,
      description: publicCopy.metadataHowItWorksDescription,
    },
    faq: {
      title: publicCopy.metadataFaqTitle,
      description: publicCopy.metadataFaqDescription,
    },
    contact: {
      title: publicCopy.metadataContactTitle,
      description: publicCopy.metadataContactDescription,
    },
    terms: {
      title: publicCopy.metadataTermsTitle,
      description: publicCopy.metadataTermsDescription,
    },
    privacy: {
      title: publicCopy.metadataPrivacyTitle,
      description: publicCopy.metadataPrivacyDescription,
    },
    cookies: {
      title: publicCopy.metadataCookiesTitle,
      description: publicCopy.metadataCookiesDescription,
    },
  },
  home: {
    hero: {
      eyebrow: publicCopy.homeHeroEyebrow,
      title: publicCopy.homeHeroTitle,
      description: publicCopy.homeHeroDescription,
      primaryCta: publicCopy.homeHeroPrimaryCta,
      secondaryCta: publicCopy.homeHeroSecondaryCta,
      image: '/public-site/images/hero-key-visual.webp',
      imageAlt: publicCopy.homeHeroImageAlt,
    },
    trust: {
      title: publicCopy.homeTrustTitle,
      description: publicCopy.homeTrustDescription,
      principles: [
        {
          title: publicCopy.homeTrustPrinciplesItem1Title,
          body: publicCopy.homeTrustPrinciplesItem1Body,
        },
        {
          title: publicCopy.homeTrustPrinciplesItem2Title,
          body: publicCopy.homeTrustPrinciplesItem2Body,
        },
        {
          title: publicCopy.homeTrustPrinciplesItem3Title,
          body: publicCopy.homeTrustPrinciplesItem3Body,
        },
      ],
    },
    categories: {
      title: publicCopy.homeCategoriesTitle,
      description: publicCopy.homeCategoriesDescription,
      plannedLabel: publicCopy.homeCategoriesPlannedLabel,
      items: {
        characters: {
          title: publicCopy.homeCategoriesItemsCharactersTitle,
          description: publicCopy.homeCategoriesItemsCharactersDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsCharactersStatusLabel,
          image: '/public-site/images/category-characters.webp',
          alt: publicCopy.homeCategoriesItemsCharactersAlt,
        },
        sprites: {
          title: 'Sprites',
          description: publicCopy.homeCategoriesItemsSpritesDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsSpritesStatusLabel,
          image: '/public-site/images/category-sprites.webp',
          alt: publicCopy.homeCategoriesItemsSpritesAlt,
        },
        mobs: {
          title: 'Mobs',
          description: publicCopy.homeCategoriesItemsMobsDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsMobsStatusLabel,
          image: '/public-site/images/category-mobs.webp',
          alt: publicCopy.homeCategoriesItemsMobsAlt,
        },
        items: {
          title: publicCopy.homeCategoriesItemsItemsTitle,
          description: publicCopy.homeCategoriesItemsItemsDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsItemsStatusLabel,
          image: '/public-site/images/category-items.webp',
          alt: publicCopy.homeCategoriesItemsItemsAlt,
        },
        maps: {
          title: publicCopy.homeCategoriesItemsMapsTitle,
          description: publicCopy.homeCategoriesItemsMapsDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsMapsStatusLabel,
          image: '/public-site/images/category-maps.webp',
          alt: publicCopy.homeCategoriesItemsMapsAlt,
        },
        uiHud: {
          title: publicCopy.homeCategoriesItemsUiHudTitle,
          description: publicCopy.homeCategoriesItemsUiHudDescription,
          status: 'planned',
          statusLabel: publicCopy.homeCategoriesItemsUiHudStatusLabel,
          image: '/public-site/images/category-ui-hud.webp',
          alt: publicCopy.homeCategoriesItemsUiHudAlt,
        },
      },
    },
    workflow: {
      title: publicCopy.homeWorkflowTitle,
      description: publicCopy.homeWorkflowDescription,
      plannedLabel: publicCopy.homeWorkflowPlannedLabel,
      steps: [
        {
          title: publicCopy.homeWorkflowStepsItem1Title,
          body: publicCopy.homeWorkflowStepsItem1Body,
        },
        {
          title: publicCopy.homeWorkflowStepsItem2Title,
          body: publicCopy.homeWorkflowStepsItem2Body,
        },
        {
          title: publicCopy.homeWorkflowStepsItem3Title,
          body: publicCopy.homeWorkflowStepsItem3Body,
        },
        {
          title: publicCopy.homeWorkflowStepsItem4Title,
          body: publicCopy.homeWorkflowStepsItem4Body,
        },
      ],
    },
    status: {
      label: publicCopy.homeStatusLabel,
      title: publicCopy.homeStatusTitle,
      currentBody: publicCopy.homeStatusCurrentBody,
      plannedTitle: publicCopy.homeStatusPlannedTitle,
      plannedBody: publicCopy.homeStatusPlannedBody,
      plannedItems: [
        {
          title: publicCopy.homeStatusPlannedItemsItem1Title,
          body: publicCopy.homeStatusPlannedItemsItem1Body,
        },
        {
          title: publicCopy.homeStatusPlannedItemsItem2Title,
          body: publicCopy.homeStatusPlannedItemsItem2Body,
        },
        {
          title: publicCopy.homeStatusPlannedItemsItem3Title,
          body: publicCopy.homeStatusPlannedItemsItem3Body,
        },
      ],
    },
    faq: {
      title: publicCopy.homeFaqTitle,
      description: publicCopy.homeFaqDescription,
      items: [
        {
          question: publicCopy.homeFaqItemsItem1Question,
          answer: publicCopy.homeFaqItemsItem1Answer,
        },
        {
          question: publicCopy.homeFaqItemsItem2Question,
          answer: publicCopy.homeFaqItemsItem2Answer,
        },
        {
          question: publicCopy.homeFaqItemsItem3Question,
          answer: publicCopy.homeFaqItemsItem3Answer,
        },
        {
          question: publicCopy.homeFaqItemsItem4Question,
          answer: publicCopy.homeFaqItemsItem4Answer,
        },
      ],
    },
    cta: {
      title: publicCopy.homeCtaTitle,
      body: publicCopy.homeCtaBody,
      primaryCta: publicCopy.homeCtaPrimaryCta,
      secondaryCta: publicCopy.homeCtaSecondaryCta,
    },
  },
  pages: {
    features: {
      eyebrow: publicCopy.pagesFeaturesEyebrow,
      title: publicCopy.pagesFeaturesTitle,
      intro: publicCopy.pagesFeaturesIntro,
      currentTitle: publicCopy.pagesFeaturesCurrentTitle,
      currentBody: publicCopy.pagesFeaturesCurrentBody,
      plannedLabel: publicCopy.pagesFeaturesPlannedLabel,
      sections: [
        {
          title: publicCopy.pagesFeaturesSectionsItem1Title,
          body: publicCopy.pagesFeaturesSectionsItem1Body,
        },
        {
          title: publicCopy.pagesFeaturesSectionsItem2Title,
          body: publicCopy.pagesFeaturesSectionsItem2Body,
        },
        {
          title: publicCopy.pagesFeaturesSectionsItem3Title,
          body: publicCopy.pagesFeaturesSectionsItem3Body,
        },
      ],
    },
    howItWorks: {
      eyebrow: publicCopy.pagesHowItWorksEyebrow,
      title: publicCopy.pagesHowItWorksTitle,
      intro: publicCopy.pagesHowItWorksIntro,
      plannedLabel: publicCopy.pagesHowItWorksPlannedLabel,
      steps: [
        {
          title: publicCopy.pagesHowItWorksStepsItem1Title,
          body: publicCopy.pagesHowItWorksStepsItem1Body,
        },
        {
          title: publicCopy.pagesHowItWorksStepsItem2Title,
          body: publicCopy.pagesHowItWorksStepsItem2Body,
        },
        {
          title: publicCopy.pagesHowItWorksStepsItem3Title,
          body: publicCopy.pagesHowItWorksStepsItem3Body,
        },
        {
          title: publicCopy.pagesHowItWorksStepsItem4Title,
          body: publicCopy.pagesHowItWorksStepsItem4Body,
        },
      ],
      statusNote: publicCopy.pagesHowItWorksStatusNote,
    },
    faq: {
      eyebrow: publicCopy.pagesFaqEyebrow,
      title: publicCopy.pagesFaqTitle,
      intro: publicCopy.pagesFaqIntro,
      items: [
        {
          question: publicCopy.pagesFaqItemsItem1Question,
          answer: publicCopy.pagesFaqItemsItem1Answer,
        },
        {
          question: publicCopy.pagesFaqItemsItem2Question,
          answer: publicCopy.pagesFaqItemsItem2Answer,
        },
        {
          question: publicCopy.pagesFaqItemsItem3Question,
          answer: publicCopy.pagesFaqItemsItem3Answer,
        },
        {
          question: publicCopy.pagesFaqItemsItem4Question,
          answer: publicCopy.pagesFaqItemsItem4Answer,
        },
      ],
    },
    contact: {
      eyebrow: publicCopy.pagesContactEyebrow,
      title: publicCopy.pagesContactTitle,
      intro: publicCopy.pagesContactIntro,
      noteTitle: publicCopy.pagesContactNoteTitle,
      noteBody: publicCopy.pagesContactNoteBody,
    },
    legal: {
      terms: {
        title: publicCopy.pagesLegalTermsTitle,
        draftNotice: publicCopy.pagesLegalTermsDraftNotice,
        intro: publicCopy.pagesLegalTermsIntro,
        sections: [
          {
            title: publicCopy.pagesLegalTermsSectionsItem1Title,
            body: publicCopy.pagesLegalTermsSectionsItem1Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem2Title,
            body: publicCopy.pagesLegalTermsSectionsItem2Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem3Title,
            body: publicCopy.pagesLegalTermsSectionsItem3Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem4Title,
            body: publicCopy.pagesLegalTermsSectionsItem4Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem5Title,
            body: publicCopy.pagesLegalTermsSectionsItem5Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem6Title,
            body: publicCopy.pagesLegalTermsSectionsItem6Body,
          },
          {
            title: publicCopy.pagesLegalTermsSectionsItem7Title,
            body: publicCopy.pagesLegalTermsSectionsItem7Body,
          },
        ],
      },
      privacy: {
        title: publicCopy.pagesLegalPrivacyTitle,
        draftNotice: publicCopy.pagesLegalPrivacyDraftNotice,
        intro: publicCopy.pagesLegalPrivacyIntro,
        sections: [
          {
            title: publicCopy.pagesLegalPrivacySectionsItem1Title,
            body: publicCopy.pagesLegalPrivacySectionsItem1Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem2Title,
            body: publicCopy.pagesLegalPrivacySectionsItem2Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem3Title,
            body: publicCopy.pagesLegalPrivacySectionsItem3Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem4Title,
            body: publicCopy.pagesLegalPrivacySectionsItem4Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem5Title,
            body: publicCopy.pagesLegalPrivacySectionsItem5Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem6Title,
            body: publicCopy.pagesLegalPrivacySectionsItem6Body,
          },
          {
            title: publicCopy.pagesLegalPrivacySectionsItem7Title,
            body: publicCopy.pagesLegalPrivacySectionsItem7Body,
          },
        ],
      },
      cookies: {
        title: publicCopy.pagesLegalCookiesTitle,
        draftNotice: publicCopy.pagesLegalCookiesDraftNotice,
        intro: publicCopy.pagesLegalCookiesIntro,
        sections: [
          {
            title: publicCopy.pagesLegalCookiesSectionsItem1Title,
            body: publicCopy.pagesLegalCookiesSectionsItem1Body,
          },
          {
            title: publicCopy.pagesLegalCookiesSectionsItem2Title,
            body: publicCopy.pagesLegalCookiesSectionsItem2Body,
          },
          {
            title: publicCopy.pagesLegalCookiesSectionsItem3Title,
            body: publicCopy.pagesLegalCookiesSectionsItem3Body,
          },
          {
            title: publicCopy.pagesLegalCookiesSectionsItem4Title,
            body: publicCopy.pagesLegalCookiesSectionsItem4Body,
          },
        ],
      },
    },
  },
} satisfies LocalizedContentSchema<Omit<PublicDictionary, 'locale'>>;
function createPublicDictionary(locale: PublicLocale): PublicDictionary {
  return { locale, ...resolveContent(publicContentSchema, locale) };
}

export const publicContent = {
  en: createPublicDictionary('en'),
  'pt-BR': createPublicDictionary('pt-BR'),
  es: createPublicDictionary('es'),
} satisfies Record<PublicLocale, PublicDictionary>;
export function getPublicContent(locale: PublicLocale): PublicDictionary {
  return publicContent[locale];
}

export function getPublicMetadata(
  locale: PublicLocale,
  page: PublicMetadataPage,
): PublicDictionary['metadata'][PublicMetadataPage] {
  return publicContent[locale].metadata[page];
}
