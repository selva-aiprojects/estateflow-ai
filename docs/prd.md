Product Requirement Document (**PRD**) ## Document Control & Overview

1.1 Executive SummaryCognivectra aims to build EstateFlow, India's first AI-powered, multi-tenant End-to-End Real Estate Operating System. The platform unifies the fragmented real estate ecosystem—spanning developers, builders, brokers, contractors, buyers, and tenants—into a single vertical SaaS solution.By combining standard operational modules (**CRM**, **ERP**, Finance) with a deep, multi-agent AI layer, EstateFlow eliminates data silos, automates workflows via Temporal, and provides real-time predictive insights to stakeholders. 1.2 Objectives & Success MetricsSaaS Growth: Achieve a specific number of enterprise builder sign-ups within 12 months of launch.Operational Efficiency: Reduce lead response times to under 2 minutes using autonomous AI Sales Agents.Cost Control: Decrease construction budget variances and material waste through real-time AI procurement and **BOQ** tracking.User Adoption: Maintain high daily active user (**DAU**) engagement across the mobile application ecosystem (Sales, Construction, Customer).

## Architecture & Multi-Tenancy

2.1 Multi-Tenant SaaS StructureEstateFlow uses an isolated computing architecture to ensure enterprise-grade data security and compliance with Indian data sovereignty laws.

[ EstateFlow Gateway / Reverse Proxy ]
    |
    +----------------------------+----------------------------+

       |                            |                            |
[ Builder A Tenant ]         [ Builder B Tenant ]         [ Builder C Tenant ]
 - Custom Subdomain/**URL**       - Custom Subdomain/**URL**       - Custom Subdomain/**URL**
 - Custom Branding/Logo       - Custom Branding/Logo       - Custom Branding/Logo
 - Isolated DB Schema         - Isolated DB Schema         - Isolated DB Schema
 - Dedicated Vector Storage   - Dedicated Vector Storage   - Dedicated Vector Storage
 - Custom AI Workflows        - Custom AI Workflows        - Custom AI Workflows
Subdomain & Branding: Dynamic routing resolves custom URLs (e.g., builder-a.estateflow.in). The frontend serves tenant-specific assets, logos, and Tailwind color themes fetched at runtime.Database Isolation: A Bridge/Hybrid Isolation Model using PostgreSQL. Each tenant possesses a distinct database schema to prevent cross-tenant data leakage while optimizing infrastructure costs.AI & Vector Storage Isolation: Vector embeddings for internal documents are compartmentalized using isolated metadata tags or separate indices within pgvector or Chroma.

2.2 Core Technology StackFrontend: Next.js 15, React 19, Tailwind CSSBackend: .**NET** 9 Web **API** (C#)Database: PostgreSQL + Entity Framework Core / PrismaCaching & Messaging: Redis (Session/Cache), Kafka or RabbitMQ (Event-driven processing)Orchestration Engine: Temporal (For reliable execution of long-running workflows like procurement approvals and multi-stage billing)AI & **LLM** Orchestration: LangGraph, Semantic Kernel, OpenAI **GPT**-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 ProVector Database: pgvector (PostgreSQL plugin) or Chroma DBMobile Apps: Flutter (Single codebase for iOS and Android deployment across 7 user personas)Identity Management: Keycloak or Microsoft Entra ID (Supporting multi-tenant **RBAC** and OAuth2/**OIDC**)

## Epics & Functional Module Requirements

Epic 1: **CRM** & Omnichannel Lead ManagementRequirement: Ingest, score, and distribute leads from Facebook Ads, Google Ads, WhatsApp Business, and **IVR** systems.Workflow:A lead submits a form on Facebook.Webhook fires to the .**NET** 9 **API**.Kafka publishes a Lead_Ingested event.The AI Lead Scoring engine runs a predictive evaluation based on budget, location intent, and history.Temporal routes the lead to a Sales Executive based on dynamic round-robin rules.

Epic 2: Property & Inventory Lifecycle ManagementRequirement: A hierarchical inventory matrix modeling Projects → Towers → Floors → Blocks → Units.Visual Engine: Real-time Interactive Inventory Heat Maps. Units must dynamically change state color (Green = Available, Yellow = Blocked, Red = Sold, Blue = Token Paid).Concurrency Lock: When a Sales Executive generates a quotation, Redis locks the specific Unit ID for 15 minutes to prevent double-booking.

Epic 3: Sales, Quotations & CollectionsRequirement: Dynamic payment schedule generation compliant with construction milestones or time-linked plans.Approvals: Automated discount thresholds. If a discount is >5%, a Temporal workflow halts the booking and routes an approval notification to the VP of Sales' mobile app.

Epic 4: Construction **ERP** & Site OperationsRequirement: Bill of Quantities (**BOQ**) enforcement and tracking of labor, equipment, and daily progress.Field Execution: Site engineers use the Flutter app to log Daily Progress Reports (**DPR**). They can upload site images directly to S3-compatible storage, which updates the master project timeline.

Epic 5: Procurement & Vendor ManagementRequirement: Automate the **RFQ** (Request for Quote) lifecycle, Goods Received Notes (**GRN**), and invoice matching.Safety Check: Quantity ordered cannot exceed the authorized **BOQ** limit without management approval.

Epic 6: Finance & Indian ComplianceRequirement: Full-stack accounting system handling split tax rules.Compliance Matrix: Automatic calculation of **CGST**, **SGST**, **IGST**, and **TDS** (Section **194**-IA for properties >₹50 Lakhs).Reconciliation: Automated parsing of bank e-statements via **MT940**/**CAMT** formats to match collections against pending customer invoices.

