# Shiplo Design System - Extracted Markdown Spec

> **Extraction note**
> This document was generated from the uploaded Figma `.fig` file by inspecting the embedded asset bundle, the file thumbnail, and text metadata recovered from the binary payload. It is a **best-effort structured extraction**, not a perfect one-to-one export from Figma. Some frame hierarchy, exact measurements, and token bindings may be missing or approximate.

## 1) System overview

- **System name:** Shiplo Design System
- **Source file:** `Shiplo Component Library.fig`
- **Observed scope:** design foundations, colors, typography, buttons, checkbox/radio controls, avatar, badge, chip inputs, alerts, dialogs, modals, cards, menus, tooltips, pagination, tabs, switches, steppers, progress, lists, navigation, headers, data grids, KPI cards, and several product-specific patterns.
- **Likely implementation basis:** parts of the system reference **MUI / Material UI** patterns and component APIs.

## 2) Foundations

### 2.1 Color system

Observed color foundations and token families:

- `Core Colors`
- `Colors - Light Theme`
- `State colors`
- `Alerts colors`
- `Other Colors`
- `Named Colors`
- `Dev Tokens - Hidden/Color/*`
- `BG/Named Colors/*`

### 2.2 Primary brand colors

Recovered values and descriptions:

- **Primary/Main:** `#2B64CB`
  - Description found: main color used by most components.
- **Secondary/Main:** `#008280`
  - Description found: secondary color used by most components.
- **Primary text / foreground:** text references were found for the primary brand color, including accessibility notes.
- **Contrast / on-color:** `#FFFFFF`
  - Description found: color that maintains AA contrast when a semantic main color is used as a background.

### 2.3 Additional observed colors

Recovered or referenced values include:

- `#E5E5E5` divider fill
- `#BDBDBD`
- `#001122` at `60%` and `75%`
- `#FF288A` map marker / path color
- `#008572`
- `#0E99FC`
- `#E3E9EC`
- `#E4E7EB`
- `#EBF5FF`
- `#F6F9FB`
- `#F7F7F7`
- `#0B1516`
- `#929FAD`
- `#B7BFCB`
- `#45565B`
- `#000000`

### 2.4 Semantic status colors

Observed semantic palettes:

- **Success**
  - Main/reference: `#376E00`, `#4A9200`
  - Light/background examples: `#EFF8E5`
  - Dark/background examples: `#254900`
- **Warning**
  - Main/reference: `#F27830`, `#C26026`
  - Light/background examples: `#FCE0CF`, `#F6A06E`
  - Dark/background examples: `#91481D`
- **Error**
  - Main/reference: `#CA0B0B`, `#970808`
  - Light/background examples: `#FEC8C8`, `#FE9797`
  - Dark/background examples: `#621B16`
- **Info**
  - Main/reference: `#0E99FC`, `#0B7ACA`, `#56B8FD`
  - Light/background examples: `#C8E8FE`, `#EBF5FF`
  - Dark/background examples: `#063D65`

### 2.5 State overlays

The binary text includes guidance that state colors are overlays used for:

- hover
- focused
- selected

Observed overlay-like references include:

- `Primary overlay/Hover`
- `Primary overlay/Focused`
- selected background references
- disabled content / disabled surface references

### 2.6 Named and utility colors

Observed categories include:

- `BG/Named Colors/Light Red`
- `BG/Named Colors/Light Yellow`
- `BG/Named Colors/Light Orange`
- `BG/Named Colors/Light Green`
- `BG/Named Colors/Light Teal`
- `BG/Named Colors/Light Blue`
- `BG/Named Colors/Light Purple`
- `BG/Named Colors/Light Brown`
- `BG/Named Colors/Light Pink`
- `BG/Named Colors/Light Gray`
- `BG/Named Colors/Dark Red`
- `BG/Named Colors/Dark Yellow`
- `BG/Named Colors/Dark Orange`
- `BG/Named Colors/Dark Green`
- `BG/Named Colors/Dark Teal`
- `BG/Named Colors/Dark Blue`
- `BG/Named Colors/Dark Brown`
- `BG/Named Colors/Dark Gray`
- `Named Colors/Vivid Purple`
- `Named Colors/Vivid Pink`
- `Other Colors/Blue Light + Dark`
- `Other Colors/Green Light + Dark`
- `Other Colors/Orange Light + Dark`
- `Other Colors/Red Light + Dark`
- `Other Colors/Pink Light + Dark`
- `Other Colors/Purple Light + Dark`
- `Other Colors/Teal Light + Dark`
- `Other Colors/Yellow Light + Dark`
- `Other Colors/Grey/Light`

## 3) Typography

The file clearly contains a typography foundation and named text styles.

### 3.1 Observed type styles

Recovered style names include:

