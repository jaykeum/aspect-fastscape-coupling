---
id: aspect-vs-des
title: ASPECT–FastScape vs DES3D–goSPL
sidebar_position: 2
---

# ASPECT–FastScape vs DES3D–goSPL

The [DES3D–goSPL coupling](https://geoflac.github.io/des3d/docs/tutorial/couplinggospl) was designed after the ASPECT–FastScape scheme, so the two loops look alike: the tectonic code sends surface velocities, the landscape model runs for the same interval, and a surface change comes back. The differences come from one choice: ASPECT keeps an Eulerian box, DES3D moves its nodes with the material.

![ASPECT-FastScape vs DES3D-goSPL](/img/aspect-vs-des.svg)

The figure loops through three stages: the same initial box, one tectonic step of extension, and one surface-process step. In ASPECT the dashed initial box and the current box coincide; in DES3D the current mesh ends up wider than the dashed initial box.

## Where the differences come from

**The box does not widen in ASPECT.** Extension is imposed as outflow through the side walls; the top boundary moves only vertically. FastScape's grid can therefore be built once from the box extent, and horizontal transport of topography is done inside FastScape by advecting `h` with `(vx, vy)`. In DES3D the surface nodes carry the material and the whole surface widens, so goSPL's fixed mesh has to be padded around the initial surface and the DES→goSPL step is an interpolation between two meshes rather than a copy by index.

**Uplift is counted once in different places.** In ASPECT the mesh has not moved when FastScape runs, so FastScape applies the uplift itself and the returned `(h_new − h_old)/Δt` already contains tectonics plus erosion; ASPECT just imposes it as the mesh velocity. In DES3D the nodes have already been displaced by the mechanical step, so goSPL subtracts `v_z·Δt` and returns the erosion-only `Δh`, which DES3D adds to the node coordinates.

**Velocity sampling.** ASPECT passes the instantaneous velocity of the current step. DES3D, which is a dynamic-relaxation code with inertial oscillations, passes `Δcoord/Δt` averaged over the steps since the last coupling event.

**Boundary treatment.** ASPECT adds one ring of ghost nodes and lets FastScape's fixed/open/periodic boundary act on the ring. goSPL uses a padding fraction and a four-letter boundary code (`o` open, `f` fixed, `w` wall) in its own YAML.

**Cadence.** ASPECT calls FastScape every step and sub-steps inside the call. DES3D calls goSPL every `N` steps or every `T` years, and goSPL takes the accumulated interval as one step.

## Same model, two codes

The Gaussian-fault core-complex model of Keum et al. (submitted) has been run with both couplings (Lee et al., DES v2.0, Fig. 9). The two codes agree on the main dome and the basin, and differ in the fine structure of the footwall: DES3D's linear tetrahedra localize shear into thinner bands and produce more discrete secondary faults and a rougher scarp, while ASPECT's Q2–Q1 hexahedra spread the same shear zone over a wider band. Parameter files for the two codes should be compared field by field before such a comparison is made; `K_f`, `K_d` and the strain-weakening interval are easy to leave inconsistent.
