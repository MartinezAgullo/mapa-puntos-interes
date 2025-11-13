# NATO APP-6 Symbology & Icon Handling
====================================

This document describes how **mapa-puntos-interés** resolves icons for map entities using NATO APP-6 symbology, including category mapping, fallback logic, and country variants.

* * * * *

## What is NATO APP-6?
------------------------

**NATO APP-6** (*Allied Procedural Publication No. 6*) is the standard NATO military symbology system used to visually represent units, equipment, installations, and activities across land, air, sea, space, and cyberspace.

It defines:

-   Standard symbols

-   Affiliation colors (friendly/hostile/neutral/unknown)

-   Unit types (infantry, armor, artillery, aviation, naval, etc.)

-   Special markers and modifiers

The icons included in this project are simplified APP-6-style SVGs optimized for web display.

* * * * *

## 🧠 Icon Resolution Logic
------------------------

Each entity on the map specifies:

-   `categoria` (enum)

-   `alliance` (friendly, hostile, neutral, unknown)

-   `country` (e.g., Spain, France, Germany...)

Icons are stored under:

```
public/icons/
    ├── friendly/
    ├── hostile/
    ├── neutral/
    └── unknown/

```

Files may include **country variants**, for example:

```
infantry_spain.svg
infantry_france.svg
tank_usa.svg
base_portugal.svg

```

The map automatically selects the best match.

* * * * *

## 🔍 Resolution Algorithm
-----------------------

Given:

```
category = 'tank'
alliance = 'friendly'
country = 'Spain'

```

The system performs:

### 1) Determine base icon names for the category

Each category maps to one or more "base" icon names (depending on your symbol library):

```
infantry → ['infantry', 'ground']
tank     → ['tank', 'armor_mechanized', 'ground']
aircraft → ['fixed_wing', 'air_and_space']
helicopter → ['helicopter', 'rotary_wing']
submarine → ['submarine', 'sub_surface']
...

```

### 2) Generate candidate filenames

For each base:

1.  `base_country.svg` (e.g., `tank_spain.svg`)

2.  `base.svg`

3.  If all fail → `default.svg`

### 3) Resolve the file

The system checks for existence using a lightweight `HEAD` request:

```
/icons/{alliance}/{filename}

```

The **first existing file** becomes the icon.

### 4) Example Resolution

If we have:

```
public/icons/friendly/tank_spain.svg     ✓ exists
public/icons/friendly/tank.svg           ✓ exists
public/icons/friendly/armor_mechanized.svg

```

The chosen icon will be:

```
/icons/friendly/tank_spain.svg

```

If the country-specific variant does *not* exist, the next fallback is used.

* * * * *

## 📌 Examples
-----------

### Friendly Spain Infantry

```
Category: infantry
Alliance: friendly
Country: Spain

→ infantry_spain.svg
→ infantry.svg
→ ground.svg
→ default.svg

```

### Hostile Unknown Tank

```
Category: tank
Alliance: hostile
Country: Unknown

→ tank.svg
→ armor_mechanized.svg
→ default.svg

```

### Neutral Chinese Ship

```
ship_china.svg (if present)
ship.svg
sea_surface.svg
default.svg

```

* * * * *

##  💾 Why a separate system?
-------------------------

This layered resolution ensures:

-   Maximum use of detailed APP-6 symbols when available

-   Country-specific symbols when appropriate

-   Compatibility with incomplete icon sets through graceful fallback

-   Flexibility to extend with additional nations or types

* * * * *

If you ever expand your icon library or categories, simply add new SVGs under the corresponding alliance folder and the system will automatically use them.

* * * * *