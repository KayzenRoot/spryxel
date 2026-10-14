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

export const publicContent = {
  en: {
    locale: 'en',
    shell: {
      nav: {
        home: 'Home',
        features: 'Features',
        howItWorks: 'How it works',
        faq: 'FAQ',
        contact: 'Contact',
        signIn: 'Sign in',
        skipToContent: 'Skip to main content',
        menu: 'Open menu',
        closeMenu: 'Close menu',
      },
      theme: {
        switchToLight: 'Switch to light theme',
        switchToDark: 'Switch to dark theme',
      },
      locale: {
        label: 'Language',
        names: { en: 'English', 'pt-BR': 'Português (Brasil)', es: 'Español' },
      },
      footer: {
        tagline: 'A focused workspace for organizing game asset projects.',
        navigationTitle: 'Explore',
        legalTitle: 'Legal',
        contactTitle: 'Contact',
        contactNote: 'Verified contact details will be published here when available.',
        statusLabel: 'Product status',
        statusBody:
          'The project workspace foundation is available. Asset contracts, durable jobs, generation, and export are planned.',
        copyright: '© Spryxel',
      },
    },
    metadata: {
      home: {
        title: 'Spryxel — Plan game asset projects',
        description:
          'Explore Spryxel, a focused workspace foundation for organizing game asset projects and a clearly planned path for future tools.',
      },
      features: {
        title: 'Features — Spryxel',
        description:
          'See what the Spryxel project workspace supports today and which game asset tools remain planned.',
      },
      'how-it-works': {
        title: 'How it works — Spryxel',
        description:
          'Learn about the planned Spryxel workflow for organizing game asset projects, from project setup to future exports.',
      },
      faq: {
        title: 'FAQ — Spryxel',
        description:
          'Answers about the Spryxel project workspace, planned capabilities, and current product status.',
      },
      contact: {
        title: 'Contact — Spryxel',
        description:
          'Find the current contact status for Spryxel. Verified support details will be published when available.',
      },
      terms: {
        title: 'Terms outline — Spryxel',
        description:
          'A draft outline for future Spryxel terms, pending legal review and verified product details.',
      },
      privacy: {
        title: 'Privacy outline — Spryxel',
        description:
          'A draft privacy notice outline that requires review against confirmed Spryxel data practices.',
      },
      cookies: {
        title: 'Cookie notice outline — Spryxel',
        description: 'A draft cookie notice outline pending a technical audit and legal review.',
      },
    },
    home: {
      hero: {
        eyebrow: 'A foundation for game asset projects',
        title: 'A clearer home for game asset projects.',
        description:
          'Spryxel is building a focused workspace for organizing game asset projects. The project workspace foundation is available; asset definitions, durable processing, generation, and export are still planned.',
        primaryCta: 'Explore the features',
        secondaryCta: 'See the planned workflow',
        image: '/public-site/images/hero-key-visual.webp',
        imageAlt:
          'Fantasy game art with a fox spirit on a forest island and a hooded traveler against a plum backdrop.',
      },
      trust: {
        title: 'A clear foundation, with room to grow',
        description:
          'Spryxel is being built around useful project organization and a straightforward account of what is ready and what is still ahead.',
        principles: [
          {
            title: 'Project workspace first',
            body: 'The current foundation is a workspace for creating and organizing projects.',
          },
          {
            title: 'Clear product status',
            body: 'Planned tools are identified as planned, including asset contracts, durable jobs, generation, and export.',
          },
          {
            title: 'Game asset focus',
            body: 'The planned categories cover characters, sprites, mobs, items, maps, and interface art.',
          },
        ],
      },
      categories: {
        title: 'Game asset categories on the roadmap',
        description:
          'These categories describe the intended scope. Every category is planned and is not yet an available generation or export tool.',
        plannedLabel: 'Planned',
        items: {
          characters: {
            title: 'Characters',
            description: 'Character concepts, looks, and variations for a game project.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-characters.webp',
            alt: 'Hooded fox adventurer holding a teal lantern in a moonlit forest.',
          },
          sprites: {
            title: 'Sprites',
            description: 'Sprite artwork and animation sets for future project workflows.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-sprites.webp',
            alt: 'Illustration of a pixel art sprite sheet.',
          },
          mobs: {
            title: 'Mobs',
            description: 'Enemy and creature concepts organized around a game world.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-mobs.webp',
            alt: 'Moss-covered forest guardian with glowing antlers beside a waterfall.',
          },
          items: {
            title: 'Items',
            description: 'Equipment, collectibles, and other in-game object concepts.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-items.webp',
            alt: 'Glowing crystal, violet potion, ornate key, and a small moonlit charm.',
          },
          maps: {
            title: 'Maps',
            description: 'World, level, and location art planned for project workflows.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-maps.webp',
            alt: 'Floating forest island with ancient ruins, winding paths, and waterfalls.',
          },
          uiHud: {
            title: 'UI & HUD',
            description: 'User interface and heads-up display artwork for games.',
            status: 'planned',
            statusLabel: 'Planned',
            image: '/public-site/images/category-ui-hud.webp',
            alt: 'Fantasy HUD concepts with an ornate compass, heart crystals, an empty meter, and framed slots.',
          },
        },
      },
      workflow: {
        title: 'A workflow taking shape',
        description:
          'The following steps describe the planned direction. Only the project workspace foundation is available today.',
        plannedLabel: 'Planned workflow',
        steps: [
          {
            title: 'Organize a project',
            body: 'Start from a project workspace to keep a game effort in one place.',
          },
          {
            title: 'Define the assets',
            body: 'Planned asset contracts will make each asset brief and its requirements explicit.',
          },
          {
            title: 'Run durable jobs',
            body: 'Durable processing jobs are planned to track work as it moves through a workflow.',
          },
          {
            title: 'Generate and export',
            body: 'Generation and export are planned capabilities and are not available yet.',
          },
        ],
      },
      status: {
        label: 'Current status',
        title: 'The project workspace foundation is available.',
        currentBody:
          'Spryxel currently provides a foundation for project workspaces. This does not include asset generation or export.',
        plannedTitle: 'More asset tools are planned',
        plannedBody:
          'The roadmap includes asset contracts and durable jobs, followed by generation and export. These capabilities are not available yet.',
        plannedItems: [
          {
            title: 'Asset contracts',
            body: 'Planned structured definitions for asset briefs and requirements.',
          },
          {
            title: 'Durable jobs',
            body: 'Planned processing that can track asset work across steps.',
          },
          {
            title: 'Generation and export',
            body: 'Planned outputs; generation and export are not available today.',
          },
        ],
      },
      faq: {
        title: 'Common questions',
        description: 'A quick guide to the product foundation and its planned direction.',
        items: [
          {
            question: 'What is Spryxel?',
            answer:
              'Spryxel is a focused workspace foundation for organizing game asset projects. Asset tooling is still being planned.',
          },
          {
            question: 'Can I generate or export assets now?',
            answer:
              'No. Asset generation and export are planned capabilities and are not currently available.',
          },
          {
            question: 'What can I use today?',
            answer:
              'The current capability is the project workspace foundation. Asset contracts and durable jobs are planned.',
          },
          {
            question: 'Where can I find support?',
            answer:
              'A verified contact or support channel has not been published yet. The contact page will be updated when one is available.',
          },
        ],
      },
      cta: {
        title: 'Start with a project workspace',
        body: 'Explore the current foundation and the asset capabilities planned for future development.',
        primaryCta: 'Explore features',
        secondaryCta: 'Read the FAQ',
      },
    },
    pages: {
      features: {
        eyebrow: 'Product status',
        title: 'A project workspace foundation, with asset tools on the roadmap.',
        intro:
          'Spryxel is being developed for game asset projects. The current capability is the project workspace foundation; generation and export are not available.',
        currentTitle: 'Available today',
        currentBody: 'The project workspace foundation for creating and organizing projects.',
        plannedLabel: 'Planned',
        sections: [
          {
            title: 'Asset contracts',
            body: 'Planned structured asset briefs that describe requirements and intended outputs.',
          },
          {
            title: 'Durable jobs',
            body: 'Planned processing jobs designed to track work through its steps.',
          },
          {
            title: 'Generation and export',
            body: 'Planned capabilities. Neither asset generation nor export is available today.',
          },
        ],
      },
      howItWorks: {
        eyebrow: 'Planned workflow',
        title: 'A project-first path for game assets.',
        intro:
          'This is the intended workflow direction for Spryxel. Its later asset processing steps are planned and are not available yet.',
        plannedLabel: 'Planned',
        steps: [
          {
            title: 'Create a project workspace',
            body: 'Use the available project workspace foundation to give a game effort a home.',
          },
          {
            title: 'Write an asset contract',
            body: 'A planned contract will capture the brief and requirements for an asset.',
          },
          {
            title: 'Track durable jobs',
            body: 'Planned durable jobs will make processing status trackable across steps.',
          },
          {
            title: 'Generate and export',
            body: 'Generation and export are planned outcomes, not available capabilities.',
          },
        ],
        statusNote:
          'Today, only the project workspace foundation is available. Asset contracts, durable jobs, generation, and export remain planned.',
      },
      faq: {
        eyebrow: 'Answers',
        title: 'Frequently asked questions',
        intro: 'What is available now, and what is still planned for Spryxel?',
        items: [
          {
            question: 'What is Spryxel?',
            answer:
              'Spryxel is a focused workspace foundation for organizing game asset projects. Asset tooling is still being planned.',
          },
          {
            question: 'Can I generate or export assets now?',
            answer:
              'No. Asset generation and export are planned capabilities and are not currently available.',
          },
          {
            question: 'What can I use today?',
            answer:
              'The current capability is the project workspace foundation. Asset contracts and durable jobs are planned.',
          },
          {
            question: 'Where can I find support?',
            answer:
              'A verified contact or support channel has not been published yet. The contact page will be updated when one is available.',
          },
        ],
      },
      contact: {
        eyebrow: 'Contact',
        title: 'Stay tuned for verified contact details.',
        intro:
          'No public support channel has been confirmed for this page. We will publish contact details here when they are ready.',
        noteTitle: 'Contact information pending',
        noteBody:
          'This page does not list an email address, mailing address, or support channel because none has been verified for publication.',
      },
      legal: {
        terms: {
          title: 'Terms of service outline',
          draftNotice:
            'DRAFT — This outline is not final terms. It requires review and approval by the responsible legal owner before publication.',
          intro:
            'Use this outline to prepare terms from verified product and business information. Replace each placeholder after review.',
          sections: [
            {
              title: 'Service provider and scope',
              body: 'Placeholder: identify the responsible legal entity and describe the service and scope of these terms.',
            },
            {
              title: 'Eligibility and account responsibilities',
              body: 'Outline: confirm who may use the service and describe account responsibilities and acceptable use.',
            },
            {
              title: 'Availability and service changes',
              body: 'Placeholder: describe availability, support, and changes using confirmed product behavior.',
            },
            {
              title: 'Fees and cancellation',
              body: 'Placeholder: add verified billing, fee, renewal, and cancellation terms if they apply.',
            },
            {
              title: 'Intellectual property and user content',
              body: 'Outline: clarify rights, licenses, and user responsibilities after legal review.',
            },
            {
              title: 'Disclaimers and disputes',
              body: 'Placeholder: obtain legal review of warranty, liability, governing law, and dispute provisions.',
            },
            {
              title: 'Effective date and legal contact',
              body: 'Placeholder: add an approved effective date and verified legal contact before publication.',
            },
          ],
        },
        privacy: {
          title: 'Privacy notice outline',
          draftNotice:
            'DRAFT — This privacy outline is not a final notice. Do not publish it until privacy and legal reviewers verify it against actual data practices.',
          intro:
            'Document only data practices confirmed by a product and infrastructure review. No collection, sharing, or retention details are asserted here.',
          sections: [
            {
              title: 'Data collected and sources',
              body: 'Placeholder: list each confirmed category of personal data and how it is obtained.',
            },
            {
              title: 'Purposes and legal grounds',
              body: 'Placeholder: document each verified purpose and the applicable legal ground after review.',
            },
            {
              title: 'Processors and other recipients',
              body: 'Placeholder: identify confirmed service providers and recipients, and explain their roles.',
            },
            {
              title: 'International transfers',
              body: 'Placeholder: describe verified international transfers and safeguards, if any.',
            },
            {
              title: 'Retention and security',
              body: 'Placeholder: add verified retention periods or criteria and an accurate description of safeguards.',
            },
            {
              title: 'Privacy choices and rights',
              body: 'Outline: confirm applicable rights, choices, and request procedures for each relevant region.',
            },
            {
              title: 'Privacy contact and notice updates',
              body: 'Placeholder: add a verified privacy contact and explain how notice changes will be communicated.',
            },
          ],
        },
        cookies: {
          title: 'Cookie notice outline',
          draftNotice:
            'DRAFT — This cookie outline is not a final notice. Complete a technical audit and legal review before publication.',
          intro:
            'No cookie or similar-technology inventory is confirmed in this draft. Do not treat this outline as a statement about current site behavior.',
          sections: [
            {
              title: 'Verified inventory',
              body: 'Placeholder: list each cookie or similar technology confirmed by a technical audit, including its provider and purpose.',
            },
            {
              title: 'Duration and category',
              body: 'Placeholder: record the verified duration and category for each listed technology.',
            },
            {
              title: 'Consent and controls',
              body: 'Placeholder: describe verified consent behavior and available browser or site controls.',
            },
            {
              title: 'Updates and contact',
              body: 'Placeholder: add the review date, an approved update process, and a verified contact before publication.',
            },
          ],
        },
      },
    },
  },
  'pt-BR': {
    locale: 'pt-BR',
    shell: {
      nav: {
        home: 'Início',
        features: 'Recursos',
        howItWorks: 'Como funciona',
        faq: 'Perguntas frequentes',
        contact: 'Contato',
        signIn: 'Entrar',
        skipToContent: 'Pular para o conteúdo principal',
        menu: 'Abrir menu',
        closeMenu: 'Fechar menu',
      },
      theme: {
        switchToLight: 'Mudar para o tema claro',
        switchToDark: 'Mudar para o tema escuro',
      },
      locale: {
        label: 'Idioma',
        names: { en: 'English', 'pt-BR': 'Português (Brasil)', es: 'Español' },
      },
      footer: {
        tagline: 'Um espaço de trabalho focado em organizar projetos de recursos para jogos.',
        navigationTitle: 'Explore',
        legalTitle: 'Informações legais',
        contactTitle: 'Contato',
        contactNote:
          'Os dados de contato verificados serão publicados aqui quando estiverem disponíveis.',
        statusLabel: 'Status do produto',
        statusBody:
          'A base do espaço de trabalho de projetos está disponível. Contratos de recursos, tarefas duráveis, geração e exportação estão planejados.',
        copyright: '© Spryxel',
      },
    },
    metadata: {
      home: {
        title: 'Spryxel — Planeje projetos de recursos para jogos',
        description:
          'Conheça o Spryxel, uma base de espaço de trabalho focada em organizar projetos de recursos para jogos, com ferramentas futuras claramente planejadas.',
      },
      features: {
        title: 'Recursos — Spryxel',
        description:
          'Veja o que a base de espaço de trabalho do Spryxel oferece hoje e quais ferramentas para recursos de jogos ainda estão planejadas.',
      },
      'how-it-works': {
        title: 'Como funciona — Spryxel',
        description:
          'Conheça o fluxo planejado do Spryxel para organizar projetos de recursos para jogos, da configuração do projeto às futuras exportações.',
      },
      faq: {
        title: 'Perguntas frequentes — Spryxel',
        description:
          'Respostas sobre o espaço de trabalho de projetos do Spryxel, os recursos planejados e o status atual do produto.',
      },
      contact: {
        title: 'Contato — Spryxel',
        description:
          'Consulte o status atual dos contatos do Spryxel. Os dados de suporte verificados serão publicados quando estiverem disponíveis.',
      },
      terms: {
        title: 'Rascunho dos termos — Spryxel',
        description:
          'Estrutura preliminar dos futuros termos do Spryxel, sujeita à revisão jurídica e à confirmação dos detalhes do produto.',
      },
      privacy: {
        title: 'Rascunho de privacidade — Spryxel',
        description:
          'Estrutura preliminar do aviso de privacidade, que precisa ser revisada conforme as práticas de dados confirmadas do Spryxel.',
      },
      cookies: {
        title: 'Rascunho de cookies — Spryxel',
        description:
          'Estrutura preliminar do aviso de cookies, sujeita a auditoria técnica e revisão jurídica.',
      },
    },
    home: {
      hero: {
        eyebrow: 'Uma base para projetos de recursos de jogos',
        title: 'Um espaço claro para projetos de recursos de jogos.',
        description:
          'O Spryxel está criando um espaço de trabalho focado em organizar projetos de recursos para jogos. A base do espaço de trabalho de projetos está disponível; definições de recursos, processamento durável, geração e exportação ainda estão planejados.',
        primaryCta: 'Explore os recursos',
        secondaryCta: 'Veja o fluxo planejado',
        image: '/public-site/images/hero-key-visual.webp',
        imageAlt:
          'Arte de fantasia com um espírito de raposa em uma ilha florestal e uma viajante encapuzada sobre um fundo ameixa.',
      },
      trust: {
        title: 'Uma base clara, pronta para crescer',
        description:
          'O Spryxel está sendo desenvolvido com foco na organização útil de projetos e em uma descrição direta do que está pronto e do que ainda vem pela frente.',
        principles: [
          {
            title: 'Primeiro, o espaço de trabalho',
            body: 'A base atual é um espaço de trabalho para criar e organizar projetos.',
          },
          {
            title: 'Status claro do produto',
            body: 'As ferramentas planejadas são identificadas como planejadas, incluindo contratos de recursos, tarefas duráveis, geração e exportação.',
          },
          {
            title: 'Foco em recursos para jogos',
            body: 'As categorias planejadas abrangem personagens, sprites, mobs, itens, mapas e arte de interface.',
          },
        ],
      },
      categories: {
        title: 'Categorias de recursos para jogos no roteiro',
        description:
          'Estas categorias descrevem o escopo pretendido. Todas estão planejadas e ainda não são ferramentas disponíveis de geração ou exportação.',
        plannedLabel: 'Planejado',
        items: {
          characters: {
            title: 'Personagens',
            description: 'Conceitos, visuais e variações de personagens para um projeto de jogo.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-characters.webp',
            alt: 'Aventureira raposa encapuzada com uma lanterna turquesa em uma floresta ao luar.',
          },
          sprites: {
            title: 'Sprites',
            description: 'Arte de sprites e conjuntos de animação para futuros fluxos de projeto.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-sprites.webp',
            alt: 'Ilustração de uma folha de sprites em pixel art.',
          },
          mobs: {
            title: 'Mobs',
            description:
              'Conceitos de inimigos e criaturas organizados em torno de um mundo de jogo.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-mobs.webp',
            alt: 'Guardião da floresta coberto de musgo, com galhadas brilhantes ao lado de uma cachoeira.',
          },
          items: {
            title: 'Itens',
            description: 'Equipamentos, colecionáveis e outros conceitos de objetos do jogo.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-items.webp',
            alt: 'Cristal brilhante, poção violeta, chave ornamentada e um pequeno amuleto lunar.',
          },
          maps: {
            title: 'Mapas',
            description: 'Arte de mundos, fases e locais planejada para futuros fluxos de projeto.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-maps.webp',
            alt: 'Ilha florestal flutuante com ruínas antigas, caminhos sinuosos e cachoeiras.',
          },
          uiHud: {
            title: 'UI e HUD',
            description: 'Arte de interface do usuário e de heads-up display para jogos.',
            status: 'planned',
            statusLabel: 'Planejado',
            image: '/public-site/images/category-ui-hud.webp',
            alt: 'Conceitos de HUD de fantasia com bússola ornamentada, cristais em forma de coração, medidor vazio e espaços emoldurados.',
          },
        },
      },
      workflow: {
        title: 'Um fluxo em desenvolvimento',
        description:
          'As etapas a seguir descrevem a direção planejada. Hoje, apenas a base do espaço de trabalho de projetos está disponível.',
        plannedLabel: 'Fluxo planejado',
        steps: [
          {
            title: 'Organize um projeto',
            body: 'Comece em um espaço de trabalho de projeto para manter um esforço de jogo em um só lugar.',
          },
          {
            title: 'Defina os recursos',
            body: 'Contratos de recursos planejados tornarão explícitos o briefing e os requisitos de cada recurso.',
          },
          {
            title: 'Execute tarefas duráveis',
            body: 'Tarefas de processamento duráveis estão planejadas para acompanhar o trabalho ao longo do fluxo.',
          },
          {
            title: 'Gere e exporte',
            body: 'Geração e exportação são recursos planejados e ainda não estão disponíveis.',
          },
        ],
      },
      status: {
        label: 'Status atual',
        title: 'A base do espaço de trabalho de projetos está disponível.',
        currentBody:
          'Atualmente, o Spryxel oferece uma base para espaços de trabalho de projetos. Isso não inclui geração ou exportação de recursos.',
        plannedTitle: 'Mais ferramentas para recursos estão planejadas',
        plannedBody:
          'O roteiro inclui contratos de recursos e tarefas duráveis, seguidos por geração e exportação. Esses recursos ainda não estão disponíveis.',
        plannedItems: [
          {
            title: 'Contratos de recursos',
            body: 'Definições estruturadas planejadas para briefings e requisitos de recursos.',
          },
          {
            title: 'Tarefas duráveis',
            body: 'Processamento planejado para acompanhar o trabalho de recursos em várias etapas.',
          },
          {
            title: 'Geração e exportação',
            body: 'Resultados planejados; geração e exportação não estão disponíveis hoje.',
          },
        ],
      },
      faq: {
        title: 'Perguntas comuns',
        description: 'Um guia rápido sobre a base do produto e sua direção planejada.',
        items: [
          {
            question: 'O que é o Spryxel?',
            answer:
              'O Spryxel é uma base de espaço de trabalho focada em organizar projetos de recursos para jogos. As ferramentas para recursos ainda estão sendo planejadas.',
          },
          {
            question: 'Já posso gerar ou exportar recursos?',
            answer:
              'Não. A geração e a exportação de recursos são capacidades planejadas e ainda não estão disponíveis.',
          },
          {
            question: 'O que posso usar hoje?',
            answer:
              'A capacidade atual é a base do espaço de trabalho de projetos. Contratos de recursos e tarefas duráveis estão planejados.',
          },
          {
            question: 'Onde encontro suporte?',
            answer:
              'Um contato verificado ou canal de suporte ainda não foi publicado. A página de contato será atualizada quando houver um.',
          },
        ],
      },
      cta: {
        title: 'Comece com um espaço de trabalho de projeto',
        body: 'Explore a base atual e os recursos para jogos planejados para o desenvolvimento futuro.',
        primaryCta: 'Explore os recursos',
        secondaryCta: 'Leia as perguntas frequentes',
      },
    },
    pages: {
      features: {
        eyebrow: 'Status do produto',
        title:
          'Uma base de espaço de trabalho de projetos, com ferramentas para recursos no roteiro.',
        intro:
          'O Spryxel está sendo desenvolvido para projetos de recursos de jogos. A capacidade atual é a base do espaço de trabalho de projetos; geração e exportação não estão disponíveis.',
        currentTitle: 'Disponível hoje',
        currentBody: 'A base do espaço de trabalho de projetos para criar e organizar projetos.',
        plannedLabel: 'Planejado',
        sections: [
          {
            title: 'Contratos de recursos',
            body: 'Briefings estruturados planejados para descrever requisitos e resultados esperados de recursos.',
          },
          {
            title: 'Tarefas duráveis',
            body: 'Tarefas de processamento planejadas para acompanhar o trabalho em cada etapa.',
          },
          {
            title: 'Geração e exportação',
            body: 'Recursos planejados. A geração e a exportação de recursos ainda não estão disponíveis.',
          },
        ],
      },
      howItWorks: {
        eyebrow: 'Fluxo planejado',
        title: 'Um caminho para recursos de jogos que começa pelo projeto.',
        intro:
          'Esta é a direção pretendida para o fluxo do Spryxel. As etapas posteriores de processamento de recursos estão planejadas e ainda não estão disponíveis.',
        plannedLabel: 'Planejado',
        steps: [
          {
            title: 'Crie um espaço de trabalho de projeto',
            body: 'Use a base disponível do espaço de trabalho de projetos para dar um lugar a um esforço de jogo.',
          },
          {
            title: 'Escreva um contrato de recurso',
            body: 'Um contrato planejado registrará o briefing e os requisitos de um recurso.',
          },
          {
            title: 'Acompanhe tarefas duráveis',
            body: 'Tarefas duráveis planejadas permitirão acompanhar o status do processamento entre etapas.',
          },
          {
            title: 'Gere e exporte',
            body: 'Geração e exportação são resultados planejados, não recursos disponíveis.',
          },
        ],
        statusNote:
          'Hoje, apenas a base do espaço de trabalho de projetos está disponível. Contratos de recursos, tarefas duráveis, geração e exportação continuam planejados.',
      },
      faq: {
        eyebrow: 'Respostas',
        title: 'Perguntas frequentes',
        intro: 'O que está disponível agora e o que ainda está planejado para o Spryxel?',
        items: [
          {
            question: 'O que é o Spryxel?',
            answer:
              'O Spryxel é uma base de espaço de trabalho focada em organizar projetos de recursos para jogos. As ferramentas para recursos ainda estão sendo planejadas.',
          },
          {
            question: 'Já posso gerar ou exportar recursos?',
            answer:
              'Não. A geração e a exportação de recursos são capacidades planejadas e ainda não estão disponíveis.',
          },
          {
            question: 'O que posso usar hoje?',
            answer:
              'A capacidade atual é a base do espaço de trabalho de projetos. Contratos de recursos e tarefas duráveis estão planejados.',
          },
          {
            question: 'Onde encontro suporte?',
            answer:
              'Um contato verificado ou canal de suporte ainda não foi publicado. A página de contato será atualizada quando houver um.',
          },
        ],
      },
      contact: {
        eyebrow: 'Contato',
        title: 'Aguarde os dados de contato verificados.',
        intro:
          'Nenhum canal público de suporte foi confirmado para esta página. Publicaremos os dados de contato aqui quando estiverem prontos.',
        noteTitle: 'Informações de contato pendentes',
        noteBody:
          'Esta página não lista endereço de e-mail, endereço postal ou canal de suporte, pois nenhum foi verificado para publicação.',
      },
      legal: {
        terms: {
          title: 'Estrutura dos termos de serviço',
          draftNotice:
            'RASCUNHO — Esta estrutura não representa os termos finais. Ela precisa de revisão e aprovação da pessoa responsável pela área jurídica antes da publicação.',
          intro:
            'Use esta estrutura para preparar os termos com informações verificadas sobre o produto e a empresa. Substitua cada marcador após a revisão.',
          sections: [
            {
              title: 'Prestador do serviço e escopo',
              body: 'Marcador: identifique a entidade jurídica responsável e descreva o serviço e o escopo destes termos.',
            },
            {
              title: 'Elegibilidade e responsabilidades da conta',
              body: 'Estrutura: confirme quem pode usar o serviço e descreva as responsabilidades da conta e o uso aceitável.',
            },
            {
              title: 'Disponibilidade e mudanças no serviço',
              body: 'Marcador: descreva disponibilidade, suporte e mudanças com base no comportamento confirmado do produto.',
            },
            {
              title: 'Taxas e cancelamento',
              body: 'Marcador: inclua termos verificados de cobrança, taxas, renovação e cancelamento, se aplicáveis.',
            },
            {
              title: 'Propriedade intelectual e conteúdo do usuário',
              body: 'Estrutura: esclareça direitos, licenças e responsabilidades dos usuários após revisão jurídica.',
            },
            {
              title: 'Isenções e disputas',
              body: 'Marcador: solicite revisão jurídica das disposições sobre garantias, responsabilidade, lei aplicável e disputas.',
            },
            {
              title: 'Data de vigência e contato jurídico',
              body: 'Marcador: inclua uma data de vigência aprovada e um contato jurídico verificado antes da publicação.',
            },
          ],
        },
        privacy: {
          title: 'Estrutura do aviso de privacidade',
          draftNotice:
            'RASCUNHO — Esta estrutura de privacidade não é um aviso final. Não publique até que as pessoas responsáveis por privacidade e jurídico confirmem as práticas reais de dados.',
          intro:
            'Documente apenas práticas de dados confirmadas por uma revisão do produto e da infraestrutura. Nenhum detalhe de coleta, compartilhamento ou retenção é afirmado aqui.',
          sections: [
            {
              title: 'Dados coletados e fontes',
              body: 'Marcador: liste cada categoria confirmada de dados pessoais e como ela é obtida.',
            },
            {
              title: 'Finalidades e bases legais',
              body: 'Marcador: documente cada finalidade verificada e a base legal aplicável após revisão.',
            },
            {
              title: 'Operadores e outros destinatários',
              body: 'Marcador: identifique prestadores e destinatários confirmados e explique seus papéis.',
            },
            {
              title: 'Transferências internacionais',
              body: 'Marcador: descreva transferências internacionais verificadas e as salvaguardas, se houver.',
            },
            {
              title: 'Retenção e segurança',
              body: 'Marcador: adicione períodos ou critérios de retenção verificados e uma descrição precisa das medidas de proteção.',
            },
            {
              title: 'Opções e direitos de privacidade',
              body: 'Estrutura: confirme os direitos, as opções e os procedimentos de solicitação aplicáveis em cada região relevante.',
            },
            {
              title: 'Contato de privacidade e atualizações do aviso',
              body: 'Marcador: adicione um contato de privacidade verificado e explique como as mudanças no aviso serão comunicadas.',
            },
          ],
        },
        cookies: {
          title: 'Estrutura do aviso de cookies',
          draftNotice:
            'RASCUNHO — Esta estrutura de cookies não é um aviso final. Faça uma auditoria técnica e uma revisão jurídica antes da publicação.',
          intro:
            'Este rascunho não confirma nenhum inventário de cookies ou tecnologia semelhante. Não o trate como uma declaração sobre o comportamento atual do site.',
          sections: [
            {
              title: 'Inventário verificado',
              body: 'Marcador: liste cada cookie ou tecnologia semelhante confirmada por uma auditoria técnica, incluindo fornecedor e finalidade.',
            },
            {
              title: 'Duração e categoria',
              body: 'Marcador: registre a duração e a categoria verificadas de cada tecnologia listada.',
            },
            {
              title: 'Consentimento e controles',
              body: 'Marcador: descreva o comportamento de consentimento confirmado e os controles disponíveis no navegador ou no site.',
            },
            {
              title: 'Atualizações e contato',
              body: 'Marcador: inclua a data da revisão, um processo de atualização aprovado e um contato verificado antes da publicação.',
            },
          ],
        },
      },
    },
  },
  es: {
    locale: 'es',
    shell: {
      nav: {
        home: 'Inicio',
        features: 'Funciones',
        howItWorks: 'Cómo funciona',
        faq: 'Preguntas frecuentes',
        contact: 'Contacto',
        signIn: 'Iniciar sesión',
        skipToContent: 'Saltar al contenido principal',
        menu: 'Abrir menú',
        closeMenu: 'Cerrar menú',
      },
      theme: {
        switchToLight: 'Cambiar al tema claro',
        switchToDark: 'Cambiar al tema oscuro',
      },
      locale: {
        label: 'Idioma',
        names: { en: 'English', 'pt-BR': 'Português (Brasil)', es: 'Español' },
      },
      footer: {
        tagline:
          'Un espacio de trabajo dedicado a organizar proyectos de recursos para videojuegos.',
        navigationTitle: 'Explorar',
        legalTitle: 'Legal',
        contactTitle: 'Contacto',
        contactNote:
          'Los datos de contacto verificados se publicarán aquí cuando estén disponibles.',
        statusLabel: 'Estado del producto',
        statusBody:
          'La base del espacio de trabajo de proyectos está disponible. Los contratos de recursos, las tareas duraderas, la generación y la exportación están planificados.',
        copyright: '© Spryxel',
      },
    },
    metadata: {
      home: {
        title: 'Spryxel — Planifica proyectos de recursos para videojuegos',
        description:
          'Descubre Spryxel, una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos, con herramientas futuras claramente planificadas.',
      },
      features: {
        title: 'Funciones — Spryxel',
        description:
          'Consulta qué ofrece hoy la base del espacio de trabajo de Spryxel y qué herramientas para recursos de videojuegos siguen planificadas.',
      },
      'how-it-works': {
        title: 'Cómo funciona — Spryxel',
        description:
          'Conoce el flujo planificado de Spryxel para organizar proyectos de recursos para videojuegos, desde la configuración del proyecto hasta futuras exportaciones.',
      },
      faq: {
        title: 'Preguntas frecuentes — Spryxel',
        description:
          'Respuestas sobre el espacio de trabajo de proyectos de Spryxel, las funciones planificadas y el estado actual del producto.',
      },
      contact: {
        title: 'Contacto — Spryxel',
        description:
          'Consulta el estado actual del contacto con Spryxel. Los datos de soporte verificados se publicarán cuando estén disponibles.',
      },
      terms: {
        title: 'Borrador de condiciones — Spryxel',
        description:
          'Esquema preliminar de las futuras condiciones de Spryxel, pendiente de revisión legal y de verificar los detalles del producto.',
      },
      privacy: {
        title: 'Borrador de privacidad — Spryxel',
        description:
          'Esquema preliminar del aviso de privacidad, que debe revisarse según las prácticas de datos confirmadas de Spryxel.',
      },
      cookies: {
        title: 'Borrador de cookies — Spryxel',
        description:
          'Esquema preliminar del aviso de cookies, pendiente de una auditoría técnica y revisión legal.',
      },
    },
    home: {
      hero: {
        eyebrow: 'Una base para proyectos de recursos de videojuegos',
        title: 'Un espacio claro para proyectos de recursos de videojuegos.',
        description:
          'Spryxel está creando un espacio de trabajo dedicado a organizar proyectos de recursos para videojuegos. La base del espacio de trabajo de proyectos está disponible; las definiciones de recursos, el procesamiento duradero, la generación y la exportación siguen planificados.',
        primaryCta: 'Explorar las funciones',
        secondaryCta: 'Ver el flujo planificado',
        image: '/public-site/images/hero-key-visual.webp',
        imageAlt:
          'Arte de fantasía con un espíritu de zorro en una isla boscosa y una viajera encapuchada sobre un fondo ciruela.',
      },
      trust: {
        title: 'Una base clara, lista para crecer',
        description:
          'Spryxel se está desarrollando para organizar proyectos de forma útil y explicar claramente qué está listo y qué queda por hacer.',
        principles: [
          {
            title: 'Primero, el espacio de trabajo',
            body: 'La base actual es un espacio de trabajo para crear y organizar proyectos.',
          },
          {
            title: 'Estado claro del producto',
            body: 'Las herramientas planificadas se identifican como tales, incluidos los contratos de recursos, las tareas duraderas, la generación y la exportación.',
          },
          {
            title: 'Enfoque en recursos de videojuegos',
            body: 'Las categorías planificadas abarcan personajes, sprites, mobs, objetos, mapas y arte de interfaz.',
          },
        ],
      },
      categories: {
        title: 'Categorías de recursos de videojuegos en la hoja de ruta',
        description:
          'Estas categorías describen el alcance previsto. Todas están planificadas y todavía no son herramientas disponibles de generación o exportación.',
        plannedLabel: 'Planificado',
        items: {
          characters: {
            title: 'Personajes',
            description:
              'Conceptos, apariencias y variaciones de personajes para un proyecto de videojuego.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-characters.webp',
            alt: 'Aventurera zorro encapuchada con una linterna turquesa en un bosque bajo la luna.',
          },
          sprites: {
            title: 'Sprites',
            description:
              'Arte de sprites y conjuntos de animación para futuros flujos de proyectos.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-sprites.webp',
            alt: 'Ilustración de una hoja de sprites en pixel art.',
          },
          mobs: {
            title: 'Mobs',
            description:
              'Conceptos de enemigos y criaturas organizados en torno a un mundo de juego.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-mobs.webp',
            alt: 'Guardián del bosque cubierto de musgo, con astas brillantes junto a una cascada.',
          },
          items: {
            title: 'Objetos',
            description: 'Equipo, coleccionables y otros conceptos de objetos del juego.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-items.webp',
            alt: 'Cristal luminoso, poción violeta, llave ornamentada y un pequeño amuleto lunar.',
          },
          maps: {
            title: 'Mapas',
            description:
              'Arte de mundos, niveles y lugares planificado para futuros flujos de proyectos.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-maps.webp',
            alt: 'Isla boscosa flotante con ruinas antiguas, caminos sinuosos y cascadas.',
          },
          uiHud: {
            title: 'UI y HUD',
            description: 'Arte de interfaz de usuario y pantalla de juego para videojuegos.',
            status: 'planned',
            statusLabel: 'Planificado',
            image: '/public-site/images/category-ui-hud.webp',
            alt: 'Conceptos de HUD fantástico con brújula ornamentada, cristales de corazón, medidor vacío y espacios enmarcados.',
          },
        },
      },
      workflow: {
        title: 'Un flujo en desarrollo',
        description:
          'Los siguientes pasos describen la dirección planificada. Hoy solo está disponible la base del espacio de trabajo de proyectos.',
        plannedLabel: 'Flujo planificado',
        steps: [
          {
            title: 'Organizar un proyecto',
            body: 'Empezar desde un espacio de trabajo de proyecto para mantener un proyecto de videojuego en un solo lugar.',
          },
          {
            title: 'Definir los recursos',
            body: 'Los contratos de recursos planificados harán explícitos el resumen y los requisitos de cada recurso.',
          },
          {
            title: 'Ejecutar tareas duraderas',
            body: 'Se planifican tareas de procesamiento duraderas para seguir el trabajo a lo largo del flujo.',
          },
          {
            title: 'Generar y exportar',
            body: 'La generación y la exportación son funciones planificadas y aún no están disponibles.',
          },
        ],
      },
      status: {
        label: 'Estado actual',
        title: 'La base del espacio de trabajo de proyectos está disponible.',
        currentBody:
          'Actualmente, Spryxel ofrece una base para espacios de trabajo de proyectos. Esto no incluye la generación ni la exportación de recursos.',
        plannedTitle: 'Hay más herramientas para recursos planificadas',
        plannedBody:
          'La hoja de ruta incluye contratos de recursos y tareas duraderas, seguidos de generación y exportación. Estas funciones aún no están disponibles.',
        plannedItems: [
          {
            title: 'Contratos de recursos',
            body: 'Definiciones estructuradas planificadas para resúmenes y requisitos de recursos.',
          },
          {
            title: 'Tareas duraderas',
            body: 'Procesamiento planificado para seguir el trabajo de recursos a través de varios pasos.',
          },
          {
            title: 'Generación y exportación',
            body: 'Resultados planificados; la generación y la exportación no están disponibles hoy.',
          },
        ],
      },
      faq: {
        title: 'Preguntas habituales',
        description: 'Una guía rápida sobre la base del producto y su dirección planificada.',
        items: [
          {
            question: '¿Qué es Spryxel?',
            answer:
              'Spryxel es una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos. Las herramientas para recursos siguen planificándose.',
          },
          {
            question: '¿Ya puedo generar o exportar recursos?',
            answer:
              'No. La generación y la exportación de recursos son funciones planificadas y todavía no están disponibles.',
          },
          {
            question: '¿Qué puedo usar hoy?',
            answer:
              'La función actual es la base del espacio de trabajo de proyectos. Los contratos de recursos y las tareas duraderas están planificados.',
          },
          {
            question: '¿Dónde puedo encontrar soporte?',
            answer:
              'Todavía no se ha publicado un contacto verificado ni un canal de soporte. La página de contacto se actualizará cuando haya uno disponible.',
          },
        ],
      },
      cta: {
        title: 'Empieza con un espacio de trabajo de proyecto',
        body: 'Explora la base actual y las funciones para recursos planificadas para el desarrollo futuro.',
        primaryCta: 'Explorar las funciones',
        secondaryCta: 'Leer las preguntas frecuentes',
      },
    },
    pages: {
      features: {
        eyebrow: 'Estado del producto',
        title:
          'Una base de espacio de trabajo de proyectos, con herramientas para recursos en la hoja de ruta.',
        intro:
          'Spryxel se está desarrollando para proyectos de recursos de videojuegos. La función actual es la base del espacio de trabajo de proyectos; la generación y la exportación no están disponibles.',
        currentTitle: 'Disponible hoy',
        currentBody:
          'La base del espacio de trabajo de proyectos para crear y organizar proyectos.',
        plannedLabel: 'Planificado',
        sections: [
          {
            title: 'Contratos de recursos',
            body: 'Resúmenes estructurados planificados para describir requisitos y resultados previstos de los recursos.',
          },
          {
            title: 'Tareas duraderas',
            body: 'Tareas de procesamiento planificadas para seguir el trabajo a lo largo de sus pasos.',
          },
          {
            title: 'Generación y exportación',
            body: 'Funciones planificadas. La generación y la exportación de recursos no están disponibles hoy.',
          },
        ],
      },
      howItWorks: {
        eyebrow: 'Flujo planificado',
        title: 'Un camino para recursos de videojuegos que empieza por el proyecto.',
        intro:
          'Esta es la dirección prevista para el flujo de Spryxel. Sus etapas posteriores de procesamiento de recursos están planificadas y aún no están disponibles.',
        plannedLabel: 'Planificado',
        steps: [
          {
            title: 'Crear un espacio de trabajo de proyecto',
            body: 'Usa la base disponible del espacio de trabajo de proyectos para dar un lugar a un proyecto de videojuego.',
          },
          {
            title: 'Escribir un contrato de recurso',
            body: 'Un contrato planificado recogerá el resumen y los requisitos de un recurso.',
          },
          {
            title: 'Seguir tareas duraderas',
            body: 'Las tareas duraderas planificadas permitirán seguir el estado del procesamiento entre pasos.',
          },
          {
            title: 'Generar y exportar',
            body: 'La generación y la exportación son resultados planificados, no funciones disponibles.',
          },
        ],
        statusNote:
          'Hoy solo está disponible la base del espacio de trabajo de proyectos. Los contratos de recursos, las tareas duraderas, la generación y la exportación siguen planificados.',
      },
      faq: {
        eyebrow: 'Respuestas',
        title: 'Preguntas frecuentes',
        intro: '¿Qué está disponible ahora y qué sigue planificado para Spryxel?',
        items: [
          {
            question: '¿Qué es Spryxel?',
            answer:
              'Spryxel es una base de espacio de trabajo dedicada a organizar proyectos de recursos para videojuegos. Las herramientas para recursos siguen planificándose.',
          },
          {
            question: '¿Ya puedo generar o exportar recursos?',
            answer:
              'No. La generación y la exportación de recursos son funciones planificadas y todavía no están disponibles.',
          },
          {
            question: '¿Qué puedo usar hoy?',
            answer:
              'La función actual es la base del espacio de trabajo de proyectos. Los contratos de recursos y las tareas duraderas están planificados.',
          },
          {
            question: '¿Dónde puedo encontrar soporte?',
            answer:
              'Todavía no se ha publicado un contacto verificado ni un canal de soporte. La página de contacto se actualizará cuando haya uno disponible.',
          },
        ],
      },
      contact: {
        eyebrow: 'Contacto',
        title: 'Pronto publicaremos datos de contacto verificados.',
        intro:
          'No se ha confirmado ningún canal público de soporte para esta página. Publicaremos aquí los datos de contacto cuando estén listos.',
        noteTitle: 'Información de contacto pendiente',
        noteBody:
          'Esta página no incluye un correo electrónico, una dirección postal ni un canal de soporte porque ninguno se ha verificado para su publicación.',
      },
      legal: {
        terms: {
          title: 'Esquema de las condiciones del servicio',
          draftNotice:
            'BORRADOR — Este esquema no constituye las condiciones finales. Requiere revisión y aprobación de la persona responsable del área legal antes de publicarse.',
          intro:
            'Usa este esquema para preparar condiciones con información verificada del producto y del negocio. Sustituye cada marcador después de revisarlo.',
          sections: [
            {
              title: 'Proveedor del servicio y alcance',
              body: 'Marcador: identifica la entidad legal responsable y describe el servicio y el alcance de estas condiciones.',
            },
            {
              title: 'Requisitos y responsabilidades de la cuenta',
              body: 'Esquema: confirma quién puede usar el servicio y describe las responsabilidades de la cuenta y el uso aceptable.',
            },
            {
              title: 'Disponibilidad y cambios del servicio',
              body: 'Marcador: describe la disponibilidad, el soporte y los cambios según el funcionamiento confirmado del producto.',
            },
            {
              title: 'Tarifas y cancelación',
              body: 'Marcador: añade condiciones verificadas de facturación, tarifas, renovación y cancelación, si corresponden.',
            },
            {
              title: 'Propiedad intelectual y contenido del usuario',
              body: 'Esquema: aclara los derechos, las licencias y las responsabilidades de los usuarios tras una revisión legal.',
            },
            {
              title: 'Exenciones y disputas',
              body: 'Marcador: solicita una revisión legal de las disposiciones sobre garantías, responsabilidad, legislación aplicable y disputas.',
            },
            {
              title: 'Fecha de entrada en vigor y contacto legal',
              body: 'Marcador: añade una fecha de entrada en vigor aprobada y un contacto legal verificado antes de publicarlo.',
            },
          ],
        },
        privacy: {
          title: 'Esquema del aviso de privacidad',
          draftNotice:
            'BORRADOR — Este esquema de privacidad no es un aviso final. No lo publiques hasta que las personas responsables de privacidad y legal lo verifiquen con las prácticas reales de datos.',
          intro:
            'Documenta únicamente las prácticas de datos confirmadas mediante una revisión del producto y la infraestructura. Aquí no se afirma ningún detalle de recopilación, divulgación ni conservación.',
          sections: [
            {
              title: 'Datos recopilados y fuentes',
              body: 'Marcador: enumera cada categoría confirmada de datos personales y cómo se obtiene.',
            },
            {
              title: 'Fines y bases jurídicas',
              body: 'Marcador: documenta cada finalidad verificada y la base jurídica aplicable después de revisarla.',
            },
            {
              title: 'Encargados y otros destinatarios',
              body: 'Marcador: identifica a los proveedores de servicios y destinatarios confirmados y explica sus funciones.',
            },
            {
              title: 'Transferencias internacionales',
              body: 'Marcador: describe las transferencias internacionales verificadas y las salvaguardas, si las hay.',
            },
            {
              title: 'Conservación y seguridad',
              body: 'Marcador: añade los periodos o criterios de conservación verificados y una descripción precisa de las medidas de seguridad.',
            },
            {
              title: 'Opciones y derechos de privacidad',
              body: 'Esquema: confirma los derechos, las opciones y los procedimientos de solicitud aplicables en cada región pertinente.',
            },
            {
              title: 'Contacto de privacidad y cambios del aviso',
              body: 'Marcador: añade un contacto de privacidad verificado y explica cómo se comunicarán los cambios del aviso.',
            },
          ],
        },
        cookies: {
          title: 'Esquema del aviso de cookies',
          draftNotice:
            'BORRADOR — Este esquema de cookies no es un aviso final. Completa una auditoría técnica y una revisión legal antes de publicarlo.',
          intro:
            'Este borrador no confirma ningún inventario de cookies o tecnologías similares. No lo interpretes como una afirmación sobre el comportamiento actual del sitio.',
          sections: [
            {
              title: 'Inventario verificado',
              body: 'Marcador: enumera cada cookie o tecnología similar confirmada mediante una auditoría técnica, incluido su proveedor y finalidad.',
            },
            {
              title: 'Duración y categoría',
              body: 'Marcador: registra la duración y la categoría verificadas de cada tecnología enumerada.',
            },
            {
              title: 'Consentimiento y controles',
              body: 'Marcador: describe el comportamiento de consentimiento verificado y los controles disponibles en el navegador o el sitio.',
            },
            {
              title: 'Cambios y contacto',
              body: 'Marcador: añade la fecha de revisión, un proceso de actualización aprobado y un contacto verificado antes de publicarlo.',
            },
          ],
        },
      },
    },
  },
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