Epic 7: Legal & **RERA** ComplianceRequirement: Management of land titles, litigation history, and mandatory quarterly **RERA** progress disclosures.Storage: Automated synchronization of final Agreements for Sale to DigiLocker via national **API** gateways.

Epic 8: Human Resources & Contract LabourRequirement: On-site attendance validation via biometric hardware integration or geofenced facial recognition on the Flutter Construction App.

Epic 9: Customer & Tenant PortalsRequirement: Customer self-service application for tracking construction progress, downloading payment receipts, logging maintenance tickets, and signing digital agreements.

Epic 10: Facility Management & Society OperationsRequirement: Post-handover module managing **AMC** contracts, visitor logs, and monthly maintenance billing for housing societies.

Epic 11: Rental OperationsRequirement: Lease lifecycle management, including automated monthly rent invoicing, recurring escalations (X% per annum), and security deposit tracking.

Epic 12: Integrated MarketplaceRequirement: An open ecosystem connecting builders with verified third-party vendors, including home loan providers (banks), interior designers, and packers & movers.4. The AI Layer (Competitive Advantage)EstateFlow utilizes a multi-agent framework built on LangGraph.

This architecture allows specialized agents to share information through a central transactional database and vector layer.

[ LangGraph / Multi-Agent Coordinator ]
    |
    +------------------+-----------+-----------+------------------+

    |                  |                       |                  |
[ Sales Agent ]  [ Construction Agent ]  [ Finance Agent ]  [ Legal Agent ]
 - 24/7 Chats     - Delay Alerts          - Cash Forecasts   - Clause Audits
 - Booking Engine - Timeline Risks        - Budget Variance  - Compliance Check

4.1 AI Sales AgentTech Component: LangGraph + WhatsApp Business **API** + Twilio Voice AI.Capabilities: Converses with leads natively in English, Hindi, and regional languages. It qualifies buyer intent, answers project pricing FAQs, and books site visits by writing directly to the Visit_Scheduler database via authorized **API** endpoints.

4.2 AI Construction AgentTech Component: Claude 3.5 Sonnet (Vision) + Predictive Analytics Engine.Capabilities: Analyzes uploaded site photos alongside daily progress logs. It compares current progress against the master schedule, identifies delays, alerts project managers to material shortages, and adjusts estimated completion dates.

4.3 AI Finance AgentTech Component: Python analytical runtimes + Time-Series Forecasting models.Capabilities: Evaluates historical collection patterns, upcoming billing milestones, and market velocity to project cash flow. It flags potential budget overruns by cross-referencing actual material expenditures with initial **BOQ** baselines.

4.4 AI Legal AgentTech Component: Custom **RAG** via pgvector + **LLM** text evaluation.Capabilities: Scans vendor contracts and draft client agreements to flag missing standard clauses, identify liability risks, and verify compliance with local **RERA** guidelines.

4.5 AI Procurement AgentTech Component: **LLM** text generation + historical cost matching.Capabilities: Evaluates incoming **RFQ** responses across price, delivery times, and historical vendor quality ratings. It draft optimal purchase orders and flags anomalies when vendor quotes deviate from standard market price indices.

4.6 AI Customer AgentTech Component: Conversational **LLM** + Notification workflows.Capabilities: Automates customer interactions over WhatsApp. It answers queries about payment schedules, provides links to construction photo updates, and follows up on outstanding invoices using personalized natural language reminders.

