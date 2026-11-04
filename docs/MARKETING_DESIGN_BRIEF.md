# Marketing website and your next design prompt

The public marketing app runs at `http://localhost:3300`. It helps a textile business understand EverGreen, assess product readiness and prepare a demo. It is separate from the owner console (5174) and mill operations (4001). Simulators, sample payloads and proposed plans are illustrative, not proof of a working deployment.

Development portal links target port 4001. Set the public `VITE_TENANT_PORTAL_URL` at build time for a production tenant domain; without one, marketing directs visitors to request access rather than linking to a made-up host. Contact/demo forms download a draft and explicitly do not claim delivery.

| Area | Purpose |
| --- | --- |
| Hero and navigation | Explain the product and lead to demo/product-tour actions |
| Textile visual | Connect material, mill and market with a CSS 3D spool and 2D flow |
| Simulator/personas | Demonstrate owner, accountant and operations scenarios |
| Platform/features | Explain inward, production, inventory, job work, commerce and invoices |
| Calculator/hardware | Illustrate fit and calculations; distinguish estimates from verified savings |
| Plans | Compare proposed packages; commercial terms require confirmation |
| Integrations | Search planned connector profiles and illustrative payloads; Tally XML export exists in the app |
| Deployment | Explain local/container prerequisites; no infrastructure is provisioned by the page |
| Stories, FAQ, support | Establish trust using verified evidence and realistic service commitments |
| Contact/POC | Prepare an enquiry; actual delivery requires a configured endpoint |
| Scout | Answer product questions via Groq, with consent and no private business data access |

This update keeps a dark ink/evergreen palette, refines typography and adds a floating yarn spool, orbital thread, travelling flow highlight and card depth. A pause button and reduced-motion rules support accessibility. CSS perspective avoids a heavy WebGL runtime; it is not a photorealistic 3D model.

The current broad marketing page includes legacy intended-capability copy, sample scenarios and proposed pricing. Before public launch validate case studies, figures, compliance claims and SLAs against real evidence. Do not present illustrative testimonials or outcomes as customer proof.

## Prompt template

> Design EverGreen for [mill owners / finance teams / traders]. The main action is [book a demo / explore / contact sales]. Keep [dark evergreen / charcoal and ivory / other] colours with an [industrial / editorial / futuristic / calm] feel. Use [2D process animation / CSS 3D yarn / interactive 3D mill] and [subtle / medium / expressive] motion. Prioritize these three workflows: [...]. Arrange these sections: [...]. Languages: [...]. Keep these existing elements: [...]. Avoid: [...]. Reference sites/images: [...]. Use verified claims, clear readiness labels, mobile layouts, keyboard access and reduced-motion support.

For true 3D, specify the subject (spool, loom or mill), interaction (rotate, zoom or scroll), realism and any model assets. That determines asset work and performance. A reference image/link and the completed prompt will provide a concrete direction for the next design.
