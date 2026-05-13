# Reporte Técnico — Diagramas de Diseño  
## Sistema de Monitoreo de Transporte Público: TransTrack  

**Versión:** 2.0  
**Fecha:** 13 de mayo de 2026  
**Tecnologías base:** React 19 · Vite 8 · React-Leaflet 5 · Zustand 5 · TailwindCSS 4 · Node.js · Express 4 · Socket.io 4 · BullMQ 5 · Redis  

---

## Índice

1. [Diagrama de Arquitectura de Software](#1-diagrama-de-arquitectura-de-software)  
2. [Diagrama de Árbol de Componentes](#2-diagrama-de-árbol-de-componentes)  
3. [Diagrama de Flujo de Datos (Estado Global)](#3-diagrama-de-flujo-de-datos-estado-global)  
4. [Diagrama de Máquina de Estados — Unidades de Transporte](#4-diagrama-de-máquina-de-estados--unidades-de-transporte)  
5. [Diagrama de Flujo — Algoritmo de Simulación](#5-diagrama-de-flujo--algoritmo-de-simulación)  
6. [Diagrama de Flujo — Algoritmo de Encadenamiento de Rutas](#6-diagrama-de-flujo--algoritmo-de-encadenamiento-de-rutas)  
7. [Diagrama de Flujo — Planificador de Viaje](#7-diagrama-de-flujo--planificador-de-viaje)  
8. [Diagrama de Secuencia — Interacción del Usuario](#8-diagrama-de-secuencia--interacción-del-usuario)  
9. [Diagrama de Estructura de Datos](#9-diagrama-de-estructura-de-datos)  
10. [Diagrama de Capas del Sistema](#10-diagrama-de-capas-del-sistema)  

---

## 1. Diagrama de Arquitectura de Software

El sistema es ahora una arquitectura **full-stack** compuesta por una SPA React en el frontend y un servidor Node.js/Express en el backend. La comunicación en tiempo real se realiza mediante Socket.io; la cola de trabajo asíncrona mediante BullMQ sobre Redis. El frontend mantiene un store reactivo global (Zustand) como única fuente de verdad.

```mermaid
graph TB
    subgraph BROWSER["Navegador del Usuario — Frontend (Vite + React 19)"]
        subgraph APP["Capa de Aplicación — App.jsx"]
            direction LR
            GEO["useGeolocation()<br/><i>Geolocation API</i>"]
            SIM["useUnitSimulation()<br/><i>Loop 200 ms</i>"]
            RT["useRealtimeTelemetry()<br/><i>Socket.io client</i>"]
        end

        subgraph STORE["Estado Global — Zustand Store"]
            direction LR
            S1["userLocation"]
            S2["routes[ ]"]
            S3["units[ ] (4 unidades)"]
            S4["activeRouteId"]
            S5["isSimulating · simSpeed"]
            S6["departurePoint · destinationPoint"]
            S7["selectionMode"]
            S8["selectedUnitId"]
            S9["flyTo commands"]
        end

        subgraph VIEW["Capa de Presentación"]
            direction LR
            subgraph SIDEBAR["Sidebar"]
                SC["SimulationControls"]
                RS["RouteSelector"]
                TP["TripPlanner<br/><i>+ snap GPS</i>"]
                UL["UnitList<br/><i>filtrado por ruta</i>"]
            end
            subgraph MAP["Mapa (react-leaflet)"]
                MV["MapView<br/><i>filtrado por ruta</i>"]
                RL["RouteLayer"]
                UMK["UnitMarker ×N"]
                ULM["UserLocationMarker"]
                MAF["MapAutoFocus<br/><i>+ seguimiento unidad</i>"]
                MCH["MapClickHandler"]
                TML["TripMarkersLayer"]
            end
        end

        subgraph DATA["Capa de Datos (frontend)"]
            RR["routeRegistry.js · ROUTES[ ]"]
            GJ1["Ruta Coloso - Cine Rio.json"]
            GJ2["Ruta Rena - Hospital.json"]
            GJ3["Ruta Vacacional.json"]
        end

        subgraph UTILS["Utilidades"]
            INT["interpolate.js"]
            GEO2["geoUtils.js"]
            SNP["snapToRoute.js"]
            SRT["sortFeatures.js"]
        end
    end

    subgraph BACKEND["Servidor Backend — Node.js + Express (Render)"]
        direction TB
        SRV["server.js<br/><i>HTTP + Socket.io server</i>"]
        subgraph EXPRESS["Express App"]
            MW["authMiddleware<br/><i>X-API-Key / Bearer</i>"]
            CTRL["telemetry.controller<br/><i>Zod validation → 202</i>"]
            RT_API["POST /api/telemetry"]
            HEALTH["GET /health"]
        end
        subgraph QUEUE["Cola Asíncrona — BullMQ"]
            Q["telemetry Queue"]
            W["telemetry Worker<br/><i>concurrency: 10</i>"]
        end
        REDIS["Redis (ioredis)<br/><i>Docker local / Render addon</i>"]
        EMIT["io.emit('telemetry:batch', payload)"]
    end

    subgraph EXTERNAL["Servicios Externos"]
        OSM["OpenStreetMap Tiles"]
        GEOAPI["Geolocation API"]
        RENDER["Render.com (deploy)"]
        VERCEL["Vercel (frontend deploy)"]
    end

    RT -- "WebSocket / polling" --> SRV
    SRV --> EMIT --> RT
    RT_API --> MW --> CTRL --> Q --> REDIS --> W --> EMIT
    GEO --> GEOAPI
    MV --> OSM
    SRV --> RENDER
    APP --> VERCEL
    RR --> GJ1 & GJ2 & GJ3
    SRT --> RR
    DATA --> STORE
    STORE <--> VIEW
    APP --> STORE
```

---

## 2. Diagrama de Árbol de Componentes

Jerarquía completa de componentes React con sus dependencias del store. Se destacan los cambios respecto a la versión anterior: filtrado de unidades por ruta, seguimiento de unidad en mapa, y hook de telemetría en tiempo real.

```mermaid
graph TD
    A["<b>main.jsx</b><br/><i>ReactDOM.createRoot</i>"]
    B["<b>App.jsx</b><br/>useUnitSimulation<br/>useRealtimeTelemetry<br/>useGeolocation · useAppStore"]
    C["<b>Sidebar.jsx</b>"]
    D["<b>MapView.jsx</b><br/>useAppStore<br/><i>filtra por activeRouteId</i>"]
    E["<b>SimulationControls.jsx</b><br/>useAppStore"]
    F["<b>RouteSelector.jsx</b><br/>useAppStore"]
    G["<b>TripPlanner.jsx</b><br/>useAppStore · geoUtils<br/>snapToRoute · LocationIcon<br/><i>snap GPS a ruta</i>"]
    H["<b>UnitList.jsx</b><br/>useAppStore<br/><i>filtra por activeRouteId</i>"]
    I["<b>RouteLayer.jsx</b><br/>useAppStore"]
    J["<b>UnitMarker.jsx</b><br/>props: unit"]
    K["<b>UserLocationMarker.jsx</b><br/>useAppStore"]
    L["<b>MapAutoFocus.jsx</b><br/>useAppStore<br/><i>flyTo + panTo seguimiento</i>"]
    M["<b>MapClickHandler.jsx</b><br/>useAppStore · snapToRoute"]
    N["<b>TripMarkersLayer.jsx</b><br/>useAppStore"]
    O["<b>StatusBadge.jsx</b><br/>props: status"]
    P["<b>InfoPanel.jsx</b><br/>props: unit · useAppStore"]
    HOOK1["<b>useUnitSimulation</b><br/><i>salta hasRealData=true</i>"]
    HOOK2["<b>useRealtimeTelemetry</b><br/><i>socket.io-client<br/>VITE_API_WS_URL</i>"]

    A --> B
    B --> C & D
    B --> HOOK1 & HOOK2
    C --> E & F & G & H
    D --> I & J & K & L & M & N
    H --> O & P
```

---

## 3. Diagrama de Flujo de Datos (Estado Global)

Incluye el flujo de telemetría en tiempo real desde el backend hacia el store y el mapa.

```mermaid
flowchart LR
    subgraph SOURCES["Fuentes de Datos"]
        FS["Archivos JSON<br/>(rutas GeoJSON)"]
        NAV["navigator.geolocation"]
        USER["Interacción del Usuario"]
        API["POST /api/telemetry<br/><i>dispositivo real</i>"]
    end

    subgraph BACKEND["Backend (Node.js)"]
        ZOD["Zod validation"]
        BQ["BullMQ Queue"]
        WRK["Worker"]
        SOCK["Socket.io emit<br/>'telemetry:batch'"]
    end

    subgraph PROCESSING["Procesamiento Frontend"]
        SRT["sortAndChainFeatures()"]
        EXT["extractCoordinates()"]
        SNP["snapToNearestPoint()"]
        INT["interpolatePosition()"]
        HAV["haversineDistance()"]
        ETA["Cálculo ETA"]
    end

    subgraph STORE["Zustand Store"]
        R["routes[ ]"]
        U["units[ ] · hasRealData"]
        UL_S["userLocation"]
        AR["activeRouteId"]
        IS["isSimulating · simSpeed"]
        DP["departurePoint"]
        DS["destinationPoint"]
        SID["selectedUnitId"]
    end

    subgraph RENDER["Renderizado"]
        MAP["Mapa Leaflet"]
        SB["Sidebar"]
        MK["Marcadores (filtrados)"]
        RL["Capas de Rutas"]
        TP_VIEW["Panel Planificador"]
        FOLLOW["MapAutoFocus (seguimiento)"]
    end

    API --> ZOD --> BQ --> WRK --> SOCK
    SOCK -- "telemetry:batch" --> U
    U -- "hasRealData=true" --> MK

    FS --> SRT --> R
    NAV --> UL_S
    USER --> AR & IS & SID

    R & U --> INT --> U
    U & SID --> FOLLOW
    AR --> MK
    AR --> SB
    U --> MK & SB
    R --> RL
    UL_S --> MAP

    R --> EXT --> SNP
    USER --> SNP --> DP & DS
    UL_S --> SNP
    DP & DS & R --> HAV --> ETA
    DP & DS & IS & U --> TP_VIEW
```

---

## 4. Diagrama de Máquina de Estados — Unidades de Transporte

Se añade la transición hacia **telemetría real**: cuando una unidad recibe datos del backend via Socket.io, adquiere el flag `hasRealData=true` y la simulación deja de controlar su posición.

```mermaid
stateDiagram-v2
    [*] --> on_route : Inicialización<br/>progress = initialProgress

    on_route : 🚌 on-route (simulado)
    on_route : hasRealData = false
    on_route : Posición actualizada por useUnitSimulation

    real_tracking : 📡 on-route (telemetría real)
    real_tracking : hasRealData = true
    real_tracking : Posición actualizada por useRealtimeTelemetry
    real_tracking : La simulación ignora esta unidad

    arrived : ✅ arrived
    arrived : progress = 1.0
    arrived : Solo aplica a unidades simuladas

    paused_state : ⏸ (simulado, pausado)
    paused_state : isSimulating = false
    paused_state : Posición congelada

    on_route --> paused_state : pauseSimulation()
    paused_state --> on_route : startSimulation()
    on_route --> arrived : progress ≥ 1.0
    arrived --> on_route : resetSimulation()
    paused_state --> on_route : resetSimulation()

    on_route --> real_tracking : updateUnitFromTelemetry()<br/>deviceId coincide con unit.id
    real_tracking --> real_tracking : Nuevo batch Socket.io
    real_tracking --> on_route : resetSimulation()<br/>hasRealData = false
```

> **Nota:** Las unidades con `hasRealData=true` no transicionan a `arrived` ya que la simulación no controla su progreso. `resetSimulation()` restaura todas las unidades al estado simulado.

---

## 5. Diagrama de Flujo — Algoritmo de Simulación

Se añade la verificación de `hasRealData` como condición de salto, protegiend a las unidades con telemetría real de ser sobreescritas.

```mermaid
flowchart TD
    START(["Inicio — setInterval<br/>cada TICK_MS = 200 ms"])
    CHECK_SIM{¿isSimulating?}
    STOP(["clearInterval()"])
    ITER["Iterar sobre cada unidad"]
    CHECK_ARR{¿unit.status<br/>= 'arrived'?}
    CHECK_REAL{¿unit.hasRealData<br/>= true?}
    SKIP["Saltar unidad<br/>(posición gestionada<br/>por telemetría)"]
    GET_ROUTE["Obtener ruta por unit.routeId"]
    EXTRACT["extractCoordinates(route.geojson)"]
    CALC_STEP["step = (speed × simSpeed × TICK_MS) / (N × 800)"]
    CALC_PROG["newProgress = min(progress + step, 1.0)"]
    INTERP["interpolatePosition(coords, newProgress)"]
    CALC_STATUS{newProgress ≥ 1.0?}
    SET_ARRIVED["newStatus = 'arrived'"]
    SET_ONROUTE["newStatus = 'on-route'"]
    UPDATE["updateUnitPosition(id, position, progress, status)"]
    NEXT["Siguiente unidad"]

    START --> CHECK_SIM
    CHECK_SIM -- No --> STOP
    CHECK_SIM -- Sí --> ITER
    ITER --> CHECK_ARR
    CHECK_ARR -- Sí --> SKIP --> NEXT
    CHECK_ARR -- No --> CHECK_REAL
    CHECK_REAL -- Sí --> SKIP
    CHECK_REAL -- No --> GET_ROUTE
    GET_ROUTE --> EXTRACT --> CALC_STEP --> CALC_PROG --> INTERP --> CALC_STATUS
    CALC_STATUS -- Sí --> SET_ARRIVED --> UPDATE
    CALC_STATUS -- No --> SET_ONROUTE --> UPDATE
    UPDATE --> NEXT
    NEXT --> ITER
```

### Fórmula de velocidad angular

$$\text{step} = \frac{v \cdot s \cdot \Delta t}{N \cdot 800}$$

Donde:
- $v$ = velocidad individual de la unidad (por defecto 1)
- $s$ = `simSpeed` — multiplicador global de velocidad $\in [0.5, 3]$
- $\Delta t$ = 200 ms
- $N$ = número de coordenadas de la ruta
- $800$ = constante de escala para normalizar la velocidad percibida

---

## 6. Diagrama de Flujo — Algoritmo de Encadenamiento de Rutas

Sin cambios respecto a la versión anterior.

```mermaid
flowchart TD
    IN["Entrada: GeoJSON FeatureCollection<br/>con N features LineString"]
    CHECK_N{¿N = 1?}
    RETURN_SINGLE["Retornar FeatureCollection<br/>con el único LineString"]
    EXTRACT_SEGS["Extraer coordenadas de cada<br/>feature como segmentos independientes"]
    CENTROID["Calcular centroide de todos los puntos:<br/>centroid = Σ(p) / total_puntos"]
    FIND_START["Encontrar segmento más periférico:<br/>argmax(dist²(seg[0], centroid))"]
    INIT["ordered = [segmento inicial]<br/>remaining = resto de segmentos"]
    WHILE{¿remaining<br/>no vacío?}
    LAST_PT["lastPoint = último punto de ordered"]
    FIND_BEST["Para cada seg en remaining:<br/>dStart = dist²(lastPoint, seg[0])<br/>dEnd   = dist²(lastPoint, seg[-1])"]
    COMPARE{¿dEnd < dStart?}
    REVERSE["Invertir seg (reversed)"]
    APPEND["Agregar seg/reversed a ordered"]
    BUILD["Concatenar coords → un único array"]
    OUT["Retornar FeatureCollection<br/>con un Feature LineString"]

    IN --> CHECK_N
    CHECK_N -- Sí --> RETURN_SINGLE
    CHECK_N -- No --> EXTRACT_SEGS --> CENTROID --> FIND_START --> INIT --> WHILE
    WHILE -- Sí --> LAST_PT --> FIND_BEST --> COMPARE
    COMPARE -- Sí --> REVERSE --> APPEND
    COMPARE -- No --> APPEND
    APPEND --> WHILE
    WHILE -- No --> BUILD --> OUT
```

> **Complejidad:** $O(N^2)$ donde $N$ es el número de segmentos. Aceptable para rutas urbanas donde $N \leq 50$.

---

## 7. Diagrama de Flujo — Planificador de Viaje

Se añade la opción de **snap automático al punto más cercano desde la ubicación GPS** del usuario como alternativa al click manual en el mapa.

```mermaid
flowchart TD
    A(["Usuario abre Sidebar"])
    B{¿Hay ruta activa?}
    C["Mostrar mensaje:<br/>'Selecciona una ruta'"]
    D["Habilitar botones de planificación"]

    GPS_BTN["Usuario pulsa 📍 GPS<br/>(botón junto a 'Salida')"]
    GPS_CHECK{¿userLocation<br/>disponible?}
    GPS_SNAP["snapToNearestPoint(<br/>userLocation.position, coords)<br/>→ {index, position}"]
    GPS_SET["setDeparturePoint({index, position})"]

    E["Usuario pulsa 'Salida' (tap mapa)"]
    F["setSelectionMode('departure')"]
    G["Usuario hace click en el mapa"]
    H["MapClickHandler captura e.latlng"]
    I["extractCoordinates(activeRoute.geojson)"]
    J["snapToNearestPoint(clickLatLng, coords)"]
    K["setDeparturePoint({index, position})"]

    L["Usuario pulsa 'Destino'"]
    M["setSelectionMode('destination') → click mapa → setDestinationPoint()"]

    P{¿Ambos puntos<br/>definidos?}
    Q["distanceAlongRoute(coords, dep.index, dst.index)"]
    R["Filtrar unidades: routeId = activeRouteId<br/>AND progress < depProgress<br/>AND status ≠ 'arrived'"]
    S{¿Unidades<br/>pendientes?}
    T["ETA = min((depProg - u.progress) × totalRouteMs / u.speed)"]
    V["Mostrar distancia + ETA"]
    W["Mostrar solo distancia"]

    A --> B
    B -- No --> C
    B -- Sí --> D
    D --> GPS_BTN & E
    GPS_BTN --> GPS_CHECK
    GPS_CHECK -- Sí --> GPS_SNAP --> GPS_SET --> L
    GPS_CHECK -- No --> D
    E --> F --> G --> H --> I --> J --> K --> L
    L --> M --> P
    P -- Sí --> Q --> R --> S
    S -- Sí --> T --> V
    S -- No --> V
    P -- No --> W
```

### Fórmula de ETA

$$\text{ETA}_u = \frac{(p_{\text{dep}} - p_u) \cdot T_{\text{ruta}}}{v_u \cdot 1000}$$

$$\text{ETA}_{\text{final}} = \min_{u \in U_{\text{pendientes}}} \text{ETA}_u$$

---

## 8. Diagrama de Secuencia — Interacción del Usuario

Flujo extendido que incluye telemetría en tiempo real desde el backend y el seguimiento de unidad desde el sidebar.

```mermaid
sequenceDiagram
    actor User as Usuario
    participant SB as Sidebar
    participant Store as Zustand Store
    participant Map as MapView / MapAutoFocus
    participant Hook as useUnitSimulation
    participant RT as useRealtimeTelemetry
    participant BE as Backend (Node.js)
    participant OSM as OpenStreetMap

    User->>SB: Abre la aplicación
    Map->>OSM: Solicita tiles (z=15, Acapulco)
    OSM-->>Map: Tiles PNG
    RT->>BE: Conecta Socket.io (polling → websocket)
    BE-->>RT: ACK connect
    Store-->>SB: units[4], routes[3]
    SB-->>User: Lista de unidades y rutas

    User->>SB: Pulsa "Iniciar" simulación
    SB->>Store: startSimulation()
    loop Cada 200 ms
        Hook->>Store: updateUnitPosition() — unidades sin hasRealData
        Store-->>Map: Re-render UnitMarker
    end

    Note over BE,RT: Dispositivo real envía telemetría
    BE->>BE: POST /api/telemetry → BullMQ → Worker
    BE->>RT: emit 'telemetry:batch' {deviceId, data[]}
    RT->>Store: updateUnitFromTelemetry(deviceId, [lat,lng], speed)
    Store-->>Map: Re-render UnitMarker (hasRealData=true)
    Note over Hook: Siguiente tick — salta unidad hasRealData

    User->>SB: Selecciona unidad desde UnitList
    SB->>Store: setSelectedUnit('unit-02')
    Store-->>Map: selectedUnitId = 'unit-02'
    Map->>Map: flyTo(unit.position, zoom≥16)
    loop Cada tick de simulación
        Map->>Map: panTo(unit.position) — seguimiento continuo
    end

    User->>SB: Selecciona "Coloso - Cine Río"
    SB->>Store: setActiveRoute('ruta-coloso')
    Store-->>Map: Filtrar: solo unidades de ruta-coloso
    Store-->>SB: Filtrar UnitList: Unidad 01 + Unidad 04

    User->>SB: Pulsa 📍 GPS en Planificador
    SB->>Store: userLocation.position disponible
    SB->>SB: snapToNearestPoint(gpsPos, coords)
    SB->>Store: setDeparturePoint({index, position})
    Store-->>SB: Mostrar ETA de Unidad 01 / Unidad 04
```

---

## 9. Diagrama de Estructura de Datos

Se añaden los modelos del backend (Job de telemetría, payload Socket.io) y el campo `hasRealData` en `UNIT`.

```mermaid
erDiagram
    ROUTE {
        string id PK
        string name
        string color
        GeoJSON geojson
    }

    UNIT {
        string id PK
        string name
        string routeId FK
        float progress
        float initialProgress
        array_float position
        float speed
        enum status
        int passengers
        bool isAtStop
        object stopDelta
        bool hasRealData
    }

    TELEMETRY_BATCH {
        string deviceId FK
        int timestamp
        array data
    }

    TELEMETRY_POINT {
        float lat
        float lng
        float speed
    }

    BULLMQ_JOB {
        string jobId
        string name
        object data
        int attempts
    }

    TRIP_POINT {
        int index
        array_float position
    }

    USER_LOCATION {
        array_float position
        float accuracy
    }

    GEOJSON_FEATURE_COLLECTION {
        string type
        array features
    }

    ROUTE ||--o{ UNIT : "asignada a"
    ROUTE ||--|| GEOJSON_FEATURE_COLLECTION : "contiene"
    ROUTE ||--o{ TRIP_POINT : "punto snap sobre"
    UNIT ||--o| TRIP_POINT : "reporta ETA hacia"
    TELEMETRY_BATCH ||--|{ TELEMETRY_POINT : "contiene"
    TELEMETRY_BATCH ||--|| BULLMQ_JOB : "procesada como"
    TELEMETRY_BATCH }o--o| UNIT : "actualiza posición de"
```

### Enumeración de estados (`unit.status`)

| Valor | Descripción |
|-------|-------------|
| `on-route` | Unidad en movimiento (simulada o con telemetría real) |
| `arrived` | Unidad completó el recorrido simulado (progress = 1.0) |

### Flag `hasRealData`

| Valor | Efecto |
|-------|--------|
| `false` | La posición es controlada por `useUnitSimulation` |
| `true` | La posición es controlada por `useRealtimeTelemetry`; la simulación ignora la unidad |

---

## 10. Diagrama de Capas del Sistema

El sistema pasa de frontend-only a arquitectura full-stack con capa de infraestructura real.

```mermaid
graph TB
    subgraph L5["Capa 5 — Presentación (UI)"]
        direction LR
        C1["Sidebar (RouteSelector · UnitList filtrado)"]
        C2["MapView (marcadores filtrados · seguimiento)"]
        C3["SimulationControls"]
        C4["TripPlanner (snap GPS)"]
        C5["InfoPanel · StatusBadge"]
    end

    subgraph L4["Capa 4 — Estado y Lógica de Negocio (Frontend)"]
        direction LR
        Z["Zustand Store"]
        H1["useUnitSimulation<br/><i>salta hasRealData</i>"]
        H2["useGeolocation"]
        H3["useRealtimeTelemetry<br/><i>socket.io-client</i>"]
    end

    subgraph L3["Capa 3 — Utilidades y Algoritmos"]
        direction LR
        U1["interpolate.js"]
        U2["geoUtils.js (Haversine)"]
        U3["snapToRoute.js"]
        U4["sortFeatures.js"]
    end

    subgraph L2["Capa 2 — Backend (Node.js / Express)"]
        direction LR
        B1["REST API<br/>POST /api/telemetry"]
        B2["Auth Middleware<br/>X-API-Key / Bearer"]
        B3["Zod Schema Validation"]
        B4["BullMQ Queue + Worker"]
        B5["Socket.io Server<br/>emit telemetry:batch"]
    end

    subgraph L1["Capa 1 — Datos"]
        direction LR
        D1["routeRegistry.js · GeoJSON ×3"]
        D2["Redis (BullMQ store)"]
    end

    subgraph L0["Capa 0 — Infraestructura / Servicios Externos"]
        direction LR
        E1["OpenStreetMap Tiles"]
        E2["Browser Geolocation API"]
        E3["Render.com (backend)"]
        E4["Vercel (frontend)"]
        E5["Redis addon (Render)"]
    end

    L5 <--> L4
    L4 <--> L3
    L4 -- "WebSocket / polling" --> L2
    L3 --> L1
    L4 --> L1
    L2 --> L1
    L2 --> L0
    L5 --> L0
```

---

## Notas Técnicas Adicionales

### Conversión de coordenadas GeoJSON ↔ Leaflet

| Estándar | Orden |
|---------|-------|
| GeoJSON | `[longitude, latitude]` |
| Leaflet | `[latitude, longitude]` |

```js
geometry.coordinates.forEach(([lng, lat]) => coords.push([lat, lng]))
```

### Fórmula de Haversine

$$d = 2R \cdot \arctan2\!\left(\sqrt{a},\, \sqrt{1-a}\right)$$

$$a = \sin^2\!\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cdot \cos\phi_2 \cdot \sin^2\!\left(\frac{\Delta\lambda}{2}\right)$$

Donde $R = 6{,}371{,}000 \text{ m}$.

### Patrón de refs para el loop de simulación

```
isSimulating cambia → useEffect se re-ejecuta → nuevo interval
units cambia        → unitsRef.current = units  (sin re-crear interval)
simSpeed cambia     → simSpeedRef.current       (sin re-crear interval)
```

### Seguimiento de unidad en mapa (MapAutoFocus)

Dos `useEffect` independientes con dependencias distintas:

```
selectedUnitId cambia → flyTo(position, zoom≥16) + isFollowingRef = true
units cambia          → si isFollowing && posición cambió → panTo(position, duration:0.2)
selectedUnitId = null → isFollowingRef = false (detiene seguimiento)
```

### Autenticación del backend

El endpoint `POST /api/telemetry` requiere uno de los dos esquemas:

| Header | Formato |
|--------|---------|
| `X-API-Key` | `<token>` |
| `Authorization` | `Bearer <token>` |

La comparación se realiza con `timingSafeEqual` para prevenir timing attacks. El token se genera automáticamente en Render mediante `generateValue: true`.


---

## Índice

1. [Diagrama de Arquitectura de Software](#1-diagrama-de-arquitectura-de-software)  
2. [Diagrama de Árbol de Componentes](#2-diagrama-de-árbol-de-componentes)  
3. [Diagrama de Flujo de Datos (Estado Global)](#3-diagrama-de-flujo-de-datos-estado-global)  
4. [Diagrama de Máquina de Estados — Unidades de Transporte](#4-diagrama-de-máquina-de-estados--unidades-de-transporte)  
5. [Diagrama de Flujo — Algoritmo de Simulación](#5-diagrama-de-flujo--algoritmo-de-simulación)  
6. [Diagrama de Flujo — Algoritmo de Encadenamiento de Rutas](#6-diagrama-de-flujo--algoritmo-de-encadenamiento-de-rutas)  
7. [Diagrama de Flujo — Planificador de Viaje](#7-diagrama-de-flujo--planificador-de-viaje)  
8. [Diagrama de Secuencia — Interacción del Usuario](#8-diagrama-de-secuencia--interacción-del-usuario)  
9. [Diagrama de Estructura de Datos](#9-diagrama-de-estructura-de-datos)  
10. [Diagrama de Capas del Sistema](#10-diagrama-de-capas-del-sistema)  

---

## 1. Diagrama de Arquitectura de Software

El sistema sigue una arquitectura de **SPA (Single Page Application)** con separación de responsabilidades en capas. La gestión de estado es centralizada mediante un store reactivo global (Zustand), eliminando el prop-drilling entre componentes distantes.

```mermaid
graph TB
    subgraph BROWSER["Navegador del Usuario"]
        subgraph APP["Capa de Aplicación — App.jsx"]
            direction TB
            GEO["useGeolocation()<br/><i>Geolocation API del navegador</i>"]
            SIM["useUnitSimulation()<br/><i>Loop de simulación (setInterval)</i>"]
        end

        subgraph STORE["Estado Global — Zustand Store"]
            direction LR
            S1["userLocation"]
            S2["routes[ ]"]
            S3["units[ ]"]
            S4["activeRouteId"]
            S5["isSimulating"]
            S6["departurePoint<br/>destinationPoint"]
            S7["selectionMode"]
            S8["flyTo commands"]
        end

        subgraph VIEW["Capa de Presentación"]
            direction LR
            subgraph SIDEBAR["Sidebar (w-72)"]
                SC["SimulationControls"]
                RS["RouteSelector"]
                TP["TripPlanner"]
                UL["UnitList"]
            end
            subgraph MAP["Mapa (flex-1)"]
                MV["MapView"]
                RL["RouteLayer"]
                UMK["UnitMarker ×N"]
                ULM["UserLocationMarker"]
                MAF["MapAutoFocus"]
                MCH["MapClickHandler"]
                TML["TripMarkersLayer"]
            end
        end

        subgraph DATA["Capa de Datos"]
            RR["routeRegistry.js<br/><i>ROUTES[ ]</i>"]
            GJ1["Ruta Coloso - Cine Río.json"]
            GJ2["Ruta Rena - Hospital.json"]
            GJ3["Ruta Vacacional.json"]
        end

        subgraph UTILS["Utilidades"]
            INT["interpolate.js<br/><i>extractCoordinates()<br/>interpolatePosition()</i>"]
            GEO2["geoUtils.js<br/><i>haversineDistance()<br/>distanceAlongRoute()</i>"]
            SNP["snapToRoute.js<br/><i>snapToNearestPoint()<br/>progressAtIndex()</i>"]
            SRT["sortFeatures.js<br/><i>sortAndChainFeatures()</i>"]
        end
    end

    subgraph EXTERNAL["Servicios Externos"]
        OSM["OpenStreetMap Tiles<br/>tile.openstreetmap.org"]
        GEOAPI["Geolocation API<br/>navigator.geolocation"]
    end

    GEO --> GEOAPI
    MV --> OSM
    RR --> GJ1 & GJ2 & GJ3
    SRT --> RR
    DATA --> STORE
    STORE <--> VIEW
    APP --> STORE
    INT & GEO2 & SNP --> SIM
    INT & GEO2 & SNP --> TP
    INT & SNP --> MCH
```

---

## 2. Diagrama de Árbol de Componentes

Jerarquía completa de componentes React con sus dependencias del store y utilidades.

```mermaid
graph TD
    A["<b>main.jsx</b><br/><i>ReactDOM.createRoot</i>"]
    B["<b>App.jsx</b><br/>useUnitSimulation · useGeolocation<br/>useAppStore"]
    C["<b>Sidebar.jsx</b>"]
    D["<b>MapView.jsx</b><br/>useAppStore"]
    E["<b>SimulationControls.jsx</b><br/>useAppStore"]
    F["<b>RouteSelector.jsx</b><br/>useAppStore"]
    G["<b>TripPlanner.jsx</b><br/>useAppStore · geoUtils · snapToRoute"]
    H["<b>UnitList.jsx</b><br/>useAppStore"]
    I["<b>RouteLayer.jsx</b><br/>useAppStore"]
    J["<b>UnitMarker.jsx</b><br/>props: unit"]
    K["<b>UserLocationMarker.jsx</b><br/>useAppStore"]
    L["<b>MapAutoFocus.jsx</b><br/>useAppStore"]
    M["<b>MapClickHandler.jsx</b><br/>useAppStore · snapToRoute"]
    N["<b>TripMarkersLayer.jsx</b><br/>useAppStore"]
    O["<b>StatusBadge.jsx</b><br/>props: status"]
    P["<b>InfoPanel.jsx</b><br/>props: unit"]

    A --> B
    B --> C
    B --> D
    C --> E
    C --> F
    C --> G
    C --> H
    D --> I
    D --> J
    D --> K
    D --> L
    D --> M
    D --> N
    H --> O
    H --> P
```

---

## 3. Diagrama de Flujo de Datos (Estado Global)

Muestra cómo los datos fluyen desde las fuentes externas, pasando por el store Zustand, hacia los componentes de presentación.

```mermaid
flowchart LR
    subgraph SOURCES["Fuentes de Datos"]
        FS["Archivos JSON<br/>(rutas GeoJSON)"]
        NAV["navigator.geolocation"]
        USER["Interacción del Usuario<br/>(clicks, botones)"]
    end

    subgraph PROCESSING["Procesamiento"]
        SRT["sortAndChainFeatures()"]
        EXT["extractCoordinates()"]
        SNP["snapToNearestPoint()"]
        INT["interpolatePosition()"]
        HAV["haversineDistance()"]
        ETA["Cálculo ETA<br/>(progress × totalRouteMs)"]
    end

    subgraph STORE["Zustand Store"]
        direction TB
        R["routes[ ]"]
        U["units[ ]"]
        UL["userLocation"]
        AR["activeRouteId"]
        IS["isSimulating"]
        DP["departurePoint"]
        DS["destinationPoint"]
        SM["selectionMode"]
    end

    subgraph RENDER["Renderizado"]
        MAP["Mapa Leaflet"]
        SB["Sidebar"]
        MK["Marcadores"]
        RL["Capas de Rutas"]
        TP_VIEW["Panel Planificador"]
    end

    FS --> SRT --> R
    NAV --> UL
    USER --> AR & IS & SM

    R & U --> INT --> U
    U --> MK
    R --> RL
    UL --> MAP

    AR --> R
    R --> EXT --> SNP
    USER --> SNP --> DP & DS
    DP & DS & R --> HAV --> ETA
    DP & DS & IS & U --> TP_VIEW
    IS & U --> MAP
    U --> SB
```

---

## 4. Diagrama de Máquina de Estados — Unidades de Transporte

Cada unidad de transporte tiene un ciclo de vida definido por tres estados. La transición entre ellos es determinista y controlada por el hook `useUnitSimulation`.

```mermaid
stateDiagram-v2
    [*] --> on_route : Inicialización<br/>progress = 0

    on_route : 🚌 on-route
    on_route : progress ∈ [0, 1)
    on_route : Posición se actualiza cada 200ms

    arrived : ✅ arrived
    arrived : progress = 1.0
    arrived : Unidad detenida en destino final

    paused_state : ⏸ (en ruta, pausado)
    paused_state : isSimulating = false
    paused_state : Posición congelada

    on_route --> paused_state : pauseSimulation()
    paused_state --> on_route : startSimulation()
    on_route --> arrived : progress ≥ 1.0
    arrived --> on_route : resetSimulation()\nprogress = 0, posición inicial
    paused_state --> on_route : resetSimulation()
```

> **Nota:** El estado `arrived` es terminal durante la sesión activa. Solo `resetSimulation()` permite regresar al estado inicial.

---

## 5. Diagrama de Flujo — Algoritmo de Simulación

El hook `useUnitSimulation` ejecuta un loop de interpolación lineal por posición cada 200 ms. El algoritmo traduce el progreso normalizado `t ∈ [0,1]` en coordenadas geográficas `[lat, lng]`.

```mermaid
flowchart TD
    START(["Inicio — setInterval<br/>cada TICK_MS = 200 ms"])
    CHECK_SIM{¿isSimulating?}
    STOP(["clearInterval()"])
    ITER["Iterar sobre cada unidad"]
    CHECK_ARR{¿unit.status<br/>= 'arrived'?}
    SKIP["Saltar unidad"]
    GET_ROUTE["Obtener ruta del store<br/>por unit.routeId"]
    EXTRACT["extractCoordinates(route.geojson)<br/>→ coords[ [lat,lng] ]"]
    CALC_STEP["Calcular paso:<br/>step = (speed × TICK_MS) / (N × 800)"]
    CALC_PROG["newProgress = min(progress + step, 1.0)"]
    INTERP["interpolatePosition(coords, newProgress)<br/>→ [lat, lng]"]
    CALC_STATUS{newProgress ≥ 1.0?}
    SET_ARRIVED["newStatus = 'arrived'"]
    SET_ONROUTE["newStatus = 'on-route'"]
    UPDATE["updateUnitPosition(id, position, progress, status)<br/><i>Actualiza Zustand → re-render</i>"]
    NEXT["Siguiente unidad"]

    START --> CHECK_SIM
    CHECK_SIM -- No --> STOP
    CHECK_SIM -- Sí --> ITER
    ITER --> CHECK_ARR
    CHECK_ARR -- Sí --> SKIP --> NEXT
    CHECK_ARR -- No --> GET_ROUTE
    GET_ROUTE --> EXTRACT
    EXTRACT --> CALC_STEP
    CALC_STEP --> CALC_PROG
    CALC_PROG --> INTERP
    INTERP --> CALC_STATUS
    CALC_STATUS -- Sí --> SET_ARRIVED --> UPDATE
    CALC_STATUS -- No --> SET_ONROUTE --> UPDATE
    UPDATE --> NEXT
    NEXT --> ITER
```

### Fórmula de velocidad angular

El paso por tick se define como:

$$\text{step} = \frac{v \cdot \Delta t}{N \cdot 800}$$

Donde:
- $v$ = factor de velocidad de la unidad (adimensional, por defecto 1)
- $\Delta t$ = 200 ms (periodo del intervalo)
- $N$ = número de coordenadas de la ruta
- $800$ = constante de escala para normalizar la velocidad percibida

---

## 6. Diagrama de Flujo — Algoritmo de Encadenamiento de Rutas

La función `sortAndChainFeatures()` resuelve el problema de múltiples `LineString` en un `FeatureCollection` GeoJSON que no están ordenados secuencialmente. Produce un único `LineString` continuo.

```mermaid
flowchart TD
    IN["Entrada: GeoJSON FeatureCollection<br/>con N features LineString"]
    CHECK_N{¿N = 1?}
    RETURN_SINGLE["Retornar FeatureCollection<br/>con el único LineString"]
    EXTRACT_SEGS["Extraer coordenadas de cada<br/>feature como segmentos independientes"]
    CENTROID["Calcular centroide de todos los puntos:<br/>centroid = Σ(p) / total_puntos"]
    FIND_START["Encontrar segmento más periférico:<br/>argmax(dist²(seg[0], centroid))"]
    INIT["ordered = [segmento inicial]<br/>remaining = resto de segmentos"]
    WHILE{¿remaining<br/>no vacío?}
    LAST_PT["lastPoint = último punto de ordered"]
    FIND_BEST["Para cada seg en remaining:<br/>dStart = dist²(lastPoint, seg[0])<br/>dEnd   = dist²(lastPoint, seg[-1])"]
    COMPARE{¿dEnd < dStart?}
    REVERSE["Invertir seg (reversed)"]
    APPEND["Agregar seg/reversed a ordered<br/>Eliminar de remaining"]
    BUILD["Concatenar todas las coords de ordered<br/>→ un único array de coordenadas"]
    OUT["Retornar FeatureCollection<br/>con un Feature LineString"]

    IN --> CHECK_N
    CHECK_N -- Sí --> RETURN_SINGLE
    CHECK_N -- No --> EXTRACT_SEGS
    EXTRACT_SEGS --> CENTROID
    CENTROID --> FIND_START
    FIND_START --> INIT
    INIT --> WHILE
    WHILE -- Sí --> LAST_PT
    LAST_PT --> FIND_BEST
    FIND_BEST --> COMPARE
    COMPARE -- Sí --> REVERSE --> APPEND
    COMPARE -- No --> APPEND
    APPEND --> WHILE
    WHILE -- No --> BUILD
    BUILD --> OUT
```

> **Complejidad:** $O(N^2)$ donde $N$ es el número de segmentos. Aceptable para rutas urbanas donde $N \leq 50$.

---

## 7. Diagrama de Flujo — Planificador de Viaje

El planificador permite al usuario marcar dos puntos sobre la ruta activa y calcula distancia por polilínea y ETA de la unidad más cercana.

```mermaid
flowchart TD
    A(["Usuario abre Sidebar"])
    B{¿Hay ruta activa?}
    C["Mostrar mensaje:<br/>'Selecciona una ruta'"]
    D["Habilitar botones:<br/>📍 Salida / 🏁 Destino"]
    E["Usuario pulsa 'Salida'"]
    F["setSelectionMode('departure')\nCursor del mapa cambia"]
    G["Usuario hace click en el mapa"]
    H["MapClickHandler captura e.latlng"]
    I["extractCoordinates(activeRoute.geojson)<br/>→ coords[ ]"]
    J["snapToNearestPoint(clickLatLng, coords)<br/>→ {index, position}"]
    K["setDeparturePoint({index, position})\nselectionMode = null"]
    L["Usuario pulsa 'Destino'"]
    M["setSelectionMode('destination')"]
    N["Repetir pasos G → J"]
    O["setDestinationPoint({index, position})"]
    P{¿Ambos puntos<br/>definidos?}
    Q["Calcular distancia:<br/>distanceAlongRoute(coords, dep.index, dst.index)<br/>→ metros"]
    R["Calcular ETA:<br/>Filtrar unidades: routeId = activeRouteId<br/>AND progress < depProgress<br/>AND status ≠ 'arrived'"]
    S{¿Hay unidades<br/>pendientes?}
    T["Para cada unidad:<br/>eta = (depProgress - u.progress) × totalRouteMs / (u.speed × 1000)"]
    U["etaSeconds = min(...etas)"]
    V["Mostrar distancia y ETA"]
    W["Mostrar solo distancia"]

    A --> B
    B -- No --> C
    B -- Sí --> D
    D --> E
    E --> F --> G --> H --> I --> J --> K
    K --> L --> M --> N --> O
    O --> P
    P -- Sí --> Q --> R --> S
    S -- Sí --> T --> U --> V
    S -- No --> V
    P -- No --> W
```

### Fórmula de ETA

$$\text{ETA}_u = \frac{(p_{\text{dep}} - p_u) \cdot T_{\text{ruta}}}{v_u \cdot 1000}$$

Donde:
- $p_{\text{dep}}$ = progreso normalizado del punto de salida $\in [0,1]$
- $p_u$ = progreso actual de la unidad $u$
- $T_{\text{ruta}} = N \cdot 800 \text{ ms}$ = duración total estimada de la ruta
- $v_u$ = factor de velocidad de la unidad

$$\text{ETA}_{\text{final}} = \min_{u \in U_{\text{pendientes}}} \text{ETA}_u$$

---

## 8. Diagrama de Secuencia — Interacción del Usuario

Flujo completo de una sesión típica de usuario: selección de ruta, planificación de viaje y seguimiento de unidad.

```mermaid
sequenceDiagram
    actor User as Usuario
    participant SB as Sidebar
    participant Store as Zustand Store
    participant Map as MapView
    participant Hook as useUnitSimulation
    participant OSM as OpenStreetMap

    User->>SB: Abre la aplicación
    Map->>OSM: Solicita tiles (z=15, Acapulco)
    OSM-->>Map: Tiles PNG
    Store-->>SB: units[ ], routes[ ]
    SB-->>User: Lista de unidades y rutas

    User->>SB: Pulsa "Iniciar" simulación
    SB->>Store: startSimulation()
    Store-->>Hook: isSimulating = true
    loop Cada 200 ms
        Hook->>Store: updateUnitPosition(id, [lat,lng], progress, status)
        Store-->>Map: Re-render UnitMarker
    end

    User->>SB: Selecciona "Coloso - Cine Río"
    SB->>Store: setActiveRoute('ruta-coloso')
    Store-->>Map: Ruta activa resaltada (weight=5)
    Store-->>SB: TripPlanner habilitado

    User->>SB: Pulsa "📍 Punto de salida"
    SB->>Store: setSelectionMode('departure')
    Store-->>Map: CSS cursor: crosshair

    User->>Map: Click en el mapa
    Map->>Map: snapToNearestPoint(click, coords)
    Map->>Store: setDeparturePoint({index, position})
    Store-->>SB: departurePoint actualizado

    User->>SB: Pulsa "🏁 Punto de destino"
    SB->>Store: setSelectionMode('destination')
    User->>Map: Click en el mapa
    Map->>Store: setDestinationPoint({index, position})
    Store-->>SB: Mostrar distancia y ETA calculados

    User->>SB: Pulsa "◎ Mi ubicación"
    Map->>Store: requestFlyToUser()
    Store-->>Map: flyToUserRequested = true
    Map->>Map: map.flyTo(userLocation, zoom=17)
```

---

## 9. Diagrama de Estructura de Datos

Define los modelos de datos internos del sistema y sus relaciones.

```mermaid
erDiagram
    ROUTE {
        string id PK
        string name
        string color
        GeoJSON geojson
    }

    UNIT {
        string id PK
        string name
        string routeId FK
        float progress
        array_float position
        float speed
        enum status
    }

    GEOJSON_FEATURE_COLLECTION {
        string type
        array features
    }

    GEOJSON_FEATURE {
        string type
        Geometry geometry
        object properties
    }

    GEOJSON_GEOMETRY {
        string type
        array coordinates
    }

    TRIP_POINT {
        int index
        array_float position
    }

    USER_LOCATION {
        array_float position
        float accuracy
    }

    ROUTE ||--o{ UNIT : "asignada a"
    ROUTE ||--|| GEOJSON_FEATURE_COLLECTION : "contiene"
    GEOJSON_FEATURE_COLLECTION ||--|{ GEOJSON_FEATURE : "agrupa"
    GEOJSON_FEATURE ||--|| GEOJSON_GEOMETRY : "describe"
    ROUTE ||--o{ TRIP_POINT : "punto snap sobre"
    UNIT ||--o| TRIP_POINT : "reporta ETA hacia"
```

### Enumeración de estados (`unit.status`)

| Valor | Descripción |
|-------|-------------|
| `on-route` | La unidad se está moviendo activamente por su ruta |
| `arrived` | La unidad completó el recorrido (progress = 1.0) |

### Tipos GeoJSON soportados

| Tipo de geometría | Soporte |
|-------------------|---------|
| `LineString` | ✅ Completo |
| `MultiLineString` | ✅ Completo |
| `Point` | ❌ No utilizado |
| `Polygon` | ❌ No utilizado |

---

## 10. Diagrama de Capas del Sistema

Vista de las capas de abstracción del sistema, desde la infraestructura hasta la interfaz de usuario.

```mermaid
graph TB
    subgraph L4["Capa 4 — Presentación (UI)"]
        direction LR
        C1["Sidebar"]
        C2["MapView / Leaflet"]
        C3["SimulationControls"]
        C4["TripPlanner"]
        C5["UnitList / StatusBadge"]
    end

    subgraph L3["Capa 3 — Estado y Lógica de Negocio"]
        direction LR
        Z["Zustand Store<br/>useAppStore"]
        H1["useUnitSimulation"]
        H2["useGeolocation"]
    end

    subgraph L2["Capa 2 — Utilidades y Algoritmos"]
        direction LR
        U1["interpolate.js<br/>Interpolación lineal"]
        U2["geoUtils.js<br/>Haversine / distancias"]
        U3["snapToRoute.js<br/>Snap point"]
        U4["sortFeatures.js<br/>Greedy chaining"]
    end

    subgraph L1["Capa 1 — Datos"]
        direction LR
        D1["routeRegistry.js"]
        D2["GeoJSON files ×3"]
    end

    subgraph L0["Capa 0 — Infraestructura / APIs Externas"]
        direction LR
        E1["OpenStreetMap Tiles"]
        E2["Browser Geolocation API"]
        E3["Vite Dev Server / Build"]
    end

    L4 <--> L3
    L3 <--> L2
    L2 --> L1
    L3 --> L1
    L4 --> L0
    L3 --> L0
```

---

## Notas Técnicas Adicionales

### Conversión de coordenadas GeoJSON ↔ Leaflet

Un punto crítico del sistema es la inversión de ejes entre el estándar GeoJSON (RFC 7946) y Leaflet:

| Estándar | Orden |
|---------|-------|
| GeoJSON | `[longitude, latitude]` |
| Leaflet | `[latitude, longitude]` |

La función `extractCoordinates()` realiza esta conversión automáticamente al procesar los archivos JSON:

```js
geometry.coordinates.forEach(([lng, lat]) => coords.push([lat, lng]))
```

### Fórmula de Haversine

Usada en `geoUtils.js` para calcular distancias geodésicas exactas entre dos puntos sobre la superficie terrestre:

$$d = 2R \cdot \arctan2\!\left(\sqrt{a},\, \sqrt{1-a}\right)$$

$$a = \sin^2\!\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1 \cdot \cos\phi_2 \cdot \sin^2\!\left(\frac{\Delta\lambda}{2}\right)$$

Donde $R = 6{,}371{,}000 \text{ m}$ es el radio medio de la Tierra.

### Patrón de refs para el loop de simulación

El hook `useUnitSimulation` utiliza `useRef` para evitar la re-creación del `setInterval` en cada actualización del estado:

```
isSimulating cambia → useEffect se re-ejecuta → nuevo interval
units cambia       → unitsRef.current = units  (sin re-crear interval)
routes cambia      → routesRef.current = routes (sin re-crear interval)
```

Este patrón es una solución estándar al problema de *stale closure* en React hooks con timers.
