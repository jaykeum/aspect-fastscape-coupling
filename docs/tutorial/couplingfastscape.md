---
id: couplingfastscape
title: How the coupling works
sidebar_position: 1
---

# Coupling ASPECT with FastScape

ASPECT solves the tectonic problem in three dimensions. FastScape (Braun & Willett, 2013; Yuan et al., 2019) solves river incision, hillslope diffusion and deposition on a two-dimensional grid that represents the top surface of the ASPECT box. ASPECT drives the run and calls FastScape through the `fastscape` mesh deformation plugin; FastScape never calls ASPECT.

## Prerequisites

- **FastScape built as a shared library.** Clone `fastscapelib-fortran` and build it with `BUILD_FASTSCAPELIB_SHARED=ON` (and `USE_FLEXURE=ON` if you want flexure available). The build produces `libfastscapelib_fortran.so`.
- **ASPECT configured with FastScape.** Pass `-DFASTSCAPE_DIR=/path/to/fastscapelib-fortran/build` to ASPECT's `cmake`. The configure summary prints `FASTSCAPE: ON` when it is found, and `--help` lists the `Fastscape` subsection under `Mesh deformation`.
- **deal.II with p4est and Trilinos**, as for any 3D ASPECT run. The coupled runs shown here used ASPECT 2.6.0-pre.
- FastScape runs in serial on MPI rank 0. ASPECT itself runs in parallel as usual; the surface data are gathered to rank 0 before every FastScape call and the result is replicated back.

## The loop

Each ASPECT time step contains one FastScape call. The figure cycles through the five stages.

![ASPECT-FastScape coupling loop](/img/aspect-fastscape-loop.svg)

1. **ASPECT solves one Stokes step.** The velocity field is known everywhere in the box. The plugin reads it on the top boundary only. Time step 0 is skipped; FastScape is initialized and first called at time step 1.