- Heading 1
- Heading 2
- Heading 3
- Heading 3 (medium)
- Heading 4
- Heading 4 (medium)
- Heading 5
- Heading 5 (medium)
- Subtitle 1
- Subtitle 1 (medium)
- Subtitle 2
- Subtitle 2 (medium)
- Body
- Body (medium)
- Body 1
- Body 2
- Small
- Small (medium)
- Caption / labels references
- Header/h3
- Header/h4
- Header/h5
- `Header/text-2XL-bold`

### 3.2 Observed font families

Recovered font families include:

- **Poppins**
  - `Poppins-Regular`
  - `Poppins-Medium`
- **Montserrat**
  - `Montserrat-Light`
  - `Montserrat-SemiBold`
- **Inter**
  - `Inter-ExtraBold`
- **Oxanium**
  - `Oxanium-Bold`
  - `Oxanium-ExtraBold`
  - `OxaniumRoman-ExtraBold`

### 3.3 Observed typography guidance

- Typography foundation exists as a dedicated section.
- Line height and weight documentation are present.
- Some headings and subtitles have explicit **medium** variants.
- Buttons include a note that **small button text should be uppercase**.

## 4) Layout and spacing

Observed token references:

- `Spacing/tiny`
- `Table/graph header`
- top/header surface patterns
- card/page placements
- page vs header placement distinctions for input fields

The exact spacing scale was not fully recoverable, but the system clearly distinguishes:

- page placement
- header placement
- inside-label vs top-label forms
- component-specific surfaces and emphasis levels

## 5) Component inventory

## 5.1 Buttons

Observed component families:

- Button
- Button (small)
- Icon Button
- Button group
- Toggle Button
- Filter Buttons
- Match Buttons
- Nav Buttons
- Button Row

### Button sizes

Recovered sizes:

- `M`
- `S`
- component references also include:
  - `Components/Button Large`
  - `Components/Button Medium`
  - `Components/Button Small`

### Button variants

Recovered button types:

- `Contained`
- `Outlined`
- `Text`
- `Icon Button`

### Button color variants

Recovered color variants:

- `Primary`
- `Black`
- `White`

### Button states

Recovered states:

- `Enabled`
- `Hover`
- `Focused`
- `Disabled`

### Example recovered matrix

- `Color=Primary, Size=M, Type=Contained, State=Enabled`
- `Color=Primary, Size=M, Type=Outlined, State=Enabled`
- `Color=Primary, Size=M, Type=Text, State=Enabled`
- `Color=Black, Size=M, Type=Outlined, State=Enabled`
- `Color=White, Size=M, Type=Outlined, State=Enabled`
- same pattern observed across `Hover`, `Focused`, `Disabled`
- same pattern observed for `Size=S`

### Button guidance

- Small button text should be uppercase.
- Left-icon variants exist.
- Icon-only button patterns exist.

## 5.2 Checkbox and radio

Observed dedicated section:

- `Checkbox + Radio`

### Checkbox states

Recovered checkbox states:

- Unchecked / Default
- Checked / Default
- Indeterminate / Disabled / Yes
- Checked / Disabled / Yes
- Unchecked / Disabled / Yes

### Checkbox sizing

Recovered sizes:

- `Large`
- `Small`
- `extra small`

### Checkbox state matrix

Recovered states:

- `Default`
- `Hover`
- `Selected`
- `Disabled`

### Checkbox modules

Recovered module-specific checkbox variants:

- `Module=Onboarding`

### Radio sizing and modules

Recovered radio variants include:

- `Size=Small` + Onboarding
- `Size=extra small` + Onboarding
- `Size=extra small` + Shipments

### Radio states

Recovered states:

- `Default`
- `Hover`
- `Selected`
- `Disabled`

## 5.3 Avatar

Observed variants:

- `Circle`
- `Rounded`
- `Square`

Observed content modes:

- image avatar
- initials avatar
- icon avatar

Observed badge combinations:

- badge on/off for circle, rounded, and square avatars

Example recovered combinations:

- `Variant=Circle, Badge=False, Icon=False, Image=True`
- `Variant=Circle, Badge=False, Icon=False, Image=False`
- `Variant=Circle, Badge=False, Icon=True, Image=False`
- `Variant=Circle, Badge=True, Icon=False, Image=True`
- same coverage for `Rounded` and `Square`

## 5.4 Badge

Observed badge families:

- `Standard`
- `Dot`

Observed semantic colors:

- `Default`
- `Primary`
- `Secondary`
- `Error`
- `Warning`
- `Info`
- `Success`

Examples:

- `Variant=Standard, Color=Primary`
- `Variant=Standard, Color=Secondary`
- `Variant=Dot, Color=Primary`
- `Variant=Dot, Color=Success`

## 5.5 Inputs and fields

Observed field families:

- text input
- chip input
- chips input
- number input
- date select
- date range select
- date and time select
- search/filter inputs
- header-embedded inputs