4.7 AI Executive Dashboard (Natural Language Interface)Tech Component: Text-to-**SQL** Engine protected by a strict schema security layer.Capabilities: Allows executives to query enterprise data conversationally.

Example Conversation:**CEO** Query: "How many premium **3BHK** units will remain unsold in Project Elevate next quarter based on current sales velocity?"System Action: The engine converts the prompt into an optimized **SQL** query, runs it against the isolated tenant database, processes the result through the analytical forecasting engine, and returns a plain-language summary alongside a structured data table.

## System Integrations MatrixCategoryPartner / Target SystemIntegration ProtocolUse CaseGovt & IdentityRERA PortalsScrapers / Official APIsSync project registration status and public data disclosures.DigiLockerREST APISecurely push and pull official property documents.Aadhaar eKYCUIDAI Authorized GatewayInstant identity verification for buyers, tenants, and brokers.NSDL / Income TaxPAN Verification APIValidate customer and vendor tax identities during onboarding.FinancialsPayment GatewaysRazorpay / Cashfree APIsProcess token bookings, maintenance dues, and rental deposits.ERP CoreSAP / Tally Prime APISynchronize general ledger data, inventory asset valuations, and tax reports.CommunicationWhatsAppMeta Business APIDeliver automated alerts, payment reminders, and host conversational bots.ProductivityGoogle / Outlook CalendarSync site visit schedules and agent calendars in real time.CollaborationSlack / Microsoft TeamsRoute urgent system alerts, like budget overruns or discount approvals.GeospatialMappingGoogle Maps APIProvide location intelligence, micro-market plotting, and site directions.

## Mobile Application FrameworkEstateFlow deploys a collection of targeted Flutter applications, configured with role-based access control (RBAC) linked to the primary identity provider.Customer App: Enables buyers to track construction milestones via live video/photo feeds, download tax invoices, execute e-signatures, and open customer support tickets.Sales App: Provides sales representatives with lead queues, click-to-call dialers, digital quote builders, and an interactive inventory matrix.Construction App: Tailored for site operations. Supports offline data logging for progress reports, material verification via QR/Barcode scanning, and digital incident reporting.Vendor App: Allows suppliers to review active RFQs, submit binding bids, track payment status, and upload delivery dispatch notes.Broker App: Provides external channel partners visibility into unallocated inventory, real-time pricing tiers, marketing collateral, and commission tracking.Management App: A high-level interface for executives featuring business dashboards, cash flow indicators, and pending system approval queues.Facility & Security App: Manages on-site visitor check-ins via QR codes, logs vehicle entries, and tracks gate passes.

## Monetization Engine[ Revenue Stream Architecture ]

    ├── Core SaaS Subscription (Per-tier builder subscription)
    ├── Consumption Licensing (Per-seat monthly active users)
    ├── FinTech Monetization (Payment processing fees + Document e-signs)
    └── Value-Add Commissions (Marketplace matches for interior/loans)
Core SaaS Subscription: Monthly or annual tiered pricing model scaled by the builder's active portfolio volume (e.g., Total square feet or active units under management).Per-User Licensing: Seat-based licensing models tailored to specific operational roles (e.g., Extended packages for sales agents or construction engineers).Marketplace Commission: Revenue sharing model based on successful leads routed to ecosystem providers like banks, insurance brokers, and interior design firms.Transaction Fees: Small platform convenience fees applied to digital document execution (e-sign/DigiLocker) and utility payment gateway volume processing.AI Premium Add-ons: Tiered upsell features for advanced autonomous capabilities, including conversational voice bots and deep predictive financial analysis.

## Non-Functional Requirements & Security

8.1 Security & ComplianceData Sovereignty: All tenant data, logs, and backups must reside strictly within **AWS** Mumbai (ap-south-1) or Azure Central India (centralindia) regions to comply with **DPDP** Act **2023** and **RERA** directives.Encryption Standards: Data must be encrypted at rest using **AES**-**256** with tenant-specific keys managed by **AWS** **KMS** or Azure Key Vault. Data in transit must use **TLS** 1.3.Access Control: Enforcement of Zero Trust Network Access (**ZTNA**) combined with multi-factor authentication (**MFA**) via Keycloak/Entra ID.

8.2 Performance & ScalabilityAPI Response Times: All transactional Read/Write operations must return responses within ≤ 200ms at the 95th percentile.AI Inferencing: AI Sales text responses over WhatsApp must complete processing and transmit the first token in under 1.5 seconds.High Availability: The core infrastructure must run an active-active multi-region setup targeting a ≥ 99.95% uptime **SLA**, managed through automated Kubernetes orchestration.