2. **Velocities go to the FastScape grid.** The FastScape grid is regular and is built once from the box extent and the surface refinement level (see [grid and ghost nodes](#the-fastscape-grid-and-ghost-nodes)). ASPECT evaluates the velocity at points on each top face that coincide with FastScape nodes and copies `(vx, vy, vz)` into the FastScape arrays by index. Points on more refined faces that fall between FastScape nodes are ignored. The velocity is the instantaneous solution of the current step, not a time average.

   On the first call the elevation array is also filled from ASPECT. From the second call on, the elevation is **copied from FastScape's own state** (`fastscape_copy_h`): FastScape keeps the master topography, at its own resolution, and ASPECT's surface follows it.

3. **FastScape advances the same interval, in sub-steps.** `vz` is passed as the uplift rate (`fastscape_set_u`) and `(vx, vy)` as the advection velocity (`fastscape_set_v`). The ASPECT time step is divided into `N` FastScape sub-steps; `N` starts at `Number of fastscape timesteps per aspect timestep` and doubles until each sub-step is shorter than `Maximum timestep length`. Within each sub-step FastScape applies advection, uplift, stream-power incision, hillslope diffusion and, if enabled, deposition and marine processes.

4. **FastScape returns the new topography.** After the last sub-step the plugin copies `h_new` and forms a vertical velocity on every grid node:

   ```
   v_mesh,z = (h_new − h_old) / Δt_ASPECT
   ```

   `h_old` is the elevation before the FastScape call. This velocity contains everything that moved the surface during the step: tectonic uplift, horizontal advection of relief, erosion and deposition. There is no separate uplift-removal step; compare the [DES3D–goSPL scheme](../reference/aspect-vs-des.md), where goSPL returns an erosion-only change because the DES nodes have already moved.

5. **ASPECT moves its top boundary.** The node velocities are put into a uniform-grid interpolation table, replicated to all MPI ranks, and imposed as the **vertical** component of the mesh velocity on the top boundary. The horizontal mesh velocity on the top boundary is zero: the ASPECT box does not widen, and horizontal transport of topography happens only inside FastScape through `(vx, vy)`. Material eroded from or deposited on the surface is tracked with compositional fields (for example `sediment_age` and `deposition_depth`, set through the top boundary composition).

## What crosses the interface

| Direction | What is passed | When |
|---|---|---|
| ASPECT → FastScape, once | surface elevation of the ASPECT mesh (plus random noise of `Initial noise magnitude`) | time step 1 |
| ASPECT → FastScape | `vx, vy, vz` on the top boundary, in m/yr | every step |
| ASPECT → FastScape | erosional parameters (`kf`, `kd`, `m`, `n`, `G`, `p`), marine parameters, sea level | every step |
| FastScape → ASPECT | `h_new` → `(h_new − h_old)/Δt` as a z mesh velocity | every step |
| FastScape → ASPECT (optional) | VTK output of the FastScape grid in `output/fastscape/` | at the graphical output interval |

## The FastScape grid and ghost nodes

![FastScape grid with ghost nodes](/img/ghost-nodes.svg)

The grid spacing is

```
dx = X extent / (2^(Maximum surface refinement level + Additional fastscape refinement) × X repetitions)
```

so with `X extent = 100 km`, `X repetitions = 5`, `Maximum surface refinement level = 4` and `Additional fastscape refinement = 1` the grid has 161 nodes in x and `dx = 625 m`. The FastScape grid can therefore be finer than the ASPECT surface mesh; `Surface refinement difference` tells the plugin how much coarser the coarsest surface cell may be, so that every FastScape node still receives a value.

With `Use ghost nodes = true` one extra ring of nodes is added outside the ASPECT boundary. FastScape's boundary condition (fixed elevation or open, per side, and optionally periodic) acts on this ring instead of on the ASPECT edge. In the 2.6.0-pre / 3.0.0 code the ghost nodes get their elevation from the inner neighbour at initialization and copy the neighbour's `(vx, vy, vz)` at every sub-step. Later versions add a term to `vz` that pulls the ghost elevation toward the neighbour each sub-step. When the plugin builds the velocity table for ASPECT, the ring is dropped and only the inner grid is used.

## Time stepping

![Sub-stepping](/img/substeps.svg)

FastScape is called at every ASPECT step. ASPECT's time step is set by its own CFL condition, so the FastScape interval is uneven in time. If an ASPECT step is long, the sub-step doubling keeps each FastScape step below `Maximum timestep length`; in the core-complex runs this was 10 kyr.

## Console output

Each step prints how FastScape was run:

```
   Initializing FastScape... 6 levels, cell size: 625 m.
   Executing FastScape... 5 timesteps of 3400 years.
      Writing initial VTK...
```

The number of sub-steps and their length change from step to step with ASPECT's `Δt`.

## Known limitations

- The FastScape grid covers exactly the ASPECT box (plus the ghost ring). This is fine for an Eulerian box with outflow through the sides, which is how extension is normally imposed in ASPECT, but it means the surface model cannot follow material that leaves the box.
- The plugin requires the `box` or `box with lithosphere boundary indicators` geometry and can be attached to the top boundary only.
- FastScape is serial. For large grids it can take a noticeable share of the wall time; the timing table at the end of the log reports `FastScape plugin` and `Execute FastScape` separately.
- A restart reads the FastScape state (elevation, basement, silt fraction) back from the checkpoint; the FastScape VTK series restarts its numbering from the restart step.
- In 2D, FastScape still runs on a strip of width `Y extent in 2d`; the result is averaged along y before it is returned, which is not needed in 3D.

## References

- Braun, J., & Willett, S. D. (2013). A very efficient O(n), implicit and parallel method to solve the stream power equation governing fluvial incision and landscape evolution. *Geomorphology*, 180–181, 170–179.
- Yuan, X. P., Braun, J., Guerit, L., Rouby, D., & Cordonnier, G. (2019). A new efficient method to solve the stream power law model taking into account sediment deposition. *JGR Earth Surface*, 124, 1346–1365.
- Neuharth, D., Brune, S., Wrona, T., Glerum, A., Braun, J., & Yuan, X. (2022). Evolution of rift systems and their fault networks in response to surface processes. *Tectonics*, 41, e2021TC007166. (first application of the ASPECT–FastScape plugin)
- ASPECT manual, section *Mesh deformation: FastScape*: https://aspect-documentation.readthedocs.io/
- FastScape source: https://github.com/fastscape-lem/fastscapelib-fortran
- ASPECT source of the plugin: `source/mesh_deformation/fastscape.cc`
