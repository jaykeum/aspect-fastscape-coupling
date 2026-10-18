---
id: parameters
title: Parameters
sidebar_position: 1
---

# `subsection Fastscape` parameters

All entries live under `subsection Mesh deformation / subsection Fastscape`. The list below is the 2.6.0-pre / 3.0.0 set; entries added later (`Use kf distribution function`, `Use kd distribution function`, `Use sea level function`, `Additional output variables`) are noted at the end.

## Grid and coupling

| Parameter | Default | Meaning |
|---|---|---|
| `Maximum surface refinement level` | 1 | Finest ASPECT refinement level that can occur on the top boundary. |
| `Additional fastscape refinement` | 0 | Extra levels for the FastScape grid beyond the ASPECT surface. `dx = extent / (2^(max + additional) × repetitions)`. |
| `Surface refinement difference` | 0 | How many levels coarser than the maximum a surface cell may be. Must cover every cell on the surface or the plugin aborts with "The FastScape mesh is missing data". |
| `Number of fastscape timesteps per aspect timestep` | 5 | Starting number of sub-steps per ASPECT step. |
| `Maximum timestep length` | 10e3 yr | Sub-steps are doubled until each is shorter than this. |
| `Use ghost nodes` | true | Add one ring of nodes outside the ASPECT boundary and apply the FastScape BC there. |
| `Uplift and advect with fastscape` | true | Pass `vz` as uplift and `(vx, vy)` as advection velocity to FastScape, and take the elevation from FastScape's own state after the first step. If false, ASPECT's surface heights are sent every step and FastScape only erodes. |
| `Node tolerance` | 0.001 | Tolerance, in units of `dx`, for deciding that an ASPECT face point coincides with a FastScape node. |
| `Fastscape seed` | 1000 | Seed of the random noise added to the initial surface. |
| `Initial noise magnitude` | 5 m | Amplitude of that noise (± on every interior node at step 1). |
| `Vertical exaggeration` | -1 | Vertical exaggeration in the FastScape VTK output. |
| `Y extent in 2d` | 100e3 m | Width of the FastScape strip when ASPECT runs in 2D. |
| `Average out of plane surface topography in 2d` | true | In 2D, average the strip along y before returning it. |

## Boundary conditions (`subsection Boundary conditions`)

| Parameter | Default | Meaning |
|---|---|---|
| `Front`, `Back`, `Left`, `Right` | 1 | FastScape boundary flag per side: `1` fixed elevation, `0` open. With ghost nodes the flag acts on the ghost ring. |
| `Left mass flux`, `Right mass flux`, `Back mass flux`, `Front mass flux` | 0 | Sediment flux through the side in m²/yr; sets the slope at the ghost node. |
| `Left right ghost nodes periodic`, `Back front ghost nodes periodic` | false | Mirror the opposite side onto the ghost ring; use with periodic ASPECT boundaries. |

## Erosional parameters (`subsection Erosional parameters`)

| Parameter | Default | Symbol |
|---|---|---|
| `Drainage area exponent` | 0.4 | m |
| `Slope exponent` | 1 | n |
| `Multi-direction slope exponent` | 1 | p (−1 selects single-direction flow) |
| `Bedrock river incision rate` | 1e-5 | K_f for bedrock, m^(1−2m)/yr |
| `Sediment river incision rate` | -1 | K_f for sediment thicker than 1 m; −1 means "same as bedrock" |
| `Bedrock diffusivity` | 1e-2 | K_d for bedrock, m²/yr |
| `Sediment diffusivity` | -1 | K_d for sediment; −1 means "same as bedrock" |
| `Bedrock deposition coefficient` | 1 | G for bedrock |
| `Sediment deposition coefficient` | -1 | G for sediment; −1 means "same as bedrock" |
| `Use a fixed erosional base level` | false | Pin fixed boundaries at `Erosional base level` instead of at the ASPECT edge elevation |
| `Erosional base level` | 0 m | That base level |
| `Orographic elevation control`, `Orographic wind barrier height`, `Elevation factor`, `Wind barrier factor`, `Stack orographic controls`, `Flag to use orographic controls`, `Wind direction` | off | Reduce `kf`/`kd` above a given elevation or in the lee of a barrier |

## Marine parameters (`subsection Marine parameters`)

| Parameter | Default | Meaning |
|---|---|---|
| `Use marine component` | false | Switch marine deposition on; below sea level `kf = 0` and `kd` becomes the silt/sand mixture |
| `Sea level` | 0 m | Sea level relative to the initial surface |
| `Sand porosity`, `Silt porosity` | 0.0, 0.0 | Surface porosities |
| `Sand e-folding depth`, `Silt e-folding depth` | 1e3, 1e3 m | Compaction depth scales |
| `Sand-silt ratio` (renamed `Silt fraction` after 3.0.0) | 0.5 | Fraction of silt in the incoming sediment |
| `Depth averaging thickness` | 1e2 m | Thickness over which the sand/silt ratio is averaged |
| `Sand transport coefficient`, `Silt transport coefficient` | 500, 250 m²/yr | Marine diffusivities |
| `Sediment rain rates`, `Sediment rain time intervals` | 0 | Flat sediment addition below sea level, piecewise in time |

## Added after 3.0.0

- `Use kf distribution function` / `Use kd distribution function` with a function subsection: spatially variable `kf` and `kd`.
- `Use sea level function`: time-dependent sea level.
- `Additional output variables`: choose `kf`, `kd` or `uplift_rate` as the extra field written to the FastScape VTK.
- The ghost-node update gained an extra `vz` term that pulls the ghost elevation toward the inner neighbour each sub-step.
