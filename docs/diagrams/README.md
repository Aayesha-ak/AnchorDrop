# AnchorDrop — PlantUML Diagram Pack

Copy any `.puml` file into a PlantUML renderer to generate PNG/SVG diagrams.

## How to generate

**Option A — Online**

1. Open [https://www.plantuml.com/plantuml/uml](https://www.plantuml.com/plantuml/uml)
2. Paste the full contents of a `.puml` file
3. Export PNG or SVG

**Option B — VS Code / Cursor**

1. Install a PlantUML extension
2. Open a `.puml` file
3. Preview / export (Java + Graphviz may be required locally)

**Option C — CLI**

```powershell
# after installing plantuml (e.g. via package manager / jar)
plantuml 01-system-architecture.puml
plantuml 02-use-case-diagram.puml
plantuml 03-booking-sequence.puml
plantuml 04-data-model.puml
```

## Files

| File | Diagram type | Purpose |
| :--- | :--- | :--- |
| `01-system-architecture.puml` | Component / deployment-style | Next.js + MongoDB web portal architecture |
| `02-use-case-diagram.puml` | Use case | Boater and dock owner capabilities |
| `03-booking-sequence.puml` | Sequence | Request → accept → arrival unlock → delay |
| `04-data-model.puml` | Class / ER-style | MongoDB collections and relationships |

Brand colors in the diagrams use Deep Navy / Champagne Gold accents for a clean professional look.
