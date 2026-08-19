/** English overlay for seeded catalog simulations, keyed by original title. */

export interface CatalogQuestionEn {
  question: string
  options?: string[]
}

export interface CatalogSimEn {
  title: string
  description: string
  role_type: string
  questions: Record<string, CatalogQuestionEn>
}

export const CATALOG_EN: Record<string, CatalogSimEn> = {
  'Investment Banking Analyst': {
    title: 'Investment Banking Analyst',
    role_type: 'Investment Banking',
    description:
      'Simulate an analyst role on PASHA Bank’s Corporate Finance team. Real tasks covering M&A valuation, DCF modelling, and investor pitch preparation.',
    questions: {
      q1: {
        question:
          'PASHA Bank is evaluating the acquisition of a regional logistics company valued at AZN 120 million. Which 5 key assumptions would you choose for the DCF model, and why?',
      },
      q2: {
        question: 'When the cost of equity rises in the capital structure while calculating WACC, what happens?',
        options: [
          'The discount rate rises and DCF value falls',
          'The discount rate falls and DCF value rises',
          'EBITDA is unchanged and enterprise value rises',
          'Terminal value is reset to zero',
        ],
      },
      q3: {
        question:
          'Prepare a 3-minute pitch to the investment committee: why is this acquisition a strategic fit for PASHA Bank? (Risk, synergy, exit.)',
      },
      q4: {
        question:
          'During due diligence you find the target’s revenue declined 22% over 18 months. How would you incorporate this into the valuation model?',
      },
    },
  },
  'Audit & Assurance Associate': {
    title: 'Audit & Assurance Associate',
    role_type: 'Audit',
    description:
      'Work as a junior associate in Deloitte’s audit practice. Review financial statements, test internal controls, and brief the client.',
    questions: {
      q1: {
        question:
          'When auditing revenue recognition for a client in oilfield services, which 4 risk areas would you focus on?',
      },
      q2: {
        question: 'Materiality in audit planning is determined primarily by what?',
        options: [
          'How much a misstatement would affect the financial statements',
          '100% of the client’s annual profit',
          'The size of the audit team',
          'The prior year’s audit opinion',
        ],
      },
      q3: {
        question:
          'During the inventory count you found a AZN 2.3 million discrepancy. Write a memo to the audit manager (issue, impact, recommendation).',
      },
      q4: {
        question: 'Under ISA 315, which procedures would you apply to entity-level internal controls?',
      },
    },
  },
  'Petroleum Engineering Graduate': {
    title: 'Petroleum Engineering Graduate',
    role_type: 'Engineering',
    description:
      'Prepare for SOCAR’s field engineer graduate programme. Production optimisation, safety protocols, and technical reporting.',
    questions: {
      q1: {
        question:
          'Daily production at the Gunashli field has dropped 4.2%. What diagnostic steps would you take in the first 24 hours?',
      },
      q2: {
        question: 'On a field with H2S risk, what is the personal-protection priority?',
        options: [
          'SCBA (Self-Contained Breathing Apparatus) + gas monitor',
          'Hard hat and safety shoes only',
          'Evacuation plan only',
          'Visual inspection is enough',
        ],
      },
      q3: {
        question:
          'Water cut has risen from 38% to 51%. Outline the structure of a short technical report for the reservoir engineer.',
      },
      q4: {
        question: 'How would you justify an ESP pump upgrade for an energy-efficiency project in ROI terms?',
      },
    },
  },
  'Network Operations Intern': {
    title: 'Network Operations Intern',
    role_type: 'Telecom Operations',
    description:
      'Simulate an intern role on Bakcell’s NOC team. Network performance, incident response, and managing customer impact.',
    questions: {
      q1: {
        question:
          '4G latency in central Baku has risen to 180ms and complaints are increasing. What information would you include when opening an incident ticket?',
      },
      q2: {
        question: 'When there is a risk of an SLA breach, what is the first priority?',
        options: [
          'Reduce critical service impact and isolate the root cause',
          'Only apologise to the customer',
          'Close the ticket',
          'Inform the marketing team',
        ],
      },
      q3: {
        question:
          'Urgent maintenance must be scheduled: write the affected region, estimated downtime, and a customer communications plan.',
      },
    },
  },
  'Corporate Banking Associate': {
    title: 'Corporate Banking Associate',
    role_type: 'Corporate Banking',
    description:
      'SME credit analysis, risk assessment, and client relationship work in ABB Corporate Banking.',
    questions: {
      q1: {
        question:
          'A manufacturing firm with AZN 12 million annual turnover wants a AZN 3 million loan. Which financial metrics would you present to the credit committee?',
      },
      q2: {
        question: 'If DSCR (Debt Service Coverage Ratio) is 1.1, what does that mean?',
        options: [
          'Debt service is close to earnings — risk is high',
          'The company has no debt',
          'The loan must be approved',
          'No collateral is required',
        ],
      },
      q3: {
        question:
          'The client says cash flow is seasonal. How would you design the covenant structure?',
      },
    },
  },
  'Brand Marketing Intern': {
    title: 'Brand Marketing Intern',
    role_type: 'Brand Marketing',
    description:
      'Brand campaign planning, trade marketing, and consumer insight analysis at Coca-Cola İçecek Azerbaijan.',
    questions: {
      q1: {
        question:
          'Design a summer campaign to grow Coca-Cola Zero share of throat: target audience, channel mix, and KPIs.',
      },
      q2: {
        question: 'In brand health tracking, what does “Top of Mind” measure?',
        options: [
          'The first brand recalled',
          'The last product purchased',
          'Discount percentage',
          'Distribution breadth',
        ],
      },
      q3: {
        question:
          'A competitor has launched a 20% discount. Which non-price tactics would you use without matching on price?',
      },
    },
  },
  'Risk Management Analyst': {
    title: 'Risk Management Analyst',
    role_type: 'Risk Management',
    description:
      'Credit-risk modelling, stress testing, and regulatory reporting in Unibank’s Risk department.',
    questions: {
      q1: {
        question:
          '90+ day delinquency in the retail credit book has risen from 2.8% to 4.1%. What explanation and action plan would you present to the risk committee?',
      },
      q2: {
        question:
          'Macro stress scenario: a 15% AZN devaluation. How would you reassess portfolio risk exposure?',
      },
      q3: {
        question: 'What does Basel III capital adequacy measure?',
        options: [
          'The bank’s capital relative to risk-weighted assets',
          'Liquidity reserves only',
          'Marketing spend',
          'Number of ATMs',
        ],
      },
    },
  },
  'Tax Consultant Intern': {
    title: 'Tax Consultant Intern',
    role_type: 'Tax Advisory',
    description:
      'Corporate tax planning and compliance tasks on EY’s Tax Advisory team.',
    questions: {
      q1: {
        question:
          'A multinational client wants to refresh transfer-pricing documentation. What are the CIT risks, and which steps would you take?',
      },
      q2: {
        question: 'What is the typical standard VAT rate in Azerbaijan?',
        options: ['18%', '20%', '12%', '5%'],
      },
      q3: {
        question:
          'The client is planning a capital restructure. Compare 3 alternative structures from a tax-efficiency standpoint.',
      },
    },
  },
  'Digital Marketing Intern': {
    title: 'Digital Marketing Intern',
    role_type: 'Digital Marketing',
    description:
      'Intern on Azercell’s digital marketing team. 5G campaign, social performance, and customer-journey optimisation.',
    questions: {
      q1: {
        question:
          'Plan a TikTok + Instagram campaign to introduce Azercell 5G to a youth segment. Outline a 4-week content calendar.',
      },
      q2: {
        question: 'What does CPI (Cost Per Install) measure in app campaigns?',
        options: [
          'Ad cost per app install',
          'Daily active users',
          'Gross revenue',
          'Churn rate',
        ],
      },
      q3: {
        question:
          'Campaign CTR has dropped from 0.9% to 0.4%. Prepare an A/B test plan: hypothesis, variants, success metric.',
      },
      q4: {
        question:
          'You received an influencer collab offer — 45K followers, 1.2% engagement. Write your accept/reject criteria for brand safety and ROI.',
      },
    },
  },
  'Retail Banking Trainee': {
    title: 'Retail Banking Trainee',
    role_type: 'Retail Banking',
    description:
      'Learn customer service, cross-sell, and KYC in a Kapital Bank branch. A real simulation of daily branch operations.',
    questions: {
      q1: {
        question:
          'A walk-in customer wants a new salary card and also asks about a small-business account. Describe a 5-step service flow.',
      },
      q2: {
        question: 'Why is a PEP (Politically Exposed Person) check important in KYC?',
        options: [
          'AML/CFT compliance and risk reduction',
          'Marketing segmentation',
          'Automatic credit-limit increase',
          'Calculating ATM costs',
        ],
      },
      q3: {
        question:
          'A customer is upset about a blocked card in the mobile app and is emotional. Write an empathetic, professional response.',
      },
      q4: {
        question:
          'Branch KPIs: cross-sell rate, NPS, average handling time. How would you balance these 3 metrics?',
      },
    },
  },
  'Junior Backend Developer': {
    title: 'Junior Backend Developer',
    role_type: 'Software Engineering',
    description:
      'Real API design, data modelling, and code-review tasks on the PASHA Technology backend team (Node.js + PostgreSQL).',
    questions: {
      q1: {
        question:
          'Design a REST endpoint for a user balance debit/credit on a fintech API. How would you handle idempotency, concurrency, and double-spend risk?',
      },
      q2: {
        question: 'Which problem does PostgreSQL’s READ COMMITTED isolation level mainly solve?',
        options: [
          'It prevents dirty reads',
          'It fully eliminates all phantom reads',
          'It replaces a distributed lock',
          'It rebuilds indexes',
        ],
      },
      q3: {
        question:
          'In code review you find an N+1 query on a junior developer’s endpoint. How would you refactor it? Give pseudocode or SQL.',
      },
      q4: {
        question:
          'Production latency has risen to 800ms. Write your debugging plan: which logs, metrics, and tools would you use?',
      },
    },
  },
  'Mobile App Developer Intern': {
    title: 'Mobile App Developer Intern',
    role_type: 'Mobile Development',
    description:
      'Practical React Native screens, state management, and API integration on Azercell’s consumer app team.',
    questions: {
      q1: {
        question:
          'Balance-check screen in the MyAzercell app: how would you design loading, error, and empty states? Describe the component structure.',
      },
      q2: {
        question: 'What is the most effective way to improve FlatList performance in React Native?',
        options: [
          'getItemLayout, keyExtractor, memoized renderItem',
          'map() inside a ScrollView',
          'Creating a new inline function on every render',
          'Putting all state in a global context',
        ],
      },
      q3: {
        question:
          'Explain step by step how you would implement a push-notification deep link to a campaign page (note iOS/Android differences).',
      },
    },
  },
  'DevOps Engineer Intern': {
    title: 'DevOps Engineer Intern',
    role_type: 'DevOps & Cloud',
    description:
      'CI/CD pipeline, container orchestration, and incident-response simulation on Kapital Bank’s IT infrastructure team.',
    questions: {
      q1: {
        question:
          'Design a GitHub Actions CI/CD pipeline for a Next.js app: lint, test, build, staging deploy, production approval gate.',
      },
      q2: {
        question: 'Which configuration is essential for zero-downtime during a Kubernetes rolling update?',
        options: [
          'readinessProbe plus correct maxUnavailable/maxSurge',
          'replicaCount=1 only',
          'imagePullPolicy=Never',
          'hostNetwork: true',
        ],
      },
      q3: {
        question:
          'Production API error rate has hit 5%. Write your first-30-minute incident response runbook (comms, rollback, postmortem).',
      },
      q4: {
        question:
          'Secrets management: .env files must not live in the repo. How would you manage secrets in a bank environment?',
      },
    },
  },
  'Cybersecurity SOC Analyst': {
    title: 'Cybersecurity SOC Analyst',
    role_type: 'Cybersecurity',
    description:
      'SIEM alert triage, phishing incidents, and vulnerability prioritisation in SOCAR’s IT Security Operations Center.',
    questions: {
      q1: {
        question:
          'SIEM alert: 47 failed logins from different IPs on an admin account at 03:14. Could this be a true positive, false positive, or targeted attack? Write your steps.',
      },
      q2: {
        question: 'What is the most reliable first check on a phishing email?',
        options: [
          'Check sender domain, SPF/DKIM, and link URLs from headers',
          'Forward it and ask colleagues',
          'Open the attachment and wait for antivirus',
          'Reply and ask who the sender is',
        ],
      },
      q3: {
        question:
          'A critical CVE is public — the affected system is an internal portal. CVSS 9.1. Patching will take 72 hours. What is your risk-acceptance and temporary mitigation plan?',
      },
    },
  },
  'QA Automation Engineer': {
    title: 'QA Automation Engineer',
    role_type: 'Quality Assurance',
    description:
      'Test planning, automation strategy, and regression scenarios on Bakcell’s digital products QA team.',
    questions: {
      q1: {
        question:
          'Prepare a test plan for a new eSIM activation flow: happy path, edge cases, negative tests (at least 8 cases).',
      },
      q2: {
        question: 'What is the most common cause of flaky E2E tests?',
        options: [
          'Async timing and unstable selectors',
          'The colour of the test runner',
          'Having too many test cases',
          'Missing manual test docs',
        ],
      },
      q3: {
        question:
          'Which page-object structure would you use to automate login → dashboard → logout with Playwright/Cypress?',
      },
    },
  },
  'Full Stack Developer': {
    title: 'Full Stack Developer',
    role_type: 'Full Stack Development',
    description:
      'React + API feature delivery on ABB Digital: auth, form validation, database schema, and deployment.',
    questions: {
      q1: {
        question:
          'Credit application form: frontend validation + backend validation + audit log. What would you check on each layer, and why?',
      },
      q2: {
        question: 'In a JWT access + refresh token pattern, where should the refresh token be stored (web app)?',
        options: [
          'HttpOnly secure cookie (reduces XSS risk)',
          'localStorage (always the safest)',
          'URL query parameter',
          'sessionStorage + console.log',
        ],
      },
      q3: {
        question:
          'Merging a feature branch to production: what is your PR review checklist? (security, performance, tests, docs)',
      },
    },
  },
  'Junior Software Engineer': {
    title: 'Junior Software Engineer',
    role_type: 'Software Engineering',
    description:
      'Junior developer onboarding at Symmetrix (Baku): Git workflow, bug fixes, and code quality.',
    questions: {
      q1: {
        question:
          'Git: after creating a feature branch and fixing a bug, which steps would you follow to open a PR? What if there is a merge conflict?',
      },
      q2: {
        question: 'In SOLID, what does Single Responsibility mean?',
        options: [
          'Each class/module should have only one reason to change',
          'Only one developer may commit',
          'A file may contain only one function',
          'The database may have only one table',
        ],
      },
      q3: {
        question:
          'Production bug: users say the filter button does not work. Describe your process from bug report to fix.',
      },
    },
  },
  'IT Support Specialist': {
    title: 'IT Support Specialist',
    role_type: 'IT Support',
    description:
      'IT support on a government digital-services platform: tickets, user issues, and SLA prioritisation.',
    questions: {
      q1: {
        question:
          'A citizen says “I cannot sign in to the myGov portal” — on the phone. List your troubleshooting steps.',
      },
      q2: {
        question: 'In ITIL, when is a P1 (Priority 1) incident usually escalated?',
        options: [
          'Immediately when a critical business service is fully down',
          'Only on weekends',
          'After 30 days',
          'Only when email is delayed',
        ],
      },
      q3: {
        question:
          'You receive 40+ identical “I forgot my password” tickets the same day. What is your root-cause analysis and long-term fix?',
      },
    },
  },
}