### Input placements

Recovered placements:

- `In page`
- `In header`

### Input styles

Recovered styles:

- `Outlined`
- `Filled`

### Input types

Recovered types:

- `Text`
- `Chip`
- `Chips`
- `Number`

### Input states

Recovered states:

- `Default`
- `Hover`
- `Focused`
- `Disabled`

### Content states

Recovered content permutations:

- `Has content=No`
- `Has content=Yes`

### Label positions

Recovered label/title positions:

- `Top`
- `Inside`
- `Inside (hidden when value selected)`
- `Hidden` for some numeric cases

### Error handling

Observed:

- chip/chips input has explicit error variants
- subtext can be `Error`

## 5.6 Chips

Observed chip component behavior:

- compact element representing input, attribute, or action
- references to MUI chip API were found
- supports filled and outlined modes
- supports content/no-content states
- supports interactive field-with-chip patterns

### Chip variants

Recovered combinations include:

- `Placement=In page, Style=Outlined, Input type=Chip, State=Default, Has content=No`
- `Placement=In page, Style=Filled, Input type=Chip, State=Hover, Has content=Yes`
- `Style=Outlined, State=Default, Title position=Top, Has input=Yes, Has error=No, Input Type=Chips`
- `Style=Filled, State=Focused, Title position=Inside, Has input=Yes, Has error=No, Input Type=Chips`

## 5.7 Alerts

Observed alert families:

- generic `Alert`
- `Alerts`
- `Alert message`
- alert icons and semantic types

### Alert semantic types observed

- `Success`
- `Warning`
- `Error`
- `Info`

### Alert placement examples

- `Alert/Inside Left Panel/Success`
- various alert states embedded inside details tabs and workflow views

### Alert size examples

- `Size=Small`
- `Size=Extra Small`

## 5.8 Dialogs and modals

Observed dialog families:

- Dialog title
- Dialog content
- Dialog header
- Automation Dialog
- Upload Dialog
- Dialog template
- progress bar loader dialog

Observed modal families:

- generic `Modal`
- `Search Modal - Viewing`
- `Search Modal Body`

## 5.9 Cards

Observed card families:

- Card
- Card header
- Cards
- Selection Cards
- Onboarding Card
- Dashboard Cards
- KPI Cards
- Card/Pages
- no-data card/page use cases

Product-specific cards observed:

- Trips dispatching card
- Lane info in reco card
- Warehouse Inventory card
- Inventory activity card
- driver card
- Roles user card

## 5.10 Menus and dropdowns

Observed menu families:

- Menu
- Menu Item
- Dropdown Menu (In progress)
- Action menu
- Search menu
- Filter menu
- Date or time select menu
- Icon Button Menu

Recovered menu conditions:

- collapsed yes/no
- hover yes/no
- menu up/down/no
- disabled yes/no

## 5.11 Tooltip

Observed tooltip families:

- Tooltip
- Components/Tooltip
- Tooltip Surface
- light theme positional variants

Recovered positions:

- Top / Bottom
- Left / Center / Right

## 5.12 Pagination

Observed:

- dedicated `Pagination` component exists

## 5.13 Tabs and switches

Observed families:

- Marketplace Tabs
- Roles and permissions tabs
- Switch/Tab
- Switch with label
- Switch or tab item

Observed tab/switch patterns:

- filled high-emphasis
- left-bordered
- text-only states
- subtab expansions for planning, resources, and settings

## 5.14 Stepper and progress

Observed families:

- Stepper
- Dot stepper
- Number stepper
- Progress Bar 1
- Progress Bar 2
- Progress indicator

Recovered stepper options:

- stem orientation top/bottom
- step location left/center/right
- slot yes/no

## 5.15 Lists, navigation, and headers

Observed families:

- List
- List item
- Icon List
- Filter List Item
- Section Nav List
- Left Navigation
- Side navigation item
- Header
- Column Header
- Header Surface / High, Medium, Low emphasis
- Panel Subheader

## 5.16 Data grid and tables

Observed families:

- Data Grid
- Data grid template
- Customer Data Grid
- Orders Data Grid
- Data Grid Entries
- Table/graph header
- column header text and filter states

Observed selected / active states include:

- row hover
- row selected
- row selected + hover
- area selected
- cell selected

This suggests a fairly mature table / grid system with interactive selection patterns.

## 5.17 KPI and dashboard patterns

Observed families:

- KPI Cards
- KPI 1
- KPI 2
- Group KPIs
- Large KPI values
- Medium KPI values
- Small KPI values
- Sub KPI
- KPI header
- underlined KPI

## 6) Product-specific / domain patterns recovered

The file appears to include both system-level components and domain-specific product patterns. Recovered examples include:

- shipment and pickups action menus
- warehouse inventory card
- inventory activity card
- trips dispatching card
- roles and permissions tabs
- fulfillment center switching flows
- order / label / shipment status tabs
- onboarding selectors
- shipment radio controls
- logistics and customer brand assets

This implies the file is not only a generic component library, but also a **hybrid of design system + product pattern library**.

## 7) Replit-ready implementation guidance

If this Markdown is going into Replit for UI generation, this is the most usable normalized interpretation.

### 7.1 Recommended token model

```json
{
  "color": {
    "primary": { "main": "#2B64CB", "contrast": "#FFFFFF" },
    "secondary": { "main": "#008280", "contrast": "#FFFFFF" },
    "success": { "main": "#376E00", "light": "#EFF8E5", "dark": "#254900" },
    "warning": { "main": "#F27830", "light": "#FCE0CF", "dark": "#91481D" },
    "error": { "main": "#CA0B0B", "light": "#FEC8C8", "dark": "#621B16" },
    "info": { "main": "#0E99FC", "light": "#EBF5FF", "dark": "#063D65" },
    "neutral": {
      "0": "#FFFFFF",
      "50": "#F7F7F7",
      "100": "#F6F9FB",
      "200": "#E4E7EB",
      "300": "#E3E9EC",
      "400": "#B7BFCB",
      "500": "#929FAD",
      "700": "#45565B",
      "900": "#0B1516"
    }
  }
}
```

### 7.2 Recommended typography model

```json
{
  "typography": {
    "display": ["Oxanium", "Inter", "Montserrat"],
    "body": ["Poppins", "Montserrat"],
    "styles": [
      "heading1",
      "heading2",
      "heading3",
      "heading3Medium",
      "heading4",
      "heading4Medium",
      "heading5",
      "heading5Medium",
      "subtitle1",
      "subtitle1Medium",
      "subtitle2",
      "subtitle2Medium",
      "body",
      "bodyMedium",
      "body1",
      "body2",
      "small",
      "smallMedium",
      "caption"
    ]
  }
}
```

### 7.3 Recommended component API normalization

```json
{
  "button": {
    "sizes": ["s", "m", "large"],
    "variants": ["contained", "outlined", "text", "icon"],
    "colors": ["primary", "black", "white"],
    "states": ["enabled", "hover", "focused", "disabled"]
  },
  "checkbox": {
    "sizes": ["xs", "sm", "lg"],
    "states": ["default", "hover", "selected", "disabled"],
    "values": ["checked", "unchecked", "indeterminate"]
  },
  "radio": {
    "sizes": ["xs", "sm"],
    "states": ["default", "hover", "selected", "disabled"]
  },
  "avatar": {
    "shapes": ["circle", "rounded", "square"],
    "content": ["image", "initials", "icon"],
    "badge": [true, false]
  },
  "badge": {
    "variants": ["standard", "dot"],
    "colors": ["default", "primary", "secondary", "success", "warning", "error", "info"]
  },
  "input": {
    "styles": ["filled", "outlined"],
    "types": ["text", "number", "chip", "chips", "date", "dateRange", "dateTime"],
    "placements": ["page", "header"],
    "states": ["default", "hover", "focused", "disabled"],
    "labelPositions": ["top", "inside", "insideHiddenWhenFilled", "hidden"]
  }
}
```

## 8) Practical limitations of this extraction

What was recovered well:

- design system name
- major component inventory
- many variant matrices
- color names and many hex values
- font families and typography style names
- evidence of MUI-aligned implementation

What is still incomplete without direct Figma API / structured export:

- exact frame and page hierarchy
- exact spacing scale values
- exact font sizes and line-heights for every text style
- exact corner radii, shadows, and layout rules
- exact component dimensions and paddings
- precise token-to-component bindings
- interaction annotations and prototyping logic

## 9) Recommended next step

For a production-grade handoff to Replit or code generation, the ideal follow-up is:

1. export Figma styles/tokens directly as JSON if available
2. export each major component page as PNG or PDF
3. provide the Figma share link if accessible
4. use this Markdown as the base spec, then layer exact values on top

---

## 10) Quick component checklist

- Foundations
  - Colors
  - Typography
  - Spacing
- Inputs
  - Button
  - Icon Button
  - Checkbox
  - Radio
  - Switch
  - Text Input
  - Number Input
  - Chips / Chip Input
  - Date Select
  - Date Range Select
  - DateTime Select
- Data display
  - Avatar
  - Badge
  - Card
  - KPI Card
  - Alert
  - Tooltip
  - Data Grid
  - Table header
- Navigation
  - Menu
  - Dropdown
  - Tabs
  - Left Navigation
  - Section Nav List
  - Pagination
- Feedback / workflow
  - Dialog
  - Modal
  - Stepper
  - Progress bar
- Product-specific patterns
  - Shipment / pickup menus
  - Inventory cards
  - Fulfillment switching
  - Role/permission tabs